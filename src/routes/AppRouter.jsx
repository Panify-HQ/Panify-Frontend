import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ClientLayout from "../layouts/ClientLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import useSesion from "../hooks/useSesion.js";

// Públicas
import Home from "../pages/public/Home.jsx";
import Login from "../pages/public/Login.jsx";
import Registro from "../pages/public/Register.jsx";
import Recuperacion from "../pages/public/Recuperacion.jsx";

// Cliente
import InicioCliente from "../pages/client/Inicio.jsx";
import Catalogo from "../pages/client/Catalogo.jsx";
import Carrito from "../pages/client/Carrito.jsx";
import MisPedidos from "../pages/client/Pedidos.jsx";
import MisRecibos from "../pages/client/Recibos.jsx";

// Panel (Superadmin, Administrador, Panadero, Domiciliario)
import Dashboard from "../pages/admin/Dashboard.jsx";
import Inventario from "../pages/admin/Inventario.jsx";
import Pedidos from "../pages/admin/Pedidos.jsx";
import Recibos from "../pages/admin/Recibos.jsx";
import Entregas from "../pages/admin/Entregas.jsx";
import Domiciliario from "../pages/admin/Domiciliario.jsx";
import Users from "../pages/admin/Users.jsx";

// Compartida
import Configuracion from "../pages/shared/Configuracion.jsx";

const PERSONAL = ["superadmin", "administrador", "panadero", "domiciliario"];
const GESTION = ["superadmin", "administrador"];
const PRODUCCION = ["superadmin", "administrador", "panadero"];
const REPARTO = ["superadmin", "administrador", "domiciliario"];

// El domiciliario ve su propia lista de entregas; el resto, el panel de rutas.
function EntregasPorRol() {
  const sesion = useSesion();
  return sesion?.rol === "domiciliario" ? <Domiciliario /> : <Entregas />;
}

function Protegida({ roles, children }) {
  return <ProtectedRoute rolesPermitidos={roles}>{children}</ProtectedRoute>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas: /productos y /contacto son secciones de la landing */}
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Home />} />
        <Route path="/contacto" element={<Home />} />
        <Route path="/ingresar" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperacion" element={<Recuperacion />} />

        {/* Cliente */}
        <Route
          path="/cliente"
          element={
            <ProtectedRoute rolesPermitidos={["cliente"]}>
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<InicioCliente />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="carrito" element={<Carrito />} />
          <Route path="pedidos" element={<MisPedidos />} />
          <Route path="recibos" element={<MisRecibos />} />
          <Route
            path="configuracion"
            element={
              <div className="max-w-3xl mx-auto px-4 py-8">
                <Configuracion />
              </div>
            }
          />
          <Route path="perfil" element={<Navigate to="../configuracion" replace />} />
        </Route>

        {/* Panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute rolesPermitidos={PERSONAL}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Protegida roles={PERSONAL}><Dashboard /></Protegida>} />
          <Route path="inventario" element={<Protegida roles={PRODUCCION}><Inventario /></Protegida>} />
          <Route path="pedidos" element={<Protegida roles={PRODUCCION}><Pedidos /></Protegida>} />
          <Route path="recibos" element={<Protegida roles={GESTION}><Recibos /></Protegida>} />
          <Route path="entregas" element={<Protegida roles={REPARTO}><EntregasPorRol /></Protegida>} />
          <Route path="usuarios" element={<Protegida roles={GESTION}><Users /></Protegida>} />
          <Route path="configuracion" element={<Protegida roles={PERSONAL}><Configuracion /></Protegida>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
