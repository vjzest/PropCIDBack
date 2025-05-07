const express = require("express");
const bodyParser = require("body-parser");
const { notFoundResponse } = require("../utils/responseManager");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Import routes
const propertyRoutes = require("../routes/propertyRoutes");

app.use(cors());

// Middleware
app.use(bodyParser.json()); // to parse JSON request bodies

// User routes
app.use("/v1/property", propertyRoutes);

// Catch all route for 404 (route not found)
app.use((req, res) => {
  notFoundResponse(res, "Route not found");
});

// Start server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// Export the serverless function
module.exports = app;
