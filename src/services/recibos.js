import API from "./api.js";

const RECEIPTS_PATH = "/api/v1/receipts/";

export async function obtenerRecibos({
  search = "",
  page = 1,
  pageSize = 20,
} = {}) {
  const params = { page, page_size: pageSize };
  if (search.trim()) params.search = search.trim();

  const { data } = await API.get(RECEIPTS_PATH, { params });
  return data;
}

export async function obtenerRecibo(idRecibo) {
  const { data } = await API.get(`${RECEIPTS_PATH}${idRecibo}`);
  return data;
}

export async function descargarReciboPdf(idRecibo) {
  const { data } = await API.get(`${RECEIPTS_PATH}${idRecibo}/pdf`, {
    responseType: "blob",
  });
  return data;
}

export async function obtenerDetallePedido(idRecibo) {
  const recibo = await obtenerRecibo(idRecibo);

  return (recibo.productos ?? []).map((producto, index) => ({
    id: producto.idProducto ?? index,
    producto: producto.nombreProducto,
    cantidad: Number(producto.cantidad) || 0,
    precio: Number(producto.precioUnitario) || 0,
    subtotal: Number(producto.subtotal) || 0,
  }));
}
