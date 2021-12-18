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
var ddl = fs.readFileSync('../../SQL/DDL.sql').toString();
var views = fs.readFileSync('../../SQL/views.sql').toString();
var triggers = fs.readFileSync('../../SQL/triggers.sql').toString();

ddl = ddl.replace("CREATE DATABASE BookStore;", "");

client.query(ddl, (err, res) => {
    console.log("Successfully added tables db");
});

client.query(views, (err, res) => {
    console.log("Successfully added views");
});

client.query(triggers, (err, res) => {
    console.log("Successfully added triggers");
    client.end()
});



