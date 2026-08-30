// 1. ALWAYS load environment variables first!
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dbPool = require('./src/config/db');

// Initializes a new Express application instance.
const app = express();

const PORT = process.env.PORT || 5000;

// CORS Security Configuration
const allowedOrigins = [
  'https://angularprojects-fna4.onrender.com', // Live Angular Frontend on Render
  'http://localhost:4200'                      // Local Angular Dev Server
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman or server-to-server calls) or matching allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy blocked access from this origin.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role'], // <-- Added 'x-user-role' here
  credentials: true
};

app.use(cors(corsOptions));

// Built-in Express middleware that parses incoming requests with JSON payloads.
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