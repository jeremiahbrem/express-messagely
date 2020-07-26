/** Database connection for messagely. */


const { Client } = require("pg");
const { DB_URI } = require("./config");

const client = new Client({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  database: DB_URI,
  port: 5432
});


client.connect();


module.exports = client;
