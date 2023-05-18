import { Router } from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import apiLimiter from "../utils/rateLimiter.js";
import db from "../database/connection.js";
import { sendSignedUpMail } from "../utils/nodemailer.js";

const router = Router();

router.post(
  "/api/signup",
  apiLimiter,
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").notEmpty().withMessage("Invalid Email Adress"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10).catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "Error hashing password" });
    });
    
    const user = { username, email, password: hashedPassword };
    
    try {
        await db.users.insertOne(user);
        await sendSignedUpMail(username, email);
        res.status(200).json({ message: "User created successfully" });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error creating user" });
      }
  }
);

export default router;
