import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
