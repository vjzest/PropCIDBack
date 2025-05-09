import express from "express";
import {
  signup,
  login,
  getUserDetails,
  verifyFirebaseToken,
} from "../controllers/auth.js";

const router = express.Router();

// Route for Signup
router.post("/signup", signup);

// Route for Login
router.post("/login", login);

// Protected Route that requires token verification
router.get("/protected-route", verifyFirebaseToken, (req, res) => {
  res.json({ message: "This is protected data", user: req.user });
});
// Route to get user details (you can make it a protected route too)
router.get("/user", getUserDetails);

export default router;
