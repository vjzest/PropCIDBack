import { auth as adminAuth, db, admin } from "../config/firebase.js";

// 1️⃣ Signup Controller
export const signup = async (req, res) => {
  const { name, email, password, userType, companyName, licenseNumber } =
    req.body;

  try {
    // Validate user type
    const validTypes = ["user", "broker", "builder", "admin"];
    if (!validTypes.includes(userType)) {
      return res.status(400).json({ error: "Invalid userType" });
    }

    // 1. Create user in Firebase Auth (Admin SDK)
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    // 2. Prepare user payload for Firestore
    const payload = {
      uid,
      name: userRecord.displayName,
      email: userRecord.email,
      userType,
      ...(userType === "builder" && { companyName }),
      ...(userType === "broker" && { licenseNumber }),
      createdAt: new Date(),
    };

    // 3. Save user data to Firestore
    await db.collection("users").doc(uid).set(payload);

    res.status(200).json({
      message: "Signup successful! User created directly.",
      userType,
      user: {
        name: userRecord.displayName,
        email: userRecord.email,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// 2️⃣ Login Controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await adminAuth.getUserByEmail(email);

    // Ensure the password is valid before creating a token
    // You may want to check if the password matches the stored one using Firebase Authentication
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    // Get user data from Firestore
    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User data not found" });
    }

    const userData = userDoc.data();
    res.status(200).json({
      message: "Login successful",
      token: customToken,
      userType: userData.userType,
      
      user: {
        name: userData.name,
        email: userRecord.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Middleware to verify Firebase token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Get the token from Authorization header
    console.log("log",token)
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user info to the request object
    next(); // Call the next middleware or route handler
  } catch (error) {
    console.error("Token verification failed", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
// 4️⃣ Get User Details Controller
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


