import { user } from "../stores/userStore.js";

const SERVER_URL = "http://127.0.0.1:5000";

async function signup(username, email, password) {
  const response = await fetch(`${SERVER_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const errorResponse = await response.json();

    if (Array.isArray(errorResponse.errors)) {
      const errorMessage = errorResponse.errors
        .map((err) => err.msg)
        .join(", ");
      throw new Error(errorMessage);
    }

    const error = new Error(errorResponse.error);
    throw error;
  }

  return await response.json();
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

  if (!response.ok) {
    const errorResponse = await response.json();
    const error = new Error(errorResponse.error);
    throw error;
  }

  const responseData = await response.json();
  user.set(responseData.user);

  let unsubscribe = user.subscribe(value => {
    console.log("Userstore after login: ", value);
  });
  unsubscribe();

  return responseData;
}

async function logout() {
  const response = await fetch(`${SERVER_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    const error = new Error(errorResponse.error);
    throw error;
  }

  user.set(null)

  let unsubscribe = user.subscribe(value => {
    console.log("Userstore after logout: ", value);
  });
  unsubscribe();

  return await response.json();
}

async function getUserProfile() {
  const response = await fetch(`${SERVER_URL}/api/auth/user`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error = new Error(
      "An error occurred while fetching the user profile"
    );
    error.status = response.status;
    throw error;
  }

  return await response.json();
}

async function updateFlair(flair) {
  const response = await fetch(`${SERVER_URL}/api/auth/user/flair`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ flair }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const responseData = await response.json();
  user.set(responseData.user);

  return await responseData;
}

async function deleteUserAccount() {
  const response = await fetch(`${SERVER_URL}/api/auth/user/deleteaccount`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    const error = new Error(errorResponse.error);
    throw error;
  }

  user.set(null);

  let unsubscribe = user.subscribe(value => {
    console.log("Userstore after deleting account: ", value);
  });
  unsubscribe();

  return await response.json();
}


export default {
  SERVER_URL,
  login,
  signup,
  getUserProfile,
  updateFlair,
  logout,
  deleteUserAccount,
};
