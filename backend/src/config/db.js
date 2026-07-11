const mysql = require('mysql2/promise');

// Setting up MySQL connection pool using variables from our .env file
const dbPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,

  // waitForConnections: 
  // True means if all 10 connections are busy, incoming requests will wait in a queue. 
  // False means the server will immediately reject the user with an error if the pool is full.
  waitForConnections: true,

  // queueLimit: 
  // The maximum number of connection requests allowed to wait in line. 
  // 0 means unlimited—requests will wait until the server responds, preventing immediate drops.
  queueLimit: 0,

  // connectionLimit:
  connectionLimit: 10, // Max 10 parallel connections to keep system light
});

// Exporting the database pool so other files can run queries
module.exports = dbPool;