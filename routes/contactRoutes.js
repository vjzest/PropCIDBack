import express from "express";
import {
  submitContactForm,
  getAllContacts,
} from "../controllers/contactform.js";

const router = express.Router();

router.post("/", submitContactForm);
router.get("/data", getAllContacts);

export default router;
