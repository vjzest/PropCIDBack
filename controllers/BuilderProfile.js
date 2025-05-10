import { db, bucket } from "../config/firebase.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// 🔹 Get Builder by UID (Fetch user data from the `users` collection)
export const getBuilderByUid = async (req, res) => {
  const { uid } = req.params;
  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists)
      return res.status(404).send({ error: "User not found" });

    const userData = userDoc.data();
    res.send(userData);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send({ error: "Failed to fetch user profile" });
  }
};

// 🔹 Update Builder by UID (Update user data in the `users` collection)
export const updateBuilderByUid = async (req, res) => {
  const { uid } = req.params;

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const data = req.body;

    // If image is sent
    if (req.file) {
      const fileName = `profileImages/${uid}_${Date.now()}${path.extname(req.file.originalname)}`;
      const file = bucket.file(fileName);

      const uuid = uuidv4();

      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
          metadata: {
            firebaseStorageDownloadTokens: uuid,
          },
        },
      });

      const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media&token=${uuid}`;

      data.profileImage = downloadURL;
    }

    // Update Firestore
    await userRef.update(data);

    const updatedDoc = await userRef.get();
    res.status(200).json(updatedDoc.data());
  } catch (error) {
    console.error("Error updating builder profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
