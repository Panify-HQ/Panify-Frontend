// Adaptadores entre los datos que devuelven los services (JSON Server hoy,
// backend después) y la forma de datos que consumen las vistas del Mockup.

import { codigoPedido, codigoRecibo } from "./formatos.js";
import imgBlandito from "../assets/img/pan-blandito.jpg";
import imgRollo from "../assets/img/rollo.jpg";
import imgCroissant from "../assets/img/croissant.jfif";
import imgFrances from "../assets/img/frances.jfif";

/* ─── Roles ─────────────────────────────────────────────────────────────── */

export const ROL_POR_ID = {
  1: "superadmin",
  2: "admin",
  3: "panadero",
  4: "domiciliario",
  5: "cliente",
};

export const ID_POR_ROL = {
  superadmin: 1,
  admin: 2,
  panadero: 3,
  domiciliario: 4,
  cliente: 5,
};

// La sesión (services/auth.js) guarda "administrador"; el panel usa "admin".
export function rolDePanel(rolSesion) {
  return rolSesion === "administrador" ? "admin" : rolSesion;
}

export function rolDeSesion(rolPanel) {
  return rolPanel === "admin" ? "administrador" : rolPanel;
}

/* ─── Estados de pedido ─────────────────────────────────────────────────── */

const ESTADOS_VALIDOS = [
  "pendiente",
  "preparando",
  "listo",
  "en_camino",
  "entregado",
  "cancelado",
];

