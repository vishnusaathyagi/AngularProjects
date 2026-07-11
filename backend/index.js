// 1. ALWAYS load environment variables first!
// The dotenv library reads your '.env' file and injects those values into 'process.env'.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dbPool = require('./src/config/db');

// Initializes a new Express application instance.
// This 'app' object acts as the main engine for your backend—allowing you to 
// define routes (API endpoints), attach middlewares, and listen for incoming HTTP requests.
const app = express();

// The global port configuration. 
// 'process' is a built-in global object provided by Node.js containing system details.
// This line checks 'process.env' for a port from your environment file, defaulting to 5000 if empty.
const PORT = process.env.PORT || 5000;

// Middlewares
// Enables Cross-Origin Resource Sharing (CORS) as a global middleware.
// By default, browsers block frontend apps (like your Angular dev server on port 4200) 
// from making requests to a different backend port (like port 5000). 
// This code sends headers telling the browser: "Allow requests from outside domains."
app.use(cors());

// Built-in Express middleware that parses incoming requests with JSON payloads.
// Crucial for capturing and extracting the dynamic form data sent over by your Angular frontend.
app.use(express.json());

// Import and mount the form management routes
const formRoutes = require('./src/routes/formRoutes');
app.use('/api/forms', formRoutes);

// Simple test route to verify server health
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Backend server is running smoothly.' });
});

// Start listening for incoming traffic
app.listen(PORT, async () => {
  try {
    // Quickly verify database connection availability at startup
    await dbPool.query(`USE \`${process.env.DB_NAME}\`;`);
    console.log(`[Server]: Server running on port ${PORT}`);
    console.log(`[Database]: Connection pool successfully attached to '${process.env.DB_NAME}'.`);
  } catch (error) {
    console.error("[Database Connection Error]:", error.message);
  }
});