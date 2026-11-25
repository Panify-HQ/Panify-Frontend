import API from "./api";
import { obtenerSesionActual } from "./auth";

export async function obtenerUsuarios() {
  const res = await API.get("/users");
  return res.data;
}

export async function crearUsuario(datosUsuario) {
  const res = await API.post("/api/v1/auth/register", datosUsuario);
  return res.data;
}

export async function eliminarUsuario(id) {
  await API.delete(`/users/${id}`);
}

export async function actualizarUsuario(id, datosActualizados) {
  const res = await API.patch(`/users/${id}`, datosActualizados);
  return res.data;
}

// Obtener la información del perfil privado del usuario logueado
export async function obtenerPerfilUsuario(userId = null) {
  const usuario = await obtenerSesionActual({ sincronizar: true });
  const clienteIdActual = Number(
    userId ?? usuario.cliente_idCliente ?? usuario.idCliente ?? usuario.id ?? 1
  );
  const nombre = usuario.nombre || "";
  const apellido = usuario.apellido || "";
  const email = usuario.correo || usuario.email || "";
  const direccion = usuario.direccion || "No registrada";
  const ciudad = usuario.ciudad || "Soacha";
  const iniciales = `${(nombre || "U")[0]}${(apellido || "")[0] || ""}`.toUpperCase();

  return {
    id: clienteIdActual,
    clienteId: clienteIdActual,
    usuarioId: usuario.idUsuario ?? usuario.id,
    nombre,
    apellido,
    email,
    telefono: usuario.telefono || "",
    direccion,
    ciudad,
    avatarUrl: usuario.avatarUrl || usuario.avatar || null,
    iniciales,
    totalPedidosRealizados: usuario.totalPedidosRealizados ?? 0,
  };
}

// Actualizar datos personales del usuario y sincronizarlos con su cliente
export async function actualizarPerfilUsuario(usuarioId, clienteId, datosActualizados) {
  const [usuarioResponse, clienteResponse] = await Promise.all([
    API.get(`/users/${usuarioId}`),
    API.get(`/clientes/${clienteId}`),
  ]);

  const usuario = usuarioResponse.data;
  const cliente = clienteResponse.data;

  const payloadUsuario = {
    nombre: datosActualizados.nombre,
    apellido: datosActualizados.apellido,
    telefono: datosActualizados.telefono,
    correo: datosActualizados.email,
    email: datosActualizados.email,
  };

  const payloadCliente = {
    email: datosActualizados.email,
    direccion: datosActualizados.direccion,
    ciudad: datosActualizados.ciudad,
    telefono: datosActualizados.telefono,
  };

  const peticiones = [];

  if (usuario) {
    peticiones.push(API.patch(`/users/${usuario.id}`, payloadUsuario));
  }

  if (cliente) {
    peticiones.push(API.patch(`/clientes/${cliente.id}`, payloadCliente));
  }

  if (peticiones.length === 0) {
    throw new Error("No se encontró el usuario o cliente para actualizar");
  }

  const resultados = await Promise.all(peticiones);
  return resultados.at(-1)?.data || null;
}