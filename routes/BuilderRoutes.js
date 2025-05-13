// routes/builderRoutes.js
import express from "express";
import multer from "multer"; // For handling file uploads
import {
  getBuilderByUid,
  updateBuilderByUid,
  deleteBuilderByUid,
} from "../controllers/BuilderProfile.js";

const router = express.Router();

// Setup multer for file uploads (e.g., profile images)
const upload = multer({ storage: multer.memoryStorage() });

router.get("/:uid", getBuilderByUid);

//
router.put("/:uid", upload.single("profileImage"), updateBuilderByUid);
router.delete("/:uid", deleteBuilderByUid);

export default router;
