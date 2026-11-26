import { useEffect, useState } from "react";
import { obtenerPedidosPanel, obtenerProductosPanel, obtenerMisPedidosPanel } from "../services/panel.js";
import { formatHora } from "../utils/formatos.js";

// Genera las notificaciones de la campana a partir de datos reales:
// stock bajo y pedidos nuevos para el personal, estado de pedidos para el cliente.
export default function useNotificaciones(rol) {
  const [estado, setEstado] = useState({
    notificaciones: [],
    pedidosPendientes: 0,
    entregasActivas: 0,
  });

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        if (rol === "cliente") {
          const pedidos = await obtenerMisPedidosPanel();
          const notificaciones = pedidos
            .filter((p) => ["entregado", "en_camino", "preparando"].includes(p.estado))
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              tipo: p.estado === "entregado" ? "success" : "info",
              texto:
                p.estado === "entregado"
                  ? `Tu pedido ${p.id} fue entregado`
                  : p.estado === "en_camino"
                    ? `Tu pedido ${p.id} está en camino`
                    : `Tu pedido ${p.id} está en preparación`,
              hora: formatHora(p.fechaCreacion),
              sinLeer: p.estado !== "entregado",
            }));

          notificaciones.push({
            id: "hora-limite",
            tipo: "warning",
            texto: "Recuerda: los pedidos para el mismo día cierran a las 6:00 PM",
            hora: "",
            sinLeer: false,
          });

          if (activo) setEstado({ notificaciones, pedidosPendientes: 0, entregasActivas: 0 });
          return;
        }

        const [pedidos, productos] = await Promise.all([
          ["superadmin", "admin", "panadero", "domiciliario"].includes(rol)
            ? obtenerPedidosPanel()
            : Promise.resolve([]),
          ["superadmin", "admin", "panadero"].includes(rol)
            ? obtenerProductosPanel()
            : Promise.resolve([]),
        ]);

        const notificaciones = [
          ...productos
            .filter((p) => p.status === "agotado" || p.status === "stock_bajo")
            .slice(0, 4)
            .map((p) => ({
              id: `stock-${p.id}`,
              tipo: "warning",
              texto:
                p.status === "agotado"
                  ? `${p.nombre} está agotado`
                  : `${p.nombre} en stock bajo (${p.stock} unidades)`,
              hora: "",
              sinLeer: true,
            })),
          ...pedidos
            .filter((p) => p.estado === "pendiente")
            .slice(0, 4)
            .map((p) => ({
              id: `pedido-${p.id}`,
              tipo: "info",
              texto: `Nuevo pedido ${p.id} de ${p.clienteNombre}`,
              hora: formatHora(p.fechaCreacion),
              sinLeer: true,
            })),
        ];

        if (activo) {
          setEstado({
            notificaciones,
            pedidosPendientes: pedidos.filter((p) => p.estado === "pendiente").length,
            entregasActivas: pedidos.filter(
              (p) => ["listo", "en_camino"].includes(p.estado) && p.tipoEntrega === "domicilio",
            ).length,
          });
        }
      } catch (error) {
        console.error("No se pudieron cargar las notificaciones:", error);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [rol]);

  return estado;
}
