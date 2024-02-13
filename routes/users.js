var express = require("express");
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
var { db } = require("../utils/db");

router.post("/api/v1/beta/register", function (req, res, next) {
  var { email, password, firstName, lastName, age } = req.body;

  // Check if all required fields are provided
  if (!email || !password || !firstName || !lastName || !age) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Generate username based on first name and last name
  var username = (firstName + lastName).toLowerCase(); // Concatenate and convert to lowercase
  var suffix = 0;

  // Function to check if the username exists in the database
  function checkUsername(callback) {
    var uniqueUsername = username + (suffix === 0 ? "" : suffix); // Append suffix if necessary
    db.query(
      "SELECT * FROM client WHERE username = ?",
      [uniqueUsername],
      function (error, results, fields) {
        if (error) {
          return res.status(500).json({ message: "Internal Server Error" });
        }
        if (results.length === 0) {
          callback(uniqueUsername); // Callback with unique username
        } else {
          suffix++; // Increment suffix if username exists
          checkUsername(callback); // Recursive call to check with new username
        }
      }
    );
  }

  // Call checkUsername function to find a unique username
  checkUsername(function (uniqueUsername) {
    // Hash the password
    bcrypt.hash(password, 10, function (err, hash) {
      if (err) {
        return res.status(500).json({ message: "Internal Server Error" });
      }

      // Insert user into database
      db.query(
        "INSERT INTO users (email, password, firstName, lastName, age, username) VALUES (?, ?, ?, ?, ?, ?)",
        [email, hash, firstName, lastName, age, uniqueUsername],
        function (error, results, fields) {
          if (error) {
            return res.status(500).json({ message: "Internal Server Error" });
          }
          res.status(201).json({ message: "User registered successfully" });
        }
      );
    });
  });
});

router.post("/api/v1/beta/login", function (req, res, next) {
  var { email, password, longExpiration } = req.body; // Add 'longExpiration' to destructuring

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Find user by email in the database
  db.query(
    "SELECT * client FROM client WHERE email = ?",
    [email],
    function (error, results, fields) {
      if (error) {
        return res.status(500).json({ message: "Internal Server Error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Compare the provided password with the hashed password in the database
      bcrypt.compare(password, results[0].password, function (err, result) {
        if (err) {
          return res.status(500).json({ message: "Internal Server Error" });
        }
        if (!result) {
          return res.status(401).json({ message: "Authentication failed" });
        }

        // Set the expiration time based on the 'longExpiration' boolean value
        let expiresIn = "1h"; // Default expiration time
        if (longExpiration) {
          expiresIn = "24h"; // Longer expiration time
        }

        // Generate JWT token with the determined expiration time
        var token = jwt.sign(
          { email: results[0].email, userId: results[0].id },
          "your_secret_key",
          { expiresIn: expiresIn }
        );

        res
          .status(200)
          .json({ message: "Authentication successful", token: token });
      });
    }
  );
});


module.exports = router;
