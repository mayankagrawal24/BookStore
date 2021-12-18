//connection to postgres database
const { Client } = require("pg");
const fs = require('fs');
require("dotenv").config();

//set up the connection to the database by specifying values;
const client = new Client({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

//connection to database
client.connect();

// get the sql files as text
var seed = fs.readFileSync('../../SQL/Seed.sql').toString();

client.query(seed, (err, res) => {
    console.log(err)
    client.end();
    console.log("Successfully seeded db");
});

