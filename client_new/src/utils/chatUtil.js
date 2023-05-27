const SERVER_URL = "http://127.0.0.1:5000";

import { io } from "socket.io-client";
const socket = io(SERVER_URL);

function sendMessage(username, flair, message,) {
  socket.emit("chat message", { username, flair, message });
}

function subscribeToChat(callback) {
  socket.on("chat message", (msg) => callback(msg));

  return () => {
    socket.off("chat message");
  };
}

function editMessage(id, message) {
  socket.emit('message edited', { id, message });
}

function subscribeToEdit(callback) {
  socket.on("message edited", (id) => callback(id));

  return () => {
    socket.off("message edited");
  };
}

async function deleteMessage(id) {
  const response = await fetch(`${SERVER_URL}/api/chat/${id}`, {
    method: "PUT",
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

function subscribeToDelete(callback) {
  socket.on("message deleted", (id) => callback(id));

  return () => {
    socket.off("message deleted");
  };
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

function sendUserJoinedNotification(username) {
  socket.emit("user joined", username)
}

function subscribeToUserNotification(callback) {
  socket.on("user joined", (username) => callback(username));

  return () => {
    socket.off("user joined");
  };
}

function sendUserLeftNotification(username) {
  socket.emit("user left", username)
}

function subscribeToUserLeftNotification(callback) {
  socket.on("user left", (username) => callback(username));

  return () => {
    socket.off("user left");
  };
}


export default {
  sendMessage,
  getMessages,
  subscribeToChat,
  deleteMessage,
  subscribeToDelete,
  editMessage,
  subscribeToEdit,
  sendUserJoinedNotification,
  subscribeToUserNotification,
  sendUserLeftNotification,
  subscribeToUserLeftNotification,
};
