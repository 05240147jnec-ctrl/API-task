// src/db.js
// MySQL connection pool. The only file that reads database credentials.
// require('dotenv').config() must run BEFORE this file is imported.
const fs = require('fs');
const mysql2 = require('mysql2/promise');

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'defaultdb',
  waitForConnections: true, // queue requests when all connections are busy
  connectionLimit: 10,
  queueLimit: 0,
};

// Aiven requires SSL. With a CA file we verify the server; without one we
// still encrypt the connection but do not verify the certificate chain.
if ((process.env.DB_SSL || '').toUpperCase() === 'REQUIRED') {
  if (process.env.DB_CA_PATH) {
    poolConfig.ssl = {
      ca: fs.readFileSync(process.env.DB_CA_PATH),
      rejectUnauthorized: true,
    };
  } else {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
}

module.exports = mysql2.createPool(poolConfig);
