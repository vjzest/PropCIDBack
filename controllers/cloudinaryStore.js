import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Supported file extensions
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];
const VIDEO_EXTENSIONS = ["mp4", "avi", "mov", "wmv", "mkv"];

// Multer disk storage (temporarily save before Cloudinary upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "Procid"); // Absolute path
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir); // Save temporarily to uploads/
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
});

// Dummy data
let reels = [
  {
    id: 1,
    videoUrl:
      "https://res.cloudinary.com/demo/video/upload/v1614152462/dog.mp4",
    owner: "John Doe",
    description: "Beautiful sunset view!",
    likes: 120,
    comments: 45,
    location: "Los Angeles, CA",
    price: "$2,500,000",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 2,
    videoUrl:
      "https://res.cloudinary.com/demo/video/upload/v1614152462/elephants.mp4",
    owner: "Jane Smith",
    description: "Luxury apartment tour",
    likes: 250,
    comments: 60,
    location: "New York, NY",
    price: "$5,800,000",
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
  },
];

// Multer fields
const multiUpload = upload.fields([
  { name: "files", maxCount: 5 }, // Multiple videos/images
  { name: "profileImage", maxCount: 1 }, // Single profile image
]);

router.post("/upload", multiUpload, async (req, res) => {
  try {
    const uploadedFiles = [];

    if (req.files?.files) {
      for (let file of req.files.files) {
        const fileExtension = file.originalname.split(".").pop().toLowerCase();
        const isVideo = VIDEO_EXTENSIONS.includes(fileExtension);
        const resourceType = isVideo ? "video" : "image";

        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: resourceType,
          folder: "reels",
        });

        fs.unlinkSync(file.path); // Delete local file

        uploadedFiles.push({
          url: result.secure_url,
          type: isVideo ? "video" : "image",
          name: file.originalname,
        });
      }
    }

    let profileImageUrl = "";
    if (req.files?.profileImage?.length > 0) {
      const profile = req.files.profileImage[0];

      const result = await cloudinary.uploader.upload(profile.path, {
        resource_type: "image",
        folder: "reels/profile",
      });

      fs.unlinkSync(profile.path);
      profileImageUrl = result.secure_url;
    }

    const videoFile = uploadedFiles.find((file) => file.type === "video");
    const videoUrl = videoFile ? videoFile.url : null;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: "At least one video file is required!",
      });
    }

    const { owner, description, location, price } = req.body;

    const newReel = {
      id: reels.length + 1,
      videoUrl,
      owner,
      description,
      likes: 0,
      comments: 0,
      location,
      price,
      profileImage: profileImageUrl,
      media: uploadedFiles, // All uploaded media (video + images)
    };

    reels.push(newReel);

    res.json({
      success: true,
      message: "Uploaded successfully",
      reel: newReel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
});

router.get("/reels", (req, res) => {
  res.json(reels);
});

export default router;
