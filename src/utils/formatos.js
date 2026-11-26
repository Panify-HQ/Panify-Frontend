// Formateadores usados por las vistas del panel (diseño Mockup_Panify).

export function formatCOP(monto) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(monto) || 0);
}

export function formatFecha(fecha) {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha);
}

export function formatHora(fecha) {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) return "--:--";
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

export function codigoPedido(id) {
  return `ORD-${String(id).padStart(3, "0")}`;
}

export function codigoRecibo(id) {
  return `REC-${String(id).padStart(3, "0")}`;
}
