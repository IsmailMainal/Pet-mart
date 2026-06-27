// Import required packages
const express = require("express");        // Express framework for creating server & routes
const bodyParser = require("body-parser"); // To parse incoming request bodies (form data)
const mysql = require("mysql2");           // MySQL client (supports MySQL 8+)
const cors = require("cors");              // Enable CORS for frontend-backend communication

// Create Express app
const app = express();

// ---------- MIDDLEWARE ----------

// Allow requests from different origins (frontend → backend)
app.use(cors());

// Parse incoming JSON data
app.use(express.json());

// Parse URL-encoded data (from forms)
app.use(bodyParser.urlencoded({ extended: true }));

// ---------- DATABASE CONNECTION ----------

// Create MySQL connection pool for efficient queries
const db = mysql.createPool({
  host: "localhost",       // Database host
  user: "root",            // Database username
  password: "YOUR DATABASE PASSWORD",   // Database password
  database: "YOUR DATABASE NAME",        // Database name
  port: 3306,              // Database port (default MySQL port)
});

// Test DB connection (optional but recommended)
db.getConnection((err) => {
  if (err) {
    console.error("Database connection failed:", err); // Log connection error
  } else {
    console.log("Connected to MySQL database");       // Success message
  }
});

// ---------- API ROUTES ----------

// GET API to fetch all items
app.get("/api/get", (req, res) => {
  const sqlGet = "SELECT * FROM items"; // SQL query to get all items

  db.query(sqlGet, (error, result) => {
    if (error) {
      console.error("Error fetching items:", error);   // Log DB error
      return res.status(500).json({ error: "Database error" }); // Send error response
    }

    res.status(200).json(result); // Send items as JSON
  });
});

// POST API to add new item
app.post("/api/post", (req, res) => {
  const { name, price, quantity } = req.body;                     // Destructure data from request body
  const sqlInsert = "INSERT INTO items (name, price, quantity) VALUES (?, ?, ?)"; // SQL insert query
  db.query(sqlInsert, [name, price, quantity], (error, result) => {
    if (error) {
      console.log(error); // Log error if insertion fails
    }
  });
});

// DELETE API to remove an item by id
app.delete("/api/remove/:id", (req, res) => {
  const { id } = req.params;                  // Get item id from URL
  const sql = "DELETE FROM items WHERE id = ?"; // SQL delete query
  db.query(sql, id, (err, result) => {
    if (err) {
      console.error(err); // Log error
      res.status(500).send(err); // Send error response
    } else {
      res.send("Item is deleted successfully"); // Success message
    }
  });
});

// GET API to fetch a single item by id
app.get("/api/get/:id", (req, res) => {
  const { id } = req.params;                 // Get item id from URL
  const sqlGet = "SELECT * FROM items WHERE id = ?"; // SQL query to fetch item
  db.query(sqlGet, id, (err, result) => {
    if (err) {
      console.error(err); // Log error
    }
    res.send(result); // Send item data
  });
});

// PUT API to update an item by id
app.put("/api/update/:id", (req, res) => {
  const { id } = req.params;                  // Get item id from URL
  const { name, price, quantity } = req.body; // Get updated data from body
  const sqlUpdate = "UPDATE items SET name = ?, price = ?, quantity = ? WHERE id = ?"; // SQL update query
  db.query(sqlUpdate, [name, price, quantity, id], (err, result) => {
    if (err) {
      console.error(err); // Log error
    }
    res.send(result); // Send updated result
  });
});

// ---------- CART ROUTES ----------

// GET cart items
app.get("/api/cart", (req, res) => {
  const sql = "SELECT * FROM cart"; // SQL query to fetch all cart items
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err); // Send error if any
    res.send(result);                           // Send cart items
  });
});

// ADD to cart
app.post("/api/cart", (req, res) => {
  const { item_id, name, price, quantity } = req.body;                 // Get cart data
  const sql = "INSERT INTO cart (item_id, name, price, quantity) VALUES (?, ?, ?, ?)"; // SQL insert query
  db.query(sql, [item_id, name, price, quantity], (err, result) => {
    if (err) return res.status(500).send(err); // Send error if insertion fails
    res.send(result);                           // Send success result
  });
});

// UPDATE quantity of cart item
app.put("/api/cart/:id", (req, res) => {
  const { id } = req.params;          // Get cart id from URL
  const { quantity } = req.body;      // Get new quantity from body
  const sql = "UPDATE cart SET quantity=? WHERE id=?"; // SQL update query
  db.query(sql, [quantity, id], (err, result) => {
    if (err) return res.status(500).send(err); // Send error if fails
    res.send(result);                           // Send updated result
  });
});

// DELETE cart item
app.delete("/api/cart/:id", (req, res) => {
  const { id } = req.params;       // Get cart id from URL
  const sql = "DELETE FROM cart WHERE id=?"; // SQL delete query
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err); // Send error if fails
    res.send("Item removed");                  // Send success message
  });
});

// ---------- SERVER ----------

// Start server on port 3000
app.listen(3000, () => {
  console.log("Server running on port 3000"); // Log server start message
});
