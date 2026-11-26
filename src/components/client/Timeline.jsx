import { Package, ChefHat, Truck, CheckCircle } from "lucide-react";
export const ESTADO_TIMELINE = [
    { key: "recibido", label: "Recibido", icon: <Package size={15}/>, states: ["pendiente"] },
    { key: "preparando", label: "En preparación", icon: <ChefHat size={15}/>, states: ["preparando", "listo"] },
    { key: "en_ruta", label: "En ruta", icon: <Truck size={15}/>, states: ["en_camino"] },
    { key: "entregado", label: "Entregado", icon: <CheckCircle size={15}/>, states: ["entregado"] },
];
export function getTimelineStep(estado) {
    for (let i = 0; i < ESTADO_TIMELINE.length; i++) {
        if (ESTADO_TIMELINE[i].states.includes(estado))
            return i;
    }
    return 0;
}
// Mis pedidos = first 3 pedidos (simulating client's orders)
