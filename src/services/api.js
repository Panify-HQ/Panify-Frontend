import axios from "axios";

export const API_BASE_URL = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL).replace(/\/$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    const token = usuario?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Continua sin token si el usuario guardado no es valido.
  }

  return config;
});

export default API;
