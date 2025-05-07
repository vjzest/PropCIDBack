import express from "express";
import multer from "multer";
import {
  getBrokerProfile,
  updateBrokerProfile,
  uploadProfileImage,
} from "../controllers/BrokerProfile.js";

const router = express.Router();

// Multer setup for profile image upload
const upload = multer({ dest: "uploads/" });

// Route to get broker profile
router.get("/getbroker", getBrokerProfile);

// Route to update broker profile (info only)
router.put("/upadate", updateBrokerProfile);

// Route to upload profile image
router.put("/image", upload.single("profileImage"), uploadProfileImage);

export default router;
