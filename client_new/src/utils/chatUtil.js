const SERVER_URL = "http://127.0.0.1:5000";

import { io } from "socket.io-client";
const socket = io(SERVER_URL);

function subscribeToChat(callback) {
  socket.on("chat message", (msg) => callback(null, msg));
  socket.on("connect", () => console.log("Connected to chat server"));
  socket.on("disconnect", () => console.log("Disconnected from chat server"));
}

async function getMessages() {
  const response = await fetch(`${SERVER_URL}/api/chat`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }

  return await response.json();
}

async function sendMessage(message, username) {
  socket.emit("chat message", { message, username });

  const response = await fetch(`${SERVER_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, username }),
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }

  return await response.json();
}

export default {
  sendMessage,
  getMessages,
  subscribeToChat,
};
