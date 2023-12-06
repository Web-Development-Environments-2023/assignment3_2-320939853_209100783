var mysql = require('mysql');
require("dotenv").config();

const config = {
  connectionLimit: 4,
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
};

const pool = mysql.createPool(config);


const createConnection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        console.log("MySQL pool connected: threadId " + connection.threadId);
        resolve(connection);
      }
    });
  });
};

const query = (connection, sql, binding) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, binding, (err, result, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const release = (connection) => {
  return new Promise((resolve, reject) => {
    console.log("MySQL pool released: threadId " + connection.threadId);
    connection.release();
    resolve();
  });
};

module.exports = { pool, createConnection, query, release };