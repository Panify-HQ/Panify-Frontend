import API from "./api.js";

const AUTH_PATH = "/api/v1/auth";

const ROLES = {
  1: "superadmin",
  2: "administrador",
  3: "panadero",
  4: "domiciliario",
  5: "cliente",
};

export const registrarUsuario = async ({
  nombre,
  apellido = "",
  email,
  password,
  telefono = "3000000000",
  direccion = "",
}) => {
  const nuevoUsuario = {
    nombre,
    apellido,
    email,
    correo: email,
    password,
    telefono,
    direccion,
    estado: "Activo",
    Rol_idRol: 5,
    cliente_idCliente: 2,
    panadero_idPanadero: null,
    domiciliario_idDomiciliario: null,
  };

  const { data } = await API.post(`${AUTH_PATH}/register`, nuevoUsuario);
  return data;
};

export function obtenerSesionActual({ sincronizar = false } = {}) {
  if (!sincronizar) {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
      if (!usuario) return null;

      const nombreCompleto = [usuario.nombre, usuario.apellido]
        .filter(Boolean)
        .join(" ")
        .trim();

      return {
        ...usuario,
        nombreCompleto: nombreCompleto || usuario.correo || "Administrador",
      };
    } catch {
      return null;
    }
  }

  return API.get(`${AUTH_PATH}/me`).then(({ data }) => {
    const usuario = data.user ?? data.usuario ?? data.data?.user ?? data.data ?? data;
    const rolId =
      usuario.Rol_idRol ?? usuario.rol_id ?? usuario.role_id ?? usuario.rolId;
    const rolNombre =
      usuario.rol?.nombre ??
      usuario.rol?.name ??
      usuario.role?.name ??
      usuario.rol ??
      usuario.role ??
      "";
    const nombre = usuario.nombre ?? usuario.name ?? usuario.nombre_completo ?? usuario.full_name ?? "";
    const apellido = usuario.apellido ?? usuario.last_name ?? usuario.lastname ?? "";
    const correo = usuario.correo || usuario.email;
    const usuarioActual = {
      ...usuario,
      nombre,
      apellido,
      correo,
      nombreCompleto: [nombre, apellido].filter(Boolean).join(" ").trim() || correo || "Administrador",
      rol: ROLES[Number(rolId)] ?? String(rolNombre).toLowerCase(),
    };

    localStorage.setItem("usuario", JSON.stringify(usuarioActual));
    window.dispatchEvent(new Event("usuarioActualizado"));

    return usuarioActual;
  });
}

export async function iniciarSesion(email, password) {
  let respuesta;

  try {
    respuesta = await API.post(`${AUTH_PATH}/login`, { email, password });
  } catch (error) {
    const status = error.response?.status;
    if (status === 400 || status === 401 || status === 403) return null;
    throw error;
  }

  const payload = respuesta.data ?? {};
  const usuario = payload.user ?? payload.usuario ?? payload.data?.user ?? payload.data ?? {};

  if (!usuario || typeof usuario !== "object") return null;

  const token =
    payload.accessToken ??
    payload.access_token ??
    payload.token ??
    payload.data?.accessToken ??
    payload.data?.access_token ??
    usuario.token;

  const usuarioTemporal = {
    ...usuario,
    nombre: usuario.nombre ?? usuario.name ?? usuario.nombre_completo ?? usuario.full_name ?? "",
    apellido: usuario.apellido ?? usuario.last_name ?? usuario.lastname ?? "",
    correo: usuario.correo || usuario.email,
    token,
  };

  localStorage.setItem("usuario", JSON.stringify(usuarioTemporal));

  try {
    const usuarioSesion = await obtenerSesionActual({ sincronizar: true });
    return { ...usuarioSesion, token };
  } catch (error) {
    localStorage.removeItem("usuario");
    throw error;
  }
}

export async function cerrarSesion() {
  try {
    await API.post(`${AUTH_PATH}/logout`);
  } finally {
    localStorage.removeItem("usuario");
  }
}

export async function recuperarPassword(correo) {
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ mensaje: "Enlace de recuperación enviado (simulado)." });
    }, 800); 
  });
}