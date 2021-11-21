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

app.listen(process.env.PORT || 3000, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT || 3000}`)
})