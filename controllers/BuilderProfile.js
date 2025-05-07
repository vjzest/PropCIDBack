import express, { Request, Response, NextFunction } from "express";  // Correct import for types
import admin from "firebase-admin";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

// Initialize Firestore and Firebase Storage
const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket();

// Setup Multer to handle file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
}).single("profileImage");

// Middleware to handle file upload
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err: multer.MulterError | any) => {  // Type error fixed by explicitly typing `err` as multer error
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: "Multer error: " + err.message });
    } else if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    next();
  });
};

// Profile Update Handler
export const updateBuilderProfile = async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split("Bearer ")[1];

    if (!idToken) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Handle the file (profile image) if uploaded
    let profileImageUrl: string | null = null;  // Explicitly typing as string | null
    if (req.file) {
      const file = req.file;
      const fileName = `${uuidv4()}.${file.originalname.split(".").pop()}`;
      
      // Upload image to Firebase Storage
      const fileUpload = bucket.file(fileName);
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      blobStream.on("finish", async () => {
        profileImageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
      });

      blobStream.on("error", (err: any) => {
        return res.status(500).json({ error: "Error uploading image", details: err });
      });

      blobStream.end(file.buffer);
    }

    // Extract other profile data from request body
    const {
      companyName,
      email,
      phone,
      address,
      registrationNumber,
      about,
      yearsOfExperience,
      completedProjects,
      website,
      specialties,
      certifications,
      totalRevenue,
      activeProjects,
      teamSize,
      awards,
    } = req.body;

    const builderRef = db.collection("builders").doc(uid);

    // Prepare data for updating the profile
    const updateData: Record<string, any> = {  // Use Record to avoid type errors with dynamic keys
      companyName,
      email,
      phone,
      address,
      registrationNumber,
      about,
      yearsOfExperience,
      completedProjects,
      website,
      specialties,
      certifications,
      totalRevenue,
      activeProjects,
      teamSize,
      awards,
    };

    if (profileImageUrl) {
      updateData.profileImage = profileImageUrl; // Add the profile image URL if uploaded
    }

    // Update builder document in Firestore
    await builderRef.set(updateData, { merge: true });

    return res.status(200).json({ message: "Builder profile updated successfully" });
  } catch (error) {
    console.error("Error updating builder profile:", error);
    return res.status(500).json({ error: "Failed to update builder profile" });
  }
};

// Add the route with multer middleware and handler
const router = express.Router();

router.put("/profile", uploadMiddleware, updateBuilderProfile);

export default router;
