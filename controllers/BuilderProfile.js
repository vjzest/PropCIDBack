import { db, bucket } from "../config/firebase.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";
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
// 🔹 Delete Builder by UID (from Firestore and Firebase Auth if needed)
// DELETE /api/builder/:uid

export const deleteBuilderByUid = async (req, res) => {
  const { uid } = req.params;

  // Get the ID token from the request's Authorization header
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  try {
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.uid !== uid) {
      return res.status(403).send({ message: "Forbidden" });
    }

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data();

    // Delete Firestore user doc
    await userRef.delete();

    // Delete profile image from Firebase Storage
    if (userData.profileImage) {
      const imagePath = decodeURIComponent(
        userData.profileImage.split("/o/")[1].split("?alt=")[0]
      );
      const file = bucket.file(imagePath);
      await file.delete().catch((err) => {
        console.warn("Failed to delete profile image:", err.message);
      });
    }

    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(uid);

    res.status(200).json({ message: "Builder deleted successfully" });
  } catch (error) {
    console.error("Error deleting builder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
