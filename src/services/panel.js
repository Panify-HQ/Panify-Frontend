// Servicios que alimentan las vistas del panel (diseño Mockup_Panify).
// Reutilizan los mismos endpoints que el resto de services/ y devuelven los
// datos ya adaptados con utils/adaptadores.js. Toda la comunicación pasa por
// la instancia compartida de Axios (services/api.js).

import API from "./api.js";
import { obtenerSesionActual } from "./auth.js";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto as eliminarProductoApi,
} from "./producto.js";
import { actualizarEstadoPedido } from "./pedidos.js";
import {
  ESTADO_API,
  adaptarPedido,
  adaptarProducto,
  adaptarRecibo,
  adaptarUsuario,
} from "../utils/adaptadores.js";

const datos = (respuesta) => (Array.isArray(respuesta.data) ? respuesta.data : []);

/* ─── Productos e inventario ────────────────────────────────────────────── */

export async function obtenerProductosPanel() {
  const [productos, inventarios] = await Promise.all([
    API.get("/productos"),
    API.get("/inventarios"),
  ]);

  return datos(productos).map((producto) =>
    adaptarProducto(
      producto,
      datos(inventarios).find(
        (i) => String(i.producto_idProducto) === String(producto.id ?? producto.idProducto),
      ),
    ),
  );
}

// Guarda el producto y, si el endpoint de inventarios responde, su stock.
// Devuelve { stockActualizado } para que la vista avise si solo se guardó el producto.
export async function guardarProductoPanel({ id, nombre, descripcion, precio, stock, minStock }) {
  const datosProducto = {
    nombre,
    descripcion,
    precio,
    estado: Number(stock) === 0 ? "Agotado" : "Disponible",
  };

  const guardado = id
    ? await actualizarProducto(id, datosProducto)
    : await crearProducto(datosProducto);

  const idProducto = id ?? guardado?.id;

  try {
    const { data } = await API.get("/inventarios", {
      params: { producto_idProducto: idProducto },
    });
    const inventario = Array.isArray(data) ? data[0] : null;

    if (inventario) {
      await API.patch(`/inventarios/${inventario.id}`, {
        stockActual: Number(stock),
        stockMinimo: Number(minStock),
      });
    } else {
      await API.post("/inventarios", {
        producto_idProducto: idProducto,
        stockActual: Number(stock),
        stockMinimo: Number(minStock),
      });
    }
    return { stockActualizado: true };
  } catch (error) {
    console.error("No se pudo guardar el stock del producto:", error);
    return { stockActualizado: false };
  }
}

export const eliminarProductoPanel = eliminarProductoApi;

/* ─── Pedidos ───────────────────────────────────────────────────────────── */

async function cargarBasePedidos() {
  const [pedidos, clientes, usuarios, detalles, productos] = await Promise.all([
    API.get("/pedidos"),
    API.get("/clientes"),
    API.get("/users"),
    API.get("/detalle_pedidos"),
    API.get("/productos"),
  ]);

  return {
    pedidos: datos(pedidos),
    contexto: {
      clientes: datos(clientes),
      usuarios: datos(usuarios),
      detalles: datos(detalles),
      productos: datos(productos),
    },
  };
}

export async function obtenerPedidosPanel() {
  const { pedidos, contexto } = await cargarBasePedidos();
  return pedidos.map((pedido) => adaptarPedido(pedido, contexto));
}

function clienteIdSesion() {
  const usuario = obtenerSesionActual();
  const id = usuario?.cliente_idCliente ?? usuario?.idCliente ?? usuario?.clienteId;
  return id === null || id === undefined ? null : String(id);
}

export async function obtenerMisPedidosPanel() {
  const clienteId = clienteIdSesion();
  const pedidos = await obtenerPedidosPanel();
  return pedidos
    .filter((p) => String(p.clienteId) === clienteId)
    .sort((a, b) => b.fechaCreacion - a.fechaCreacion);
}

export async function cambiarEstadoPedidoPanel(idApi, estadoClave, extra = {}) {
  if (Object.keys(extra).length === 0) {
    return actualizarEstadoPedido(idApi, ESTADO_API[estadoClave]);
  }

  const { data } = await API.patch(`/pedidos/${idApi}`, {
    estadoPedido: ESTADO_API[estadoClave],
    ...extra,
  });
  return data;
}

/* ─── Recibos ───────────────────────────────────────────────────────────── */

export async function obtenerRecibosPanel() {
  const [recibos, base] = await Promise.all([API.get("/recibos"), cargarBasePedidos()]);
  const pedidosPanel = base.pedidos.map((pedido) => adaptarPedido(pedido, base.contexto));

  return datos(recibos)
    .map((recibo) => adaptarRecibo(recibo, pedidosPanel))
    .sort((a, b) => b.fecha - a.fecha);
}

export async function obtenerMisRecibosPanel() {
  const [recibos, misPedidos] = await Promise.all([
    obtenerRecibosPanel(),
    obtenerMisPedidosPanel(),
  ]);
  const ids = new Set(misPedidos.map((p) => String(p.idApi)));
  return recibos.filter((r) => ids.has(String(r.pedidoIdApi)));
}

/* ─── Usuarios y domiciliarios ──────────────────────────────────────────── */

export async function obtenerUsuariosPanel() {
  const [usuarios, clientes] = await Promise.all([API.get("/users"), API.get("/clientes")]);
  return datos(usuarios).map((usuario) => adaptarUsuario(usuario, datos(clientes)));
}

export async function obtenerDomiciliariosPanel() {
  const [usuarios, clientes] = await Promise.all([API.get("/users"), API.get("/clientes")]);

  return datos(usuarios)
    .filter((u) => Number(u.Rol_idRol) === 4)
    .map((u) => {
      const panel = adaptarUsuario(u, datos(clientes));
      return {
        id: u.domiciliario_idDomiciliario ?? u.id,
        nombre: panel.nombre,
        telefono: panel.telefono,
        activo: panel.activo,
      };
    });
}
