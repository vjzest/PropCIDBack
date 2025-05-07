import express from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getLatestProperties,
} from "../services/propertyServices.js";

import { successResponse, errorResponse } from "../utils/responseManager.js";
import { uploadFiles, upload } from "../controllers/imageController.js"; // ESM import

const router = express.Router();

// Create a new property with images & videos
router.post(
  "/newProperty",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const propertyData = req.body;

      // Handle image uploads
      if (req.files["images"]) {
        const uploadedImages = await uploadFiles(req.files["images"]);
        propertyData.images = uploadedImages.map((file) => file.url); // Store only URLs
      }

      // Handle video uploads
      if (req.files["videos"]) {
        const uploadedVideos = await uploadFiles(req.files["videos"]);
        propertyData.videos = uploadedVideos.map((file) => file.url);
      }

      const newProperty = await createProperty(propertyData);
      successResponse(res, newProperty, "Property created successfully", 201);
    } catch (error) {
      errorResponse(res, error, "Error creating property");
    }
  }
);

// Get all properties
router.get("/getProperties", async (req, res) => {
  try {
    const properties = await getProperties();
    successResponse(res, properties, "Properties fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Error fetching properties");
  }
});

// Get latest properties
router.get("/getLatestProperties", async (req, res) => {
  try {
    const latestProperties = await getLatestProperties();
    successResponse(
      res,
      latestProperties,
      "Latest properties fetched successfully"
    );
  } catch (error) {
    errorResponse(res, error, "Error fetching latest properties");
  }
});

// Get a single property by ID
router.get("/getPropertyById/:id", async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await getPropertyById(propertyId);
    successResponse(res, property, "Property fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Property not found", 404);
  }
});

// Update property with new images & videos (optional)
router.put(
  "/updateProperty/:id",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const propertyId = req.params.id;
      const propertyData = req.body;

      // Handle image uploads
      if (req.files["images"]) {
        const uploadedImages = await uploadFiles(req.files["images"]);
        propertyData.images = uploadedImages.map((file) => file.url);
      }

      // Handle video uploads
      if (req.files["videos"]) {
        const uploadedVideos = await uploadFiles(req.files["videos"]);
        propertyData.videos = uploadedVideos.map((file) => file.url);
      }

      const updatedProperty = await updateProperty(propertyId, propertyData);
      successResponse(res, updatedProperty, "Property updated successfully");
    } catch (error) {
      errorResponse(res, error, "Error updating property");
    }
  }
);

// Delete a property
router.delete("/deleteProperty/:id", async (req, res) => {
  try {
    const propertyId = req.params.id;
    const result = await deleteProperty(propertyId);
    successResponse(res, result, "Property deleted successfully");
  } catch (error) {
    errorResponse(res, error, "Error deleting property");
  }
});

export default router;
