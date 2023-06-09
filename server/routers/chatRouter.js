import { Router } from "express";
import { ObjectId } from "mongodb";
import db from "../database/connection.js";
import { io } from "../app.js";

const router = Router();

router.get("/api/chat", async (req, res) => {
  try {
    const messages = await db.chatMessages.find().toArray();
    const deletedMessagesReplaced = messages.map((msg) => {
      if (msg.deletedByUser) {
        return {
          ...msg,
          message: "<i>This message was deleted by the user</i>",
        };
      }
      return msg;
    });
    res.json(deletedMessagesReplaced);
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

    io.emit("delete message", id);

    res.status(200).json({ message: "Message successfully deleted." });
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred when deleting a message." });
  }
});

export default router;
