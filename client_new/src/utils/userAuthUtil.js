import { user } from "../stores/userStore.js";
import { SERVER_URL, handleResponse } from "./fetchUtil.js";

async function getUserProfile() {
  const response = await fetch(`${SERVER_URL}/api/auth`, {
    method: "GET",
    credentials: "include",
  });
  return await handleResponse(response);
}

async function signup(username, email, password) {
  const response = await fetch(`${SERVER_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
    credentials: "include",
  });
  return await handleResponse(response);
}

async function login(username, password) {
  const response = await fetch(`${SERVER_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });
  const responseData = await handleResponse(response);
  user.set(responseData.user);

  return responseData;
}

async function logout() {
  const response = await fetch(`${SERVER_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  const result = await handleResponse(response);
  user.set(null);

  return result;
}

async function updateFlair(flair) {
  const response = await fetch(`${SERVER_URL}/api/auth/flair`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ flair }),
    credentials: "include",
  });
  const responseData = await handleResponse(response);
  user.set(responseData.user);

  return responseData;
}

async function deleteUserAccount() {
  const response = await fetch(`${SERVER_URL}/api/auth/deleteaccount`, {
    method: "DELETE",
    credentials: "include",
  });
  const result = await handleResponse(response);
  user.set(null);

  return result;
}

export default {
  getUserProfile,
  signup,
  login,
  logout,
  updateFlair,
  deleteUserAccount,
};
