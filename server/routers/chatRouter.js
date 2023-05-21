import { Router } from "express";
import db from "../database/connection.js";

const router = Router();

router.get("/api/chat", async (req, res) => {
  try {
    const messages = await db.chatMessages.find().toArray();
    res.json(messages);
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred when fetching messages." });
  }
});

router.post("/api/chat", async (req, res) => {
  const { username, message } = req.body;
  console.log("Username in backend post: " + username + " Message in backend post: " + message);

  if (!username || !message) {
    return res
      .status(400)
      .json({ error: "Request missing user or message field." });
  }

  try {
    const newMessage = { username, message, timestamp: new Date() };
    await db.chatMessages.insertOne(newMessage);
    res.status(201).json(newMessage);
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred when sending a message." });
  }
});

export default router;
