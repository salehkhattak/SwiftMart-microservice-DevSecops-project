import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL
});

export const registerUser = (userData) => {
  return API.post("/register", userData);
};

export const loginUser = (userData) => {
  return API.post("/login", userData);
};