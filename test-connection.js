var mysql = require('mysql');
require('dotenv').config();

const config = {
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
};

const connection = mysql.createConnection(config);

connection.connect(function(err) {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }

  console.log('Connected to the database as threadId ' + connection.threadId);

  // Close the connection
  connection.end(function(err) {
    if (err) {
      console.error('Error closing the database connection: ' + err.stack);
      return;
    }

    console.log('Connection closed.');
  });
});