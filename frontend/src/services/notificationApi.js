import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_NOTIFICATION_API_URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getNotifications = () =>
   API.get("/me");
