import { auth as adminAuth, db, admin } from "../config/firebase.js";

// 1
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // You can change to SendGrid or another service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use an app password for Gmail if you're using it
  },
});

export const signup = async (req, res) => {
  const { name, email, password, userType, companyName, licenseNumber } =
    req.body;

  try {
    // 1️⃣ Validate userType
    const validTypes = ["user", "broker", "builder", "admin"];
    if (!validTypes.includes(userType)) {
      return res.status(400).json({ error: "Invalid userType" });
    }

    //  Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    //  Validate password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password should be at least 6 characters" });
    }

    //  Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    //  Prepare user payload for Firestore
    const payload = {
      uid,
      name: userRecord.displayName,
      email: userRecord.email,
      userType,
      ...(userType === "builder" && { companyName }),
      ...(userType === "broker" && { licenseNumber }),
      createdAt: new Date(),
      emailVerified: false, // Initially false
    };

    //  Save user data to Firestore
    await db.collection("users").doc(uid).set(payload);

    //  Generate Email Verification Link
    const actionCodeSettings = {
      url: "http://localhost:8080/verify-email", // 🔥 Frontend page (change in production)
      handleCodeInApp: true,
    };

    const verificationLink = await admin
      .auth()
      .generateEmailVerificationLink(email, actionCodeSettings);

    //  Send verification email using Nodemailer
    const mailOptions = {
      from: "your-email@gmail.com", // Sender address
      to: email, // Recipient address
      subject: "Verify Your Email Address", // Email subject
      text: `Please click the following link to verify your email address: ${verificationLink}`, // Email body
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true, // 👈 Add this
      message: "Signup successful! Verification email sent.",
      verificationLink, // 🔥 Remove in production
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ error: error.message });
  }
};

//  Login Controller
// Express backend — safe to use admin SDK
export const login = async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();

    if (!userData.emailVerified) {
      await db.collection("users").doc(uid).update({ emailVerified: true });
    }

    res.status(200).json({
      message: "Login successful",
      userType: userData.userType,
      user: {
        name: userData.name,
        email: decodedToken.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Middleware to verify Firebase token
export const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};

//  Get User Details Controller
export const getUserDetails = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No users found" });
    }

    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({
      message: "User list fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(400).json({ error: error.message });
  }
};
