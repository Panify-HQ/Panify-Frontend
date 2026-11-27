import API from "./api.js";

export async function actualizarEstadoPedido(idPedido, nuevoEstado) {
  const response = await API.patch(`/pedidos/${idPedido}`, {
    estadoPedido: nuevoEstado,
  });

  return response.data;
}
