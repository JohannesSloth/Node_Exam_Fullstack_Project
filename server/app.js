import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import xss from "xss";
import { ObjectId } from "mongodb";
import userRouter from "./routers/userRouter.js";
import chatRouter from "./routers/chatRouter.js";
import db from "./database/connection.js";

dotenv.config();

const app = express();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: "lax",
    },
  })
);
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.use(userRouter);
app.use(chatRouter);

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["*"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("user joined", async (username) => {
    io.emit("user joined", username);
  });

  socket.on("user left", async (username) => {
    io.emit("user left", username);
  });

  socket.on("send message", async (msg, callback) => {
    const { username, flair, message } = msg;

    if (!username || !message || !flair) {
      callback({
        error:
          "Invalid message data received: missing username, message or flair",
      });
      return;
    }

    const sanitizedMessage = xss(message);

    const newMessage = {
      username,
      flair,
      message: sanitizedMessage,
      timestamp: new Date(),
      deletedByUser: false,
    };

    try {
      await db.chatMessages.insertOne(newMessage);
      io.emit("send message", newMessage);
      callback({ success: true });
    } catch (err) {
      callback({
        error: "An error occurred when saving the message to the database.",
      });
    }
  });

  socket.on("edit message", async (msg, callback) => {
    const id = new ObjectId(msg.id);
    const message = msg.message;

    if (!id || !message) {
      callback({
        error: "Invalid message edit data received: missing id or message",
      });
      return;
    }

    try {
      const currentMessage = await db.chatMessages.findOne({ _id: id });
      await db.messageVersions.insertOne({
        originalMessageId: id,
        message: currentMessage.message,
        sentAt: currentMessage.timestamp,
        editedAt: new Date(),
      });

      const result = await db.chatMessages.findOneAndUpdate(
        { _id: id },
        {
          $set: { message: message, editedAt: new Date(), editedByUser: true },
        },
        { returnDocument: "after" }
      );
      const updatedMessage = result.value;
      io.emit("edit message", updatedMessage);
      callback({ success: true });
    } catch (err) {
      callback({
        error:
          "An error occurred when saving the updated message to the database.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
