import express from "express";
import { signup, login, verifyOtp } from "../controllers/authController.js";
const router = express.Router();

// Route: Send OTP

// Route: Signup
router.post("/signup", signup);

// Route: Login
router.post("/login", login);

router.get("/user", verifyOtp);

export default router;
