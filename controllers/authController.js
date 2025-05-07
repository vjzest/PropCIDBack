import User from "../models/user.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const JWT_SECRET = "supersecretkey"; // move to .env
const OTP_EXPIRES_IN_MINUTES = 10;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Utility to generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ------------------------
// POST /signup
export const signup = async (req, res) => {
  const { name, email, password, userType, companyName, licenseNumber } =
    req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already exists" });

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60000);

    const user = await User.create({
      name,
      email,
      password,
      userType,
      companyName,
      licenseNumber,
      otp,
      otpExpires,
      isVerified: false,
    });

    // Send OTP via email
    await transporter.sendMail({
      to: email,
      subject: "Verify Your Email - OTP",
      html: `<p>Your verification code is: <b>${otp}</b></p>`,
    });

    res.status(201).json({ message: "Signup successful, OTP sent to email." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------------
// POST /verify-otp
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ error: "User already verified" });
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------------
// POST /login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    if (!user.isVerified)
      return res
        .status(401)
        .json({ error: "Please verify your email with OTP first" });

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        companyName: user.companyName,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
