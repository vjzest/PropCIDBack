import express from "express";
import { uploadStory, deleteStory, getStories } from "../controllers/story.js"; // Adjust path if needed

const router = express.Router();

// Route to upload a story
router.post("/stories/upload", uploadStory);

// Route to delete a story by ID
router.delete("/stories/:storyId", deleteStory);

// Route to get all active stories
router.get("/stories", getStories);

export default router;
