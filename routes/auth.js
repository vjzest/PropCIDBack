import express from "express";
import {
  signup,
  login,
  getUserDetails,
  verifyToken,
} from "../controllers/auth.js";

const router = express.Router();

// Route: Send OTP

// Route: Signup
router.post("/signup", signup);

// Route: Login
router.post("/login", login);

router.get("/user", getUserDetails);

export default router;
