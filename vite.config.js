import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const backendTarget = "http://127.0.0.1:8000";
const backendPaths = [
  "/api",
  "/health",
  "/productos",
  "/pedidos",
  "/detalles_pedidos",
  "/detalle_pedidos",
  "/recibos",
  "/inventarios",
  "/users",
  "/clientes",
];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    proxy: Object.fromEntries(
      backendPaths.map((path) => [
        path,
        { target: backendTarget, changeOrigin: true },
      ]),
    ),
  },
});
