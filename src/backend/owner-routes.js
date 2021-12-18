var bodyParser = require("body-parser");
const { Connection } = require("pg");
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
module.exports = function (app, client) {
  app.get("/", function (req, res) {
    res.render("index.ejs");
  });

  // VIEW to create a book
  app.get("/createBook", async (req, res) => {
    userType = req.session?.user ? req.session.user.type : "unauthorized";
    if (userType == "unauthorized") {
      res.redirect("/");
    } else if (userType == "customer") {
      backURL = req.header("Referer") || "/";
      res.redirect(backURL);
    }
    var publisherQuery = "Select name, publisherID from Publisher";
    var publishers = await client.query(publisherQuery);
    publishers = publishers.rows;
    console.log(publishers);
    res.render("createBook.ejs", { publishers, userType});
  });

  // POST endpoint to add book to Book table (adds to the Book table, add multiple authors at the same time)
  app.post("/createBook", urlencodedParser, async function (req, res) {
    // insert the book into the Book  Table
    let {
      ISBN,
      title,
      genre,
      numPages,
      price,
      cost,
      stock,
      display,
      names,
      publisherList,
      publisherCut
    } = req.body;
    console.log(req.body);
    var text =
      "INSERT INTO BOOK(ISBN, title, genre, numPages, price, cost, stock, display, publisherCut) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)";
    values = [
      ISBN,
      title,
      genre,
      numPages,
      Math.floor(parseFloat(price) * 100),
      Math.floor(parseFloat(cost) * 100),
      stock,
      display,
      publisherCut
    ];
    console.log(values);
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));

    //adding multiple authors for books
    names = names.split(",");
    names.forEach(async (name) => {
      text = "INSERT INTO Author(name, ISBN) VALUES($1, $2)";
      values = [name, ISBN];
      qe = await client
        .query(text, values)
        .catch((e) => console.error(e.stack));
    });

    //adding the publisher
    text = "INSERT into MAKES(isbn, publisherID) VALUES ($1, $2)";
    values = [ISBN, publisherList];
    qe = await client.query(text, values).catch((e) => console.error(e.stack));

    res.redirect(`http://localhost:3000/book?isbn=${ISBN}`);
  });

  // POST endpoint to update quantity of a book (update book quantity)
  app.post("/updateBookQuantity", urlencodedParser, async function (req, res) {
    //update the book quantity
    console.log("IN UPDATE QUANITY", req.query);
    let { stock } = req.body;
    let { isbn } = req.query;

    var text = "UPDATE BOOK SET stock = $1 WHERE ISBN = $2 RETURNING *";
    values = [stock, parseInt(isbn)];
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));

    res.redirect(`http://localhost:3000/book?isbn=${isbn}`);
  });

  // POST endpoint to set a book display option (update book 'display' to true)
  app.post("/updateBookDisplay", urlencodedParser, async function (req, res) {
    //update the book display
    console.log(req.body)
    let { display } = req.body;
    let { isbn } = req.query;
    display = (display) ? true : false   
    console.log("IN UPDATE display", req.query, display);
    var text = "UPDATE BOOK SET display = $1 WHERE ISBN = $2 RETURNING *";
    values = [display, parseInt(isbn)];
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));

      res.redirect(`http://localhost:3000/book?isbn=${isbn}`);
    });

  // VIEW to create a publisher
  app.get("/createPublisher", urlencodedParser, (req, res) => {
    userType = req.session?.user ? req.session.user.type : "unauthorized";
    if (userType == "unauthorized") {
      res.redirect("/");
    } else if (userType == "customer") {
      backURL = req.header("Referer") || "/";
      res.redirect(backURL);
    }

    res.render("createpublisher.ejs", { req, userType });
  });

  // POST add publisher info, (adds to publisher table and phone table and address)
  app.post("/createPublisher", urlencodedParser, async function (req, res) {
    //insert the Publisher address into address table
    let { bStreet, bStreetNumber, bPostalCode, bProvince, bCountry } = req.body;
    var text =
      "INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES($1, $2, $3, $4, $5) RETURNING addressID";
    values = [
      bStreet,
      parseInt(bStreetNumber),
      bPostalCode,
      bProvince,
      bCountry,
    ];
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));
    let addressID = qe.rows[0].addressid;

    // adding data to publisher table
    let { name, email, bankAccount } = req.body;
    text =
      "INSERT INTO Publisher(name, email, bankingAccount, addressID) VALUES($1, $2, $3, $4) RETURNING publisherID";
    values = [name, email, bankAccount, addressID];
    qe = await client.query(text, values).catch((e) => console.error(e.stack));
    var publisherID = qe.rows[0].publisherid;
    console.log("publisherID", publisherID);

    //adding publisher phone numbers
    var { phoneNums } = req.body;
    phoneNums = phoneNums.split(" ");
    console.log(phoneNums);
    phoneNums.forEach(async (num) => {
      console.log(num);
      text = "INSERT INTO PhoneNumber(publisherID, phoneNumber) VALUES($1, $2)";
      values = [publisherID, num];
      qe = await client
        .query(text, values)
        .catch((e) => console.error(e.stack));
    });
    res.redirect("http://localhost:3000/");
  });

  //post endpoint to put in an order for a book
  app.post("/orderBook", urlencodedParser, async function (req, res) {
    //update the book quantity
    console.log("IN Order Quantity", req.query);
    let stockOrder  = req.body.stockOrder;
    let { isbn } = req.query;

    console.log(stockOrder)
    console.log(isbn)
    console.log(req.session.user)
    ownerID = req.session.user.ownerID
    console.log("end")

    text = "INSERT into StoreOrder(ownerID) VALUES($1) RETURNING orderid";
    values = [ownerID];
    qe = await client
    .query(text, values)
    .catch((e) => console.error(e.stack));

    orderID = qe.rows[0].orderid;
    console.log("Store ORDER ID: ", orderID);

    var text = 
    "INSERT INTO orderedBooks(quantity, orderID, ISBN) VALUES($1, $2, $3)";
    values = [stockOrder, orderID, isbn];
    var qe = await client
    .query(text, values)
    .catch((e) => console.error(e.stack));

    console.log("done")

    res.redirect(`http://localhost:3000/book?isbn=${isbn}`);
    
  });

  app.get("/report", function(req, res) {
    res.render("partials/ownerReport.ejs", { req, report: [] });
  });

  //post endpoint to put in an order for a book
  app.post("/report", urlencodedParser, async function (req, res) {

    let reportType = req.body.type;
    let startDate = req.body.date_start;
    let endDate = req.body.date_end;

    console.log(startDate, endDate)
    values = [startDate, endDate]

    text = ""

    switch (reportType) {
      case 'Book':
        text = 
            "SELECT isbn, title, sum(quantity) as qty, sum(quantity) as qty, sum(quantity * price) as total_price, sum(quantity * cost) as total_cost FROM OrdersView WHERE date >= $1::date AND date <= $2::date GROUP BY isbn, title";
        break;

      case 'Author':
        text = 
            "SELECT name, sum(quantity) as qty, sum(quantity) as qty, sum(quantity * price) as total_price, sum(quantity * cost) as total_cost FROM OrdersView WHERE date >= $1::date AND date <= $2::date GROUP BY name";
        break;

      case 'Genre':
        text = 
            "SELECT genre, sum(quantity) as qty, sum(quantity) as qty, sum(quantity * price) as total_price, sum(quantity * cost) as total_cost FROM OrdersView WHERE date >= $1::date AND date <= $2::date GROUP BY genre";
        break;

      default:
        text = 
            "SELECT isbn, title, sum(quantity) as qty, sum(quantity) as qty, sum(quantity * price) as total_price, sum(quantity * cost) as total_cost FROM OrdersView WHERE date >= $1::date AND date <= $2::date GROUP BY isbn, title";
        break;
    } 

    var qe = await client
    .query(text, values)
    .catch((e) => console.error(e.stack));
  

    if (qe?.rows.length > 0) {
      qe.rows[0]['reportType'] = reportType
    }
    
    
    res.render("partials/ownerReport.ejs", { req, report: qe?.rows });
  });

    // View to view how much the publishers should be transfered
    app.get("/publisherPayouts", async (req, res) => {
      userType = req.session?.user ? req.session.user.type : "unauthorized";
      if (userType == "unauthorized") {
        res.redirect("/");
      } else if (userType == "customer") {
        backURL = req.header("Referer") || "/";
        res.redirect(backURL);
      }

      text = "SELECT * From CustomerOrder natural join SoldBooks natural join Book natural join makes natural join publisher where completed = $1";
      values = [true];
      qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));

      rows = qe.rows;
      //console.log(rows)
      publisherCutValues = {}
      for (const sale of rows) {

        if (publisherCutValues[sale.name] == null) {
          publisherCutValues[sale.name] = 0;
        }

        if (sale.publisherCut == null) {
          sale.publisherCut = 10;
        }

        publisherCutValues[sale.name] += sale.quantity * sale.price * (sale.publisherCut/100);
      }
      console.log(publisherCutValues)
      console.log(Object.entries(publisherCutValues))

      res.render("publisherPayout.ejs", { userType, publisherVals: Object.entries(publisherCutValues)});
    });
};
