import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { iniciarApariencia } from "./hooks/useApariencia.js";
import "./assets/css/main.css";

iniciarApariencia();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
