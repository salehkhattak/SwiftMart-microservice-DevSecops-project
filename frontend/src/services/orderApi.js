import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_ORDER_API_URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const createOrder = (
  orderData
) =>
  API.post("/", orderData);

export const getOrders = () =>
  API.get("/");

export const getOrderById = (
  id
) =>
  API.get(`/${id}`);

export const updateOrderStatus = (id, status) =>
  API.put(`/${id}/status`, { status });
