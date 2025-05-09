import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import Firebase config
import { db } from "./config/firebase.js"; // Make sure this is correctly configured

// Import route files
import authRoutes from "./routes/auth.js";
// import reelRoutes from "./controllers/cloudinaryStore.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
// import BrokerRoutes from "./routes/BrokerRoutes.js";
// import BuilderRoutes from "./routes/BuilderRoutes.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: [
      "https://prop-cid-frontend-git-main-vijay-mauryas-projects.vercel.app",
      "https://propcid.com",
      process.env.CLIENT_URL || "http://localhost:8080"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
// app.use("/api/auth", userRoutes);
// app.use("/api", reelRoutes);
app.use("/v1/property", propertyRoutes);
app.use("/contact", contactRoutes);
app.use("/story", storyRoutes);
// app.use("/broker", BrokerRoutes);
// app.use("/builder", BuilderRoutes);


// 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
