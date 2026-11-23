  import { Navigate, Outlet } from "react-router-dom";
  import { obtenerSesionActual } from "../../services/auth.js";

  export default function ProtectedRoute({ rolesPermitidos, children }) {
    const usuario = obtenerSesionActual();

    if (!usuario) {
      return <Navigate to="/ingresar" replace />;
    }

    if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
      return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
  }
