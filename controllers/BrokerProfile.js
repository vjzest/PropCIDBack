import admin from "firebase-admin";
const db = admin.firestore();

// Fetch broker profile
export const getBrokerProfile = async (req, res) => {
  try {
    const email = req.user.email;

    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .where("userType", "==", "broker")
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Broker profile not found" });
    }

    const brokerData = snapshot.docs[0].data();

    res.status(200).json(brokerData);
  } catch (error) {
    console.error("Error fetching broker profile:", error);
    res.status(500).json({ message: "Error fetching broker profile", error });
  }
};

// Update broker profile
export const updateBrokerProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const updateData = req.body;

    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .where("userType", "==", "broker")
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ message: "No broker found with this email" });
    }

    const brokerDoc = snapshot.docs[0];
    await brokerDoc.ref.update(updateData);

    res.status(200).json({
      message: "Broker profile updated successfully",
      updatedData: updateData,
    });
  } catch (error) {
    console.error("Error updating broker profile:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Upload broker profile image
export const uploadProfileImage = async (req, res) => {
  try {
    const email = req.user.email;
    const imageUrl = req.file?.path;

    if (!imageUrl) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .where("userType", "==", "broker")
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ message: "No broker found with this email" });
    }

    const brokerDoc = snapshot.docs[0];
    await brokerDoc.ref.update({ profileImage: imageUrl });

    res.status(200).json({
      message: "Profile image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res
      .status(500)
      .json({
        message: "Failed to upload profile image",
        error: error.message,
      });
  }
};
