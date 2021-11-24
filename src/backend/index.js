//setup backend
require("dotenv").config();
const express = require("express");
const app = express();
var session = require("express-session");
const path = require("path");
const _dirname = path.resolve();

var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Sessions
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "comp 3005",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 10 * 60000,
      httpOnly: false,
    },
  })
);

//connection to postgres database
const { Client } = require("pg");

//set up the connection to the database by specifying values
console.log(process.env.PGHOST);
const client = new Client({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

//connection to database
client.connect();

// Routes
var customer_routes = require("./customer-routes")(app, client);
var owner_routes = require("./owner-routes")(app, client);

app.use(
  "/css",
  express.static(path.join(_dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(_dirname, "node_modules/bootstrap/dist/js"))
);
app.use("/js", express.static(path.join(_dirname, "node_modules/jquery/dist")));

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.get("/login", (req, res) => {
  res.render("loginPage.ejs", { req });
});

// SHARED ROUTES



// GET query a certain book based on isbn
app.get("/book", urlencodedParser, async function (req, res) {
  let { isbn } = req.query;

  var text = `SELECT book.*, coalesce(STRING_AGG(author.name,','),'No author') as author_list
              FROM Book left join Author using (isbn)
              WHERE isbn = $1 group by isbn, title, genre, numPages, price`
  values = [parseInt(isbn)]
  var qe = await client
    .query(text, values)
    .catch((e) => console.error(e.stack))

  if (qe.rows.length === 0) {
    console.log("book not found in table")
    return callback(err);
  }

  userType = req.session?.user ? req.session.user.type : "unauthorized";
  
  if (userType == "unauthorized") {
    res.redirect("/");
  } else {
    res.render("partials/book.ejs", { book: qe.rows[0], userType: userType });
  }
});

// VIEW all books
app.get("/viewBooks", async (req, res) => {
  var text = "SELECT book.*, coalesce(STRING_AGG(author.name,','),'No author') as author_list from Book left join Author using (isbn) group by isbn, title, genre, numPages, price";
  values = [];
  var qe = await client
    .query(text, values)
    .catch((e) => console.error(e.stack));

  userType = req.session?.user ? req.session.user.type : "unauthorized";

  if (userType == "unauthorized") {
    res.redirect("/");
  } else {
    res.render("viewBooks.ejs", { books: qe.rows, userType: userType });
  }
});
// ENDPOINTS BABY

// -------------------------------------------------- //
// --------- THIS IS CUSTOMER STUFF ----------------- //
// -------------------------------------------------- //

// DONE KASH ----- POST user creation (creates a customer and adds data into Customer, BillingShipping, Address)
// {street, streetNumber, postalCode, province, country} = req.body.billingAddress
// 'INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES($1, $2, $3, $4, $5)'
// {street, streetNumber, postalCode, province, country} = req.body.shippingAddress
// 'INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES($1, $2, $3, $4, $5)'
// {creditCardName, creditCardNumber, cvv, expiry} = req.body.billing
// 'INSERT INTO BillingShipping(creditCardName, creditCardNumber, cvv, expiry, billingAddressID, shippingAddressID) VALUES($1, $2, $3, $4, $5, $6)'
// {name, email, password} = req.body.customer
// 'INSERT INTO Customer(name, email, password, BSID) VALUES($1, $2, $3, $4)'

// DONE TOBY----- GET user can search the bookstore by bookname, author name, ISBN, genre, etc. (extra marks wildcard title search)
// {search} = req.body.book
// 'SELECT * FROM Book WHERE ISBN LIKE '%$1%' OR title LIKE '%$1%' OR genre LIKE '%$1%''
// let'SELECT * FROM Author WHERE name LIKE '%$1%''

// DONE KASH ----- GET query a certain book based on isbn
// {ISBN} = req.body.book
// let queryText = 'SELECT title from BOOK where ISBN like $1% LIMIT 1'

// DONE KASH ----- POST add books to cart (involve generating an order)
// {customerID} = req.body.customer
// first check if there is an uncompleted order for the user
// 'SELECT * FROM CustomerOrder WHERE customerID = $1 AND completed = $2'
// if there are no results in the query, create a new customer order
// 'INSERT INTO CustomerOrder(date, customerID)
// then use the uncompleted customer order and fill with the book
// {quantity, ISBN} = req.body.book
// 'INSERT INTO SoldBooks(quantity, customerOrderID, ISBN) VALUES($1, $2, $3)

// DONE KASH ----- PUT update order with billing shipping info (first create the entry in BillingShipping, need to check here if they want to use the data already in customer)
// {street, streetNumber, postalCode, province, country} = req.body.billingAddress
// 'INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES($1, $2, $3, $4, $5)'
// {street, streetNumber, postalCode, province, country} = req.body.shippingAddress
// 'INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES($1, $2, $3, $4, $5)'
// {creditCardName, creditCardNumber, cvv, expiry, customerOrderID} = req.body
// 'INSERT INTO BillingShipping(creditCardName, creditCardNumber, cvv, expiry, billingAddressID, shippingAddressID) VALUES($1, $2, $3, $4, $5, $6)'
// 'UPDATE CustomerOrder SET BSID = $1 WHERE customerOrderID = $2'

// DONE KASH ----- PUT add into the order a random tracking url when requested
// 'UPDATE CustomerOrder SET trackingNumber = $1 WHERE customerOrderID = $2'

// DONE MAYANK----- GET check previous order reciepts (BONUS)
// 'SELECT * FROM CustomerOrder WHERE customerID = $1'

// ----- GET Stripe Portal for checkout (BONUS)

// ----------------------------------------------- //
// --------- THIS IS OWNER STUFF ----------------- //
// ----------------------------------------------- //

// DONE KASH ----- POST endpoint to add book to Book table (adds to the Book table, add multiple authors at the same time)
// {ISBN, title, genre, numPages, price, cost, stock, display, name} = req.body.book
// 'INSERT INTO BOOK(ISBN, title, genre, numPages, price, cost, stock, display) VALUES($1, $2, $3, $4, $5, $6, $7, $8)'
// 'INSERT INTO Author(name, ISBN) VALUES($1, $2)'

// DONE KASH ----- PUT endpoint to update quantity of a book (update book quantity)
// {quantity, ISBN} = req.body.book
// 'UPDATE BOOK SET quantity = $1 WHERE ISBN = $2'

// DONE KASH ----- PUT endpoint to set a book display option (update book 'display' to true)
// {display, ISBN} = req.body.book
// 'UPDATE BOOK SET display = $1 WHERE ISBN = $2'

// DONE MAYANK ----- Doing POST add publisher info, (adds to publisher table and phone table and address)
// {street, streetNumber, postalCode, province, country} = req.body.address
// {name, email, bankingAccount, addressID} = req.body.publisher
// 'INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES($1, $2, $3, $4, $5)'
// 'INSERT INTO Publisher(name, email, bankingAccount, addressID) VALUES($1, $2, $3, $4)'

// ----- GET report generator -> for sales vs expenditures, sales per genres, sales per author.

// ----- SQL some trigger that checks if a book quantity is below 10 and orders 10 (this might have to be an sql trigger acc), trigger on CustomerOrder

// ----- POST Login stuff (use sessions maybe?) passport

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `Example app listening at http://localhost:${process.env.PORT || 3000}`
  );
});
