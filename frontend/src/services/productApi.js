import axios from "axios";

const API =
  axios.create({

    baseURL:
      import.meta.env.VITE_PRODUCT_API_URL

  });

export const getProducts =
  () => API.get("/");

export const getProductById =
  (id) => API.get(`/${id}`);

export const getCategories =
  () => API.get("/categories");