import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_CART_API_URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Add item
export const addToCart = (data) => API.post("/", data);

// Get user cart
export const getCartByUser = () => API.get("/");

// Update quantity
export const updateCartItem = (itemId, data) =>
  API.put(`/${itemId}`, data);

// Delete single item
export const deleteCartItem = (itemId) =>
  API.delete(`/${itemId}`);

// Clear user cart
export const clearCart = () => API.delete("/");
