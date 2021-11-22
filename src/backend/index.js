//setup backend
require('dotenv').config()
const express = require('express')
const app = express()

//connection to postgres database
const {Client} = require('pg')

//set up the connection to the database by specifying values
console.log(process.env.PGHOST);
const client = new Client ({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});

//connection to database
client.connect();

//our endpoints and stuff
data  = null
console.log("Before")
client.query('SELECT * FROM student', (err, res) => {
    console.log("during")
    if (err) {
        console.error(err);
        return;
    }
    data = res
    for (let row of res.rows) {
        console.log(row);
    }
    client.end();
});

app.get('/', (req, res) => {
  res.send(data)
})

// ENDPOINTS BABY

// -------- THIS IS CUSTOMER STUFF ----------------- //
// user login (verifies username and password)

// POST user creation (creates a customer and adds data into Customer, BillingShipping, Address)

// GET user can search the bookstore by bookname, author name, ISBN, genre, etc. (extra marks wildcard title search)

// GET query a certain book based on isbn

// POST add books to cart (involve generating an order)

// UPDATE update order with billing shipping info

// UPDATE add into the order a random tracking url when requested

// GET check previous order reciepts (BONUS)

// GET Stripe Portal for checkout (BONUS)

// --------- THIS IS OWNER STUFF ----------------- //

// POST endpoint to add book to Book (adds to the Book table, add multiple authors at the same time)
// INSERT INTO BOOK(ISBN, title, genre, numPages,price, cost,stock,display ) VALUES($1, $2, $3, $4, $5,)

// UPDATE endpoint to update quantity of a book (update book quantity)

// POST endpoint to add a book to display (update book 'display' to true)

// POST endpoint to remove a book from display (update book 'display' to false)

// POST add publisher info, (adds to publisher table and phone table and address)

// GET report generator -> for sales vs expenditures, sales per genres, sales per author.

// SQL some trigger that checks if a book quantity is below 10 and orders 10 (this might have to be an sql trigger acc), trigger on CustomerOrder

// POST Login stuff (use sessions maybe?) passport


app.listen(process.env.PORT || 3000, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT || 3000}`)
})