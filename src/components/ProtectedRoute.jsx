import { Navigate, Outlet } from "react-router-dom";
import { obtenerSesionActual } from "../services/auth.js";

export default function ProtectedRoute({ rolesPermitidos, children }) {
  const usuario = obtenerSesionActual();

  if (!usuario) {
    return <Navigate to="/ingresar" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    // Con sesión pero sin permiso: se envía al inicio de su propia área.
    const inicio = usuario.rol === "cliente" ? "/cliente/inicio" : "/admin/usuarios";
    return <Navigate to={inicio} replace />;
  }

  return children ? children : <Outlet />;
}
