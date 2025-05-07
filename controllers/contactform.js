import { db, admin } from "../config/firebase.js";


// POST /api/contact - Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const contactRef = await db.collection("contacts").add({
      name,
      email,
      phone: phone || null,
      subject,
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true, id: contactRef.id });
  } catch (err) {
    console.error("Error saving contact form:", err);
    return res.status(500).json({ error: "Failed to save contact form" });
  }
};

// GET /api/contact - Retrieve all contact submissions
export const getAllContacts = async (req, res) => {
  try {
    const snapshot = await db
      .collection("contacts")
      .orderBy("createdAt", "desc")
      .get();

    const contacts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ success: true, contacts });
  } catch (err) {
    console.error("Error fetching contacts:", err);
    return res.status(500).json({ error: "Failed to fetch contacts" });
  }
};
