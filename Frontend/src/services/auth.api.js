import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function register({ username, email, password }) {
  const response = await api.post("/api/auth/register", {
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password,
  });

  return response.data;
}

export async function login({ email, password }) {
  const response = await api.post("/api/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });

  return response.data;
}

export async function getMe() {
  const response = await api.get("/api/auth/get-me");
  return response.data;
}

export async function logout() {
  const response = await api.get("/api/auth/log-out");
  return response.data;
}

export default api;
