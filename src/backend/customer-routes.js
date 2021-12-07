var bodyParser = require("body-parser");
const { Connection } = require("pg");
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function (app, client) {
  app.get("/", function (req, res) {
    if (!req.session || !req.session.user) {
      res.render("index.ejs", { req });
    } else {
      user = req.session.user;
      if (user.type == "customer") {
        res.render("customerHome.ejs", { req });
      } else if (user.type == "owner") {
        res.render("ownerHome.ejs", { req, report: [] });
      }
    }
  });

  // POST user to login
  app.post("/login", urlencodedParser, async function (req, res) {
    var customer_query = "SELECT * FROM customer where email=$1";
    var owner_query = "SELECT * FROM owner where email=$1";
    values = [req.body.username];

    var customer = await client.query(customer_query, values);
    var owner = await client.query(owner_query, values);
    //console.log("owner", owner);
    if (owner.rows.length) {
      data = owner.rows[0];
      if (
        req.body.username == data.email &&
        req.body.password == data.password
      ) {
        user = {
          email: data.email,
          name: data.name,
          ownerID: data.ownerid,
          type: "owner",
        };
        req.session.user = user;
        res.redirect("/");
      } else {
        // user password incorrect
        req.error = "Password incorrect";
        res.render("loginPage.ejs", { req });
      }
    } else if (customer.rows.length) {
      data = customer.rows[0];
      if (
        req.body.username == data.email &&
        req.body.password == data.password
      ) {
        user = {
          customerID: data.customerid,
          email: data.email,
          name: data.name,
          type: "customer",
        };
        req.session.user = user;
        res.redirect("/");
      } else {
        // user password incorrect
        req.error = "Password incorrect";
        res.render("loginPage.ejs", { req });
      }
    } else {
      // user email not found
      req.error = req.body.username + " does not exist.";
      res.render("loginPage.ejs", { req });
    }
  });

  // VIEW for user creation
  app.get("/createCustomer", (req, res) => {
    res.render("createCustomer.ejs");
  });

  // POST user creation (creates a customer and adds data into Customer, BillingShipping, Address)
  app.post("/createCustomer", urlencodedParser, async function (req, res) {
    // insert the billing address into address table
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
    let billingAddressID = qe.rows[0].addressid;

    // insert Shipping address into address table
    let { sStreet, sStreetNumber, sPostalCode, sProvince, sCountry } = req.body;
    text =
      "INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES($1, $2, $3, $4, $5) RETURNING addressID";
    values = [
      sStreet,
      parseInt(sStreetNumber),
      sPostalCode,
      sProvince,
      sCountry,
    ];
    qe = await client.query(text, values).catch((e) => console.error(e.stack));
    let shippingAddressID = qe.rows[0].addressid;

    console.log("ADDRESS IDS:", billingAddressID, shippingAddressID);

    // adding data into billingshipping table
    let { ccName, ccNumber, ccCcv, ccExpiry } = req.body;
    text =
      "INSERT INTO BillingShipping(creditCardName, creditCardNumber, cvv, expiry, billingAddressID, shippingAddressID) VALUES($1, $2, $3, $4, $5, $6) RETURNING BSID";
    values = [
      ccName,
      parseInt(ccNumber),
      parseInt(ccCcv),
      parseInt(ccExpiry),
      billingAddressID,
      shippingAddressID,
    ];
    qe = await client.query(text, values).catch((e) => console.error(e.stack));
    let BSID = qe.rows[0].bsid;
    console.log("BSID", BSID);

    // adding data to Customer table
    let { name, email, password } = req.body;
    text =
      "INSERT INTO Customer(name, email, password, BSID) VALUES($1, $2, $3, $4) RETURNING customerID";
    values = [name, email, password, BSID];
    qe = await client.query(text, values).catch((e) => console.error(e.stack));
    let customerID = qe.rows[0].customerid;
    console.log("customerid", customerID);

    res.sendStatus(200);
  });

  // POST add books to cart (involve generating an order)
  app.post("/addBookToCart", urlencodedParser, async function (req, res) {
    // check if the customer has a uncompleted order in progress
    let { customerID } = req.session.user;
    var text =
      "SELECT * FROM CustomerOrder WHERE customerID = $1 AND completed = $2";
    values = [customerID, false];
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));

    var customerOrderID;
    // if there are no results in the query, create a new customer order
    if (qe.rows.length === 0) {
      console.log("no open order currently");
      // create a new customer order
      text =
        "INSERT INTO CustomerOrder(customerID, completed) VALUES($1, $2) RETURNING customerOrderID";
      values = [customerID, false];
      qe = await client
        .query(text, values)
        .catch((e) => console.error(e.stack));
    }
    // get the customerOrderID
    customerOrderID = qe.rows[0].customerorderid;
    console.log("CUSTOMER ORDER ID: ", customerOrderID);

    // insert into soldBooks table
    let { quantity, ISBN } = req.body;
    console.log(quantity, ISBN);
    var text =
      "INSERT INTO SoldBooks(quantity, customerOrderID, ISBN) VALUES($1, $2, $3)";
    values = [quantity, customerOrderID, ISBN];
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));

    res.redirect("/viewBooks");
  });

  // post edit quantity of books in cart books to cart
  app.post("/editCartQuantity", urlencodedParser, async function (req, res) {
    // insert into soldBooks table
    console.log("Editing", req.body);
    let { quantity, customerOrderID, isbn } = req.body;
    var text =
      "UPDATE SoldBooks SET quantity = $1 WHERE isbn = $2 and customerOrderID = $3";
    values = [parseInt(quantity), parseInt(isbn), parseInt(customerOrderID)];
    console.log(values);
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));

    res.redirect("/viewCart");
  });

  // POST remove book from cart
  app.post("/removeBookCart", urlencodedParser, async function (req, res) {
    // insert into soldBooks table
    let { customerOrderID, isbn } = req.body;
    var text = "DELETE from SoldBooks where customerOrderId = $1 and isbn = $2";
    values = [parseInt(customerOrderID), parseInt(isbn)];
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));

    res.redirect("/viewCart");
  });

  app.get("/viewCart", async function (req, res) {
    userType = req.session?.user ? req.session.user.type : "unauthorized";
    if (userType == "unauthorized") {
      res.redirect("/");
    } else if (userType == "owner") {
      backURL = req.header("Referer") || "/";
      res.redirect(backURL);
    }
    //console.log("CHECK");
    console.log(req.session);
    let { customerID } = req.session.user;
    var text =
      "SELECT * From CustomerOrder natural join SoldBooks natural join Book inner join customer on (CustomerOrder.customerId = Customer.customerId) where customer.customerid = $1 and completed = $2";

    values = [customerID, false];
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));

    // get order total
    let orderTotal = 0;
    qe.rows.forEach((book, i) => {
      orderTotal += book.quantity * book.price;
    });

    res.render("viewCart.ejs", {
      books: qe.rows,
      userType: userType,
      orderTotal: orderTotal,
    });
  });

  // PUT update order with billing shipping info (first create the entry in BillingShipping, need to check here if they want to use the data already in customer)
  app.post("/addBSToOrder", urlencodedParser, async function (req, res) {
    console.log("IN /addBSToOrder");
    userType = req.session?.user ? req.session.user.type : "unauthorized";
    if (userType == "unauthorized") {
      res.redirect("/");
    }
    var BSID;
    let useCustomerBS = req.body.billingShipping == "old" ? true : false;
    let customerID = req.session.user.customerID;

    //get the customerOrderID
    var text =
      "SELECT * FROM CustomerOrder WHERE customerID = $1 AND completed = $2";
    values = [customerID, false];
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));

    customerOrderID = qe.rows[0].customerorderid;
    console.log("THIS IS QE", qe);
    console.log("THIS IS CUSTOMER ORDER ID", customerOrderID);

    // first check if the user wants to use customer attached billingShipping info
    console.log(req.body);
    //let { useCustomerBS, customerID } = req.body;

    // if they dont want to use the saved details
    if (!useCustomerBS) {
      // insert the billing address into address table
      let { bStreet, bStreetNumber, bPostalCode, bProvince, bCountry } =
        req.body;
      var text =
        "INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES($1, $2, $3, $4, $5) RETURNING addressid";
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
      let billingAddressID = qe.rows[0].addressid;

      // insert Shipping address into address table
      let { sStreet, sStreetNumber, sPostalCode, sProvince, sCountry } =
        req.body;
      text =
        "INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES($1, $2, $3, $4, $5) RETURNING addressid";
      values = [
        sStreet,
        parseInt(sStreetNumber),
        sPostalCode,
        sProvince,
        sCountry,
      ];
      qe = await client
        .query(text, values)
        .catch((e) => console.error(e.stack));
      let shippingAddressID = qe.rows[0].addressid;

      console.log("ADDRESS IDS:", billingAddressID, shippingAddressID);

      // adding data into billingshipping table
      let { ccName, ccNumber, ccCcv, ccExpiry } = req.body;
      text =
        "INSERT INTO BillingShipping(creditCardName, creditCardNumber, cvv, expiry, billingAddressID, shippingAddressID) VALUES($1, $2, $3, $4, $5, $6) RETURNING BSID";
      values = [
        ccName,
        parseInt(ccNumber),
        parseInt(ccCcv),
        parseInt(ccExpiry),
        billingAddressID,
        shippingAddressID,
      ];
      qe = await client
        .query(text, values)
        .catch((e) => console.error(e.stack));
      BSID = qe.rows[0].bsid;
      console.log("BSID", BSID);
    } else {
      // if they do want to use their saved billing shipping details
      var text = "SELECT BSID from Customer where customerID = $1 LIMIT 1";
      values = [customerID];
      var qe = await client
        .query(text, values)
        .catch((e) => console.error(e.stack));

      console.log("THIS IS BSID QUERY", qe);
      BSID = qe.rows[0].bsid;
    }

    // create tracking number
    const allCharacters =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let trackingNum = " ";
    for (let i = 0; i < 10; i++) {
      trackingNum += allCharacters.charAt(Math.floor(Math.random() * 10));
    }

    // get the order total
    var text =
      "SELECT * From CustomerOrder natural join SoldBooks natural join Book inner join customer on (CustomerOrder.customerId = Customer.customerId) where customer.customerid = $1 and completed = $2";
    values = [customerID, false];
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));
    let orderTotal = 0;
    qe.rows.forEach((book, i) => {
      orderTotal += book.quantity * book.price;
    });

    // update the order with the billing shipping info
    text =
      "UPDATE CustomerOrder SET BSID = $1, trackingNumber = $2, COMPLETED = $3, total = $4 WHERE customerOrderID = $5";
    values = [parseInt(BSID), trackingNum, true, orderTotal, customerOrderID];
    console.log("THIS IS VALUES", values);
    qe = await client.query(text, values).catch((e) => console.error(e.stack));

    res.redirect("/checkout");
  });

  // post request to finalize a customer order (sets completed to true)
  app.post(
    "/finalizeCustomerOrder",
    urlencodedParser,
    async function (req, res) {
      let { customerOrderID } = req.body;
      var text =
        "UPDATE CustomerOrder completed = $1 where customerOrderID = $2";
      values = [true, parseInt(customerOrderID)];
      var qe = await client
        .query(text, values)
        .catch((e) => console.error(e.stack));

      res.redirect("Pranked.com");
    }
  );

  // PUT add into the order a random tracking url when requested
  app.put("/setTrackingNumber", urlencodedParser, async function (req, res) {
    //update the order tracking number
    let { customerOrderID } = req.body;

    var text =
      "UPDATE CustomerOrder SET trackingNumber = $1 WHERE customerOrderID = $2";
    values = ["SOME RANDO TRACKINGSTRINGBEEP", customerOrderID];
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));

    res.sendStatus(200);
  });

  // ----- GET check previous order reciepts (BONUS)
  app.get("/customer_orders/:id", urlencodedParser, async function (req, res) {
    var id = req.params.id;

    var text =
      "SELECT * From CustomerOrder NATURAL JOIN Customer WHERE customerID = $1 AND completed = 'TRUE'";
    values = [id];
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));

    res.sendStatus(200);
  });

  app.get("/searchBook", async function (req, res) {
    text = `%${req.query.text}%`;
    category = req.query.category;

    // search books
    var book_query = `
       SELECT 
          book.*,
          coalesce(STRING_AGG(author.name,','),'No author') as author_list
       FROM 
          Book left join Author using (isbn)
       WHERE 
          ${category}::TEXT ILIKE $1 AND 
          display=true
       GROUP BY
          isbn, 
          title, 
          genre, 
          numPages, 
          price;`;
    values = [text];
    var qe = await client
      .query(book_query, values)
      .catch((e) => console.error(e.stack));

    if (qe.rows.length) {
      res.send(qe.rows);
    } else {
      res.send("none");
    }
  });

  // POST user to logout
  app.post("/logout", urlencodedParser, function (req, res) {
    console.log("Logging out");
    try {
      req.session.destroy();
      res.redirect("/");
    } catch (err) {
      res.sendStatus(404);
    }
  });

  app.get("/bsPage", urlencodedParser, async function (req, res) {
    userType = req.session?.user ? req.session.user.type : "unauthorized";
    if (userType == "unauthorized") {
      res.redirect("/");
    }
    res.render("bsPage.ejs");
  });

  app.get("/checkout", urlencodedParser, async function (req, res) {
    userType = req.session?.user ? req.session.user.type : "unauthorized";
    if (userType == "unauthorized") {
      res.redirect("/");
    }

    let { customerID } = req.session.user;
    var text =
      "SELECT * From CustomerOrder natural join SoldBooks natural join Book inner join customer on (CustomerOrder.customerId = Customer.customerId) where customer.customerid = $1 and completed = $2";

    values = [customerID, false];
    var qe = await client
      .query(text, values)
      .catch((e) => console.error(e.stack));

    // get order total
    let orderTotal = 0;
    qe.rows.forEach((book, i) => {
      orderTotal += book.quantity * book.price;
    });

    res.render("checkout.ejs", {
      books: qe.rows,
      userType: userType,
      orderTotal: orderTotal,
    });
  });
};
