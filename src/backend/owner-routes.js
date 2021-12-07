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
    var publisherQuery = "Select name, publisherID from Publisher";
    var publishers = await client.query(publisherQuery);
    publishers = publishers.rows;
    console.log(publishers);
    res.render("createBook.ejs", { publishers });
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
    } = req.body;
    console.log(req.body);
    var text =
      "INSERT INTO BOOK(ISBN, title, genre, numPages, price, cost, stock, display) VALUES($1, $2, $3, $4, $5, $6, $7, $8)";
    values = [
      ISBN,
      title,
      genre,
      numPages,
      Math.floor(parseFloat(price) * 100),
      Math.floor(parseFloat(cost) * 100),
      stock,
      display,
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
  app.get("/createPublisher", (req, res) => {
     res.render("createpublisher.ejs", { req });
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
    res.sendStatus(200);
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

    // var text = "INSERT into StoreOrder(ownerID) VALUES($1)";
    // values = [ownerID];
    // var qe = await client
    //   .query(text, values)
    //   .catch((e) => console.error(e.stack));

    console.log("done")

    res.redirect(`http://localhost:3000/book?isbn=${isbn}`);
    
  });
};
