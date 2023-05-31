import { SERVER_URL, handleResponse } from "./fetchUtil.js";
import { io } from "socket.io-client";

const socket = io(SERVER_URL);

async function getPreviousMessages() {
  const response = await fetch(`${SERVER_URL}/api/chat`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await handleResponse(response);
}

function subscribeToNewMessages(callback) {
  socket.on("send message", (msg) => callback(msg));
  
  return () => {
    socket.off("send message");
  };
}

function subscribeToEditedMessages(callback) {
  socket.on("edit message", (id) => callback(id));

  return () => {
    socket.off("edit message");
  };
}

function subscribeToDeletedMessages(callback) {
  socket.on("delete message", (id) => callback(id));
  
  return () => {
    socket.off("delete message");
  };
}

function subscribeToUserJoinedNotification(callback) {
  socket.on("user joined", (username) => callback(username));

  return () => {
    socket.off("user joined");
  };
}

function subscribeToUserLeftNotification(callback) {
  socket.on("user left", (username) => callback(username));

  return () => {
    socket.off("user left");
  };
}

function sendMessage(username, flair, message, callback) {
  socket.emit("send message", { username, flair, message }, callback);
}

function editMessage(id, message, callback) {
  socket.emit('edit message', { id, message }, callback);
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

function sendUserJoinedNotification(username) {
  socket.emit("user joined", username)
}

function sendUserLeftNotification(username) {
  socket.emit("user left", username)
}

export default {
  getPreviousMessages,
  subscribeToNewMessages,
  subscribeToEditedMessages,
  subscribeToDeletedMessages,
  subscribeToUserJoinedNotification,
  subscribeToUserLeftNotification,
  sendMessage,
  editMessage,
  deleteMessage,
  sendUserJoinedNotification,
  sendUserLeftNotification,
};
