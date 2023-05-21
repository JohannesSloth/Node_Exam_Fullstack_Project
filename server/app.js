import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";
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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["*"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("chat message", async (msg) => {
    const { username, message } = msg;
  
    if (!username || !message) {
      console.log("Invalid message received: missing username or message field");
      return;
    }
  
    const newMessage = { username, message, timestamp: new Date() };
  
    try {
      await db.chatMessages.insertOne(newMessage);
  
      // Broadcast the new message to all clients
      io.emit("chat message", newMessage);
    } catch (err) {
      console.log("An error occurred when saving a message:", err);
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
