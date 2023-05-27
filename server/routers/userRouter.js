import { Router } from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import apiLimiter from "../utils/rateLimiter.js";
import db from "../database/connection.js";
import { sendSignedUpMail } from "../utils/nodemailer.js";
import { ObjectId } from "mongodb";

const router = Router();

router.post(
  "/api/auth/signup",
  apiLimiter,
  [
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .custom(async (value) => {
        const user = await db.users.findOne({ username: value });
        if (user) {
          throw new Error("Username already in use");
        }
        return true;
      }),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
    /*.custom(async (value) => {
        const user = await db.users.findOne({ email: value });
        if (user) {
          throw new Error('Email already in use');
        }
        return true;
      }),*/
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

router.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await db.users.findOne({ username: username });
  if (!user) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  req.session.userId = user._id;

  const userResponse = { ...user };
  delete userResponse.password;

  res
    .status(200)
    .json({ message: "Logged in successfully", user: userResponse });
});

router.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Could not log out, please try again" });
    }

    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logged out successfully" });
  });
});

router.get("/api/auth/user", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    console.log("Session userId:", req.session.userId);
    const user = await db.users.findOne(
      { _id: new ObjectId(req.session.userId) },
      { projection: { password: 0 } }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/api/auth/user/flair", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { flair } = req.body;

  try {
    const updatedUser = await db.users.findOneAndUpdate(
      { _id: new ObjectId(req.session.userId) },
      { $set: { flair } },
      { projection: { password: 0 }, returnDocument: "after" }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: updatedUser.value });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error updating flair" });
  }
});

router.delete("/api/auth/user/deleteaccount", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({error:"Not authenticated"});
  }

  try {
    console.log("Session userId for user about to be deleted: ", req.session.userId);
    await db.users.findOneAndDelete( {_id: new ObjectId(req.session.userId)})
    res.status(200).json({message: "User deleted successfully"});
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: "Error deleting user"});
  }
})

export default router;
