import { useEffect, useState } from "react";
import { obtenerSesionActual } from "../services/auth.js";
import { rolDePanel } from "../utils/adaptadores.js";

export const ETIQUETA_ROL = {
  superadmin: "Superadministrador",
  admin: "Administrador",
  panadero: "Panadero",
  domiciliario: "Domiciliario",
  cliente: "Cliente",
};

function iniciales(nombre) {
  const partes = String(nombre || "U").trim().split(/\s+/).slice(0, 2);
  return partes.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

function construir() {
  const usuario = obtenerSesionActual();
  if (!usuario) return null;

  const rol = rolDePanel(usuario.rol);
  const nombre = usuario.nombreCompleto || usuario.nombre || "Usuario";

  return {
    usuario,
    rol,
    etiquetaRol: ETIQUETA_ROL[rol] ?? "Usuario",
    nombre,
    nombreCorto: usuario.nombre || nombre,
    email: usuario.correo || usuario.email || "",
    iniciales: iniciales(nombre),
  };
}

// Lee la sesión guardada en localStorage y se actualiza cuando cambia
// (el evento "usuarioActualizado" lo dispara services/auth.js).
export default function useSesion() {
  const [sesion, setSesion] = useState(construir);

  useEffect(() => {
    const actualizar = () => setSesion(construir());
    window.addEventListener("usuarioActualizado", actualizar);
    window.addEventListener("storage", actualizar);
    return () => {
      window.removeEventListener("usuarioActualizado", actualizar);
      window.removeEventListener("storage", actualizar);
    };
  }, []);

  return sesion;
}
