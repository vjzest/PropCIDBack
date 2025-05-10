// routes/builderRoutes.js
import express from "express";
import multer from "multer"; // For handling file uploads
import {
  getBuilderByUid,
  updateBuilderByUid,
} from "../controllers/BuilderProfile.js";

const router = express.Router();

// Setup multer for file uploads (e.g., profile images)
const upload = multer({ storage: multer.memoryStorage() });

// 🔹 Get Builder Profile by UID
router.get("/:uid", getBuilderByUid);

// 🔹 Update Builder Profile by UID with optional profile image
router.put("/:uid", upload.single("profileImage"), updateBuilderByUid);

export default router;
