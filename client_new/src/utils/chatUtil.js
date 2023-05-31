import { SERVER_URL, handleResponse } from "./fetchUtil.js";
import { io } from "socket.io-client";

const socket = io(SERVER_URL);

async function getMessages() {
  const response = await fetch(`${SERVER_URL}/api/chat`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await handleResponse(response);
}

function subscribeToChat(callback) {
  socket.on("chat message", (msg) => callback(msg));
  
  return () => {
    socket.off("chat message");
  };
}

function sendMessage(username, flair, message,) {
  socket.emit("chat message", { username, flair, message });
}

function subscribeToEdit(callback) {
  socket.on("message edited", (id) => callback(id));

  return () => {
    socket.off("message edited");
  };
}

function editMessage(id, message) {
  socket.emit('message edited', { id, message });
}

function subscribeToDelete(callback) {
  socket.on("message deleted", (id) => callback(id));

  return () => {
    socket.off("message deleted");
  };
}

async function deleteMessage(id) {
  const response = await fetch(`${SERVER_URL}/api/chat/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await handleResponse(response);
}

function subscribeToUserJoinedNotification(callback) {
  socket.on("user joined", (username) => callback(username));

  return () => {
    socket.off("user joined");
  };
}

function sendUserJoinedNotification(username) {
  socket.emit("user joined", username)
}

function subscribeToUserLeftNotification(callback) {
  socket.on("user left", (username) => callback(username));

  return () => {
    socket.off("user left");
  };
}

function sendUserLeftNotification(username) {
  socket.emit("user left", username)
}


export default {
  getMessages,
  subscribeToChat,
  sendMessage,
  subscribeToEdit,
  editMessage,
  subscribeToDelete,
  deleteMessage,
  subscribeToUserJoinedNotification,
  sendUserJoinedNotification,
  subscribeToUserLeftNotification,
  sendUserLeftNotification,
};
