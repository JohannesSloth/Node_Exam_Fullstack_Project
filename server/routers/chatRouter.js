import { Router } from "express";
import db from "../database/connection.js";
import { io } from "../app.js";
import { ObjectId } from "mongodb";

const router = Router();

router.get("/api/chat", async (req, res) => {
  try {
    const messages = await db.chatMessages.find().toArray();
    const sanitizedMessages = messages.map((msg) => {
      if (msg.deletedByUser) {
        return {
          ...msg,
          message: "<i>This message was deleted by the user</i>",
        };
      }
      return msg;
    });
    res.json(sanitizedMessages);
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred when fetching messages." });
  }
});

router.put("/api/chat/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const result = await db.chatMessages.updateOne(
      { _id: id },
      { $set: { deletedByUser: true } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Message not found." });
    }

    io.emit("message deleted", id);

    res.status(204).end();
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred when deleting a message." });
  }
});

/*router.post("/api/chat", async (req, res) => {
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
});*/

export default router;
