import { adminStorage } from "../config/firebase.js";
import multer from "multer";

// Set up multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // Initialize multer with memory storage

// Allowed file extensions
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];
const VIDEO_EXTENSIONS = ["mp4", "avi", "mov", "wmv", "mkv"];

// Function to handle multiple image and video uploads to Firebase Storage
const uploadFiles = async (files) => {
  try {
    const bucket = adminStorage.bucket();

    const uploadPromises = files.map(async (file) => {
      const fileExtension = file.originalname.split(".").pop().toLowerCase();
      const isVideo = VIDEO_EXTENSIONS.includes(fileExtension);
      const isImage = IMAGE_EXTENSIONS.includes(fileExtension);

      if (!isImage && !isVideo) {
        throw new Error(`Unsupported file type: ${file.originalname}`);
      }

      const timestamp = Date.now();
      const sanitizedFileName = file.originalname.replace(/\s+/g, "_"); // Replace spaces with underscores
      const filePath = `prop-cid/${timestamp}_${sanitizedFileName}`; // No folder structure
      const firebaseFile = bucket.file(filePath);

      const blobStream = firebaseFile.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        blobStream.on("error", (error) => reject(error));

        blobStream.on("finish", async () => {
          try {
            const [url] = await firebaseFile.getSignedUrl({
              action: "read",
              expires: "03-09-2491",
            });
            resolve({
              url,
              type: isVideo ? "video" : "image",
              name: sanitizedFileName,
            });
          } catch (err) {
            reject(new Error("Failed to generate signed URL"));
          }
        });

        blobStream.end(file.buffer);
      });
    });

    const fileUrls = await Promise.all(uploadPromises);
    return fileUrls; // Returns an array of objects { url, type, name }
  } catch (error) {
    throw new Error("Error uploading files: " + error.message);
  }
};

// Export functions as ES modules
export { uploadFiles, upload };
