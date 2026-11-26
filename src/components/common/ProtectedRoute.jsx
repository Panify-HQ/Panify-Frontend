import { Navigate, Outlet } from "react-router-dom";
import { obtenerSesionActual } from "../../services/auth.js";
import { rolDePanel } from "../../utils/adaptadores.js";

export default function ProtectedRoute({ rolesPermitidos, children }) {
  const usuario = obtenerSesionActual();

  if (!usuario) {
    return <Navigate to="/ingresar" replace />;
  }

  const rol = rolDePanel(usuario.rol);
  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to={rol === "cliente" ? "/cliente/inicio" : "/admin/usuarios"} replace />;
  }

  return children ? children : <Outlet />;
}
