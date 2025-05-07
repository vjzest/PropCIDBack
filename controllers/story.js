import admin from "firebase-admin";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
const db = getFirestore();
const bucket = getStorage().bucket();

// Configure Multer to use memory storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("file"); // 'file' matches the input field's name in the form

// Controller to upload story
export const uploadStory = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: "File upload error" });
    }

    const file = req.file;
    const { Title } = req.body;
    if (!file || !Title) {
      return res.status(400).json({ error: "Missing file or title" });
    }

    try {
      const fileName = `${uuidv4()}_${file.originalname}`;
      const fileUpload = bucket.file(`stories/${fileName}`);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      stream.end(file.buffer);

      stream.on("error", (err) => {
        console.error("Upload error:", err);
        return res.status(500).json({ error: "Upload failed" });
      });

      stream.on("finish", async () => {
        const [url] = await fileUpload.getSignedUrl({
          action: "read",
          expires: Date.now() + 24 * 60 * 60 * 1000, // signed URL expires in 24h
        });

        const isVideo = file.mimetype.startsWith("video/");

        const storyData = {
          Title,
          profileImage: "https://randomuser.me/api/portraits/lego/1.jpg", // Or fetch actual user image
          mediaUrl: url,
          isVideo,
          createdAt: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };

        const storyRef = await db.collection("stories").add(storyData);

        return res.status(200).json({ id: storyRef.id, ...storyData });
      });
    } catch (err) {
      console.error("Error uploading story:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });
};

// Controller to delete a story
export const deleteStory = async (req, res) => {
  const { storyId } = req.params;

  try {
    await db.collection("stories").doc(storyId).delete();
    return res.status(200).json({ message: "Story deleted successfully" });
  } catch (err) {
    console.error("Error deleting story:", err);
    return res.status(500).json({ error: "Failed to delete story" });
  }
};

// Controller to get all active stories
export const getStories = async (_req, res) => {
  try {
    const now = Date.now();
    const snapshot = await db
      .collection("stories")
      .where("expiresAt", ">", now)
      .get();

    const stories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(stories);
  } catch (err) {
    console.error("Error fetching stories:", err);
    return res.status(500).json({ error: "Failed to fetch stories" });
  }
};
// ⏰ Auto-delete expired stories every hour
const deleteExpiredStories = async () => {
  const now = Date.now();

  try {
    const expiredStories = await db
      .collection("stories")
      .where("expiresAt", "<=", now)
      .get();

    if (expiredStories.empty) return;

    expiredStories.forEach(async (doc) => {
      const data = doc.data();
      const fileUrl = data.mediaUrl;
      const filePath = extractStoragePath(fileUrl);

      // Delete from Storage
      if (filePath) {
        try {
          await bucket.file(filePath).delete();
          console.log(`🗑️ Deleted file: ${filePath}`);
        } catch (err) {
          console.warn(` Failed to delete file: ${filePath}`, err.message);
        }
      }

      // Delete Firestore document
      await db.collection("stories").doc(doc.id).delete();
      console.log(`Deleted Firestore story: ${doc.id}`);
    });
  } catch (err) {
    console.error("Error auto-deleting expired stories:", err.message);
  }
};

// Extract Firebase Storage path from signed URL
function extractStoragePath(url) {
  try {
    const match = decodeURIComponent(url).match(/\/stories%2F([^?]+)/);
    return match ? `stories/${match[1]}` : null;
  } catch (err) {
    return null;
  }
}

// Run every hour
setInterval(deleteExpiredStories, 60 * 60 * 1000); // Every hour
