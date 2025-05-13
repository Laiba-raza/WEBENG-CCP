const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const pinoHttp = require("pino-http");
const logger = require("./configure");

// Load environment variables
dotenv.config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");

// Connect to MongoDB
connectDB();

//starting server
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(pinoHttp({ logger }));

// Middleware for handling user routes
app.use("/api/users", userRoutes);

// Middleware for handling note routes
app.use("/api", noteRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