export const ESTADO_API = {
  pendiente: "Pendiente",
  preparando: "Preparación",
  listo: "Listo",
  en_camino: "En Camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export function estadoAClave(estado) {
  const limpio = String(estado ?? "pendiente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

  if (limpio === "preparacion") return "preparando";
  return ESTADOS_VALIDOS.includes(limpio) ? limpio : "pendiente";
}

/* ─── Fechas ────────────────────────────────────────────────────────────── */

export function aFecha(valor) {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/* ─── Productos ─────────────────────────────────────────────────────────── */

const DULCES = ["cana", "canas", "lengua", "lenguas", "roscon", "roscones"];

function sinTildes(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// El catálogo real de Oro Pan solo maneja Panes y Dulce (no hay pasteles).
export function categoriaDeProducto(nombre) {
  const n = sinTildes(nombre);
  return DULCES.some((d) => n.includes(d)) ? "Dulces" : "Panes";
}

export function emojiDeProducto(nombre) {
  return categoriaDeProducto(nombre) === "Dulces" ? "🥐" : "🍞";
}

const IMAGEN_GENERICA =
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format";

export function imagenDeProducto(nombre) {
  const n = sinTildes(nombre);
  if (n.includes("blandito")) return imgBlandito;
  if (n.includes("rollo")) return imgRollo;
  if (n.includes("hojaldre")) return imgCroissant;
  if (n.includes("baguette") || n.includes("frances")) return imgFrances;
  return IMAGEN_GENERICA;
}

export function estadoDeStock(stock, stockMinimo, estadoManual) {
  if (estadoManual === "Agotado" || Number(stock) === 0) return "agotado";
  if (Number(stock) <= Number(stockMinimo)) return "stock_bajo";
  return "disponible";
}

export function adaptarProducto(producto, inventario) {
  const stock = Number(inventario?.stockActual ?? 0);
  const minStock = Number(inventario?.stockMinimo ?? 0);

  return {
    id: producto.id ?? producto.idProducto,
    nombre: producto.nombre,
    categoria: categoriaDeProducto(producto.nombre),
    precio: Number(producto.precio) || 0,
    stock,
    minStock,
    unidad: "unidad",
    descripcion: producto.descripcion || "",
    emoji: emojiDeProducto(producto.nombre),
    estadoManual: producto.estado,
    status: estadoDeStock(stock, minStock, producto.estado),
  };
}

/* ─── Pedidos ───────────────────────────────────────────────────────────── */

function idDePedidoEnDetalle(detalle) {
  return detalle.idPedido ?? detalle.pedido_idPedido ?? detalle.pedido_id;
}

export function adaptarPedido(pedido, { clientes, usuarios, detalles, productos }) {
  const cliente =
    clientes.find(
      (c) => String(c.idCliente ?? c.id) === String(pedido.cliente_idCliente),
    ) || {};

  const usuarioCliente =
    usuarios.find(
      (u) => String(u.cliente_idCliente) === String(pedido.cliente_idCliente),
    ) || {};

  const tieneDomiciliario =
    pedido.domiciliario_idDomiciliario !== null &&
    pedido.domiciliario_idDomiciliario !== undefined;

  const usuarioDomiciliario = tieneDomiciliario
    ? usuarios.find(
        (u) =>
          String(u.domiciliario_idDomiciliario) ===
          String(pedido.domiciliario_idDomiciliario),
      )
    : null;

  const items = detalles
    .filter((d) => String(idDePedidoEnDetalle(d)) === String(pedido.id))
    .map((d) => {
      const producto = productos.find(
        (p) => String(p.id ?? p.idProducto) === String(d.producto_idProducto),
      );
      const precioUnit = Number(d.precioFijo ?? producto?.precio ?? 0);
      const cantidad = Number(d.cantidad) || 0;

      return {
        productoId: d.producto_idProducto,
        nombre: producto?.nombre ?? "Producto no encontrado",
        cantidad,
        precioUnit,
        subtotal: cantidad * precioUnit,
      };
    });

  const totalCalculado = items.reduce((suma, item) => suma + item.subtotal, 0);
  const nombreCompleto = (usuario) =>
    [usuario?.nombre, usuario?.apellido].filter(Boolean).join(" ").trim();

  return {
    id: codigoPedido(pedido.id),
    idApi: pedido.id,
    numero: pedido.id,
    clienteId: pedido.cliente_idCliente,
    clienteNombre: nombreCompleto(usuarioCliente) || "Cliente no registrado",
    clienteTelefono: usuarioCliente.telefono || cliente.telefono || "N/A",
    clienteDireccion: cliente.direccion || "Dirección no registrada",
    items,
    total: Number(pedido.total) || totalCalculado,
    estado: estadoAClave(pedido.estadoPedido ?? pedido.estado),
    tipoEntrega: pedido.tipoEntrega === "recogida" ? "recogida" : "domicilio",
    domiciliarioId: tieneDomiciliario ? pedido.domiciliario_idDomiciliario : undefined,
    domiciliarioNombre: usuarioDomiciliario
      ? nombreCompleto(usuarioDomiciliario)
      : undefined,
    fechaCreacion:
      aFecha(pedido.fechaHoraCreacion ?? pedido.fechaHoraCreación ?? pedido.fecha) ??
      new Date(),
    fechaEntrega: aFecha(pedido.fechaHoraEntrega ?? pedido.fechaHoraEntregaEstimada) ?? undefined,
    notas: pedido.notas || "",
  };
}

/* ─── Recibos ───────────────────────────────────────────────────────────── */

export function adaptarRecibo(recibo, pedidosPanel) {
  const pedido = pedidosPanel.find(
    (p) => String(p.idApi) === String(recibo.idPedido ?? recibo.pedido_idPedido),
  );
  const items = pedido?.items ?? [];
  const subtotal = items.reduce((suma, item) => suma + item.subtotal, 0);
  const total = Number(recibo.totalPagar ?? recibo.total) || subtotal;

  return {
    id: codigoRecibo(recibo.id),
    idApi: recibo.id,
    pedidoId: pedido?.id ?? codigoPedido(recibo.idPedido ?? recibo.pedido_idPedido ?? 0),
    pedidoIdApi: recibo.idPedido ?? recibo.pedido_idPedido,
    numero: recibo.id,
    clienteNombre: pedido?.clienteNombre ?? "Cliente no encontrado",
    clienteTelefono: pedido?.clienteTelefono ?? "N/A",
    clienteDireccion: pedido?.clienteDireccion ?? "Dirección no registrada",
    items,
    subtotal: subtotal || total,
    descuento: Math.max(0, (subtotal || total) - total),
    total,
    metodoPago: recibo.metodoPago ?? null,
    pagado: recibo.pagado ?? true,
    fecha: aFecha(recibo.fechaEmision ?? recibo.fecha_emision) ?? new Date(),
  };
}

/* ─── Usuarios ──────────────────────────────────────────────────────────── */

export function adaptarUsuario(usuario, clientes) {
  const cliente =
    usuario.cliente_idCliente !== null && usuario.cliente_idCliente !== undefined
      ? clientes.find(
          (c) => String(c.idCliente ?? c.id) === String(usuario.cliente_idCliente),
        )
      : null;

  return {
    id: usuario.id,
    nombre: [usuario.nombre, usuario.apellido].filter(Boolean).join(" ").trim(),
    nombrePila: usuario.nombre ?? "",
    apellido: usuario.apellido ?? "",
    email: usuario.correo ?? usuario.email ?? "",
    telefono: usuario.telefono ?? "",
    rol: ROL_POR_ID[Number(usuario.Rol_idRol)] ?? "cliente",
    activo: String(usuario.estado ?? "Activo").toLowerCase() !== "inactivo",
    clienteId: usuario.cliente_idCliente ?? undefined,
    direccion: cliente?.direccion ?? "",
    barrio: cliente?.barrio ?? "",
  };
}

/* ─── Domiciliarios ─────────────────────────────────────────────────────── */

// Agrega a cada domiciliario sus entregas asignadas hoy y las completadas.
export function conConteoDeEntregas(domiciliarios, pedidos, hoy = new Date()) {
  const mismoDia = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return domiciliarios.map((d) => {
    const delDia = pedidos.filter(
      (p) =>
        String(p.domiciliarioId) === String(d.id) &&
        p.estado !== "cancelado" &&
        mismoDia(p.fechaCreacion, hoy),
    );
    return {
      ...d,
      entregasHoy: delDia.length,
      entregasCompletadas: delDia.filter((p) => p.estado === "entregado").length,
    };
  });
}
