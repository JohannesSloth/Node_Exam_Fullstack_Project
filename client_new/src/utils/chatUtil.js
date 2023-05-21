const SERVER_URL = "http://127.0.0.1:5000";

import { io } from "socket.io-client";
const socket = io(SERVER_URL);

function subscribeToChat(callback) {
  socket.on("chat message", (msg) => callback(msg));

  return () => {
    socket.off("chat message");
  };
}

function sendMessage(message, username) {
  socket.emit("chat message", { message, username });
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


export default {
  sendMessage,
  getMessages,
  subscribeToChat,
};
