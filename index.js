//setup backend
const express = require('express')
const app = express()
const port = 3000

//connection to postgres database
const {Client} = require('pg')

//set up the connection to the database by specifying values
const client = new Client ({
    host: 'localhost', // server name or IP address;
    port: 5432,
    database: 'Univeristy_DB',
    user: 'postgres',
    password: 'password'
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})