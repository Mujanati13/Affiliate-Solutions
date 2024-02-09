const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "gateway01.eu-central-1.prod.aws.tidbcloud.com",
  port: 4000,
  user: "44o1HbtaMUVxuXD.root",
  password: "vinesakndi6bI7qq",
  database: "test",
  ssl: {
    rejectUnauthorized: true,
  },
});

db.connect(function (err) {
  if (err) {
    console.error("Error connecting to MySQL database: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database as id ");
});

module.exports = db;
