import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import Firebase config
import { db } from "./config/firebase.js"; // Ensure firebase.js is correctly configured

import authRoutes from "./routes/auth.js";
import reelRoutes from "./controllers/cloudinaryStore.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import BrokerRoutes from "./routes/BrokerRoutes.js";

const app = express();

// Load environment variables
dotenv.config();

// Firebase Firestore is already initialized in the config file, so no need for a separate database connection.

const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:8080',
  'https://prop-cid-frontend-git-main-vijay-mauryas-projects.vercel.app/'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);


// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/auth", userRoutes);
app.use("/api", reelRoutes);
app.use("/v1/property", propertyRoutes);
app.use("/contact", contactRoutes);
app.use("/story", storyRoutes);
app.use("/broker", BrokerRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
