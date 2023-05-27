import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";
import userRouter from "./routers/userRouter.js";
import chatRouter from "./routers/chatRouter.js";
import db from "./database/connection.js";
import xss from "xss";
import { ObjectId } from "mongodb";

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
    await db.activeUsers.insertOne({ username });
    io.emit("user joined", username)
  })
  
  socket.on("user left", async (username) => {
    await db.activeUsers.deleteOne({ username })
    io.emit("user left", username)
  })

  socket.on("chat message", async (msg) => {
    const { username, flair, message } = msg;

    if (!username || !message || !flair) {
      console.log(
        "Invalid message received: missing username, message or flair"
      );
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
      io.emit("chat message", newMessage);
    } catch (err) {
      console.log("An error occurred when saving a message:", err);
    }
  });

  socket.on("message edited", async (msg) => {
    console.log("msg: ", msg);
    const id = new ObjectId(msg.id);
    const message = msg.message;

    if (!id || !message) {
      console.log("Invalid message edit received: missing id or message");
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
        { $set: { message: message, editedAt: new Date(), editedByUser: true } },
        { returnDocument: "after" }
      );
      const updatedMessage = result.value;
      io.emit("message edited", updatedMessage);
    } catch (err) {
      console.log("An error occurred when editing a message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.use(userRouter);
app.use(chatRouter);

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
