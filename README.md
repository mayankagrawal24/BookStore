# COMP3005 BookStore

* A BookStore web application that allows books to be bought and sold *

# Getting Started
1. Clone and open the github repo
2. Head to the "./src/backend" directory
3. Create a database in PostgreSQL, and start your PSQL server
4. Copy the ".env.example" file as ".env" and update all information
```
# Postgres Settings
PGHOST=localhost
PGPORT=5432
PGDATABASE=
PGUSER=postgres
PGPASSWORD=

# Server Settings
PORT=3000
```
5. Set up the DB with the following command (make sure you are in "./src/backend"):
```
node setup
```
6. (Optional) Set up the seed file with the following commands
```
node seed
```
7. Start the server with the following command
```
npm start
```
8. Open the website on localhost:3000 (or whichever port you set)

