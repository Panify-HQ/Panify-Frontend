import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, Truck, CheckCircle, AlertTriangle } from "lucide-react";
import useCarrito from "../../hooks/useCarrito.js";
import { formatCOP, formatFecha } from "../../utils/formatos.js";
import { imagenDeProducto } from "../../utils/adaptadores.js";
export default function Carrito() {
    const navigate = useNavigate();
    const { carrito, actualizar: onUpdate, quitar: onRemove, vaciar } = useCarrito();
    const [confirmado, setConfirmado] = useState(false);
    const cart = carrito.map(item => ({ producto: item, cantidad: item.cantidad }));
    // Confirmación local: aún no existe un endpoint para registrar pedidos.
    function onCheckout() {
        vaciar();
        setConfirmado(true);
    }
    const total = cart.reduce((s, c) => s + c.producto.precio * c.cantidad, 0);
    const ahora = new Date();
    const horaLimite = 18;
    const horaActual = ahora.getHours();
    const pasaronHora = horaActual >= horaLimite;
    const manana = new Date(ahora);
    manana.setDate(manana.getDate() + 1);
    const fechaEntrega = pasaronHora ? manana : ahora;
    return (<div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6" style={{ color: "var(--pan-text)" }}>Mi carrito</h1>

      {confirmado && cart.length === 0 ? (<div className="pan-card p-12 text-center">
          <CheckCircle size={48} className="mx-auto mb-4" style={{ color: "#2E7D32" }}/>
          <p className="font-semibold" style={{ color: "var(--pan-text)" }}>¡Pedido confirmado!</p>
          <p className="text-sm mt-1 mb-5" style={{ color: "var(--pan-text-muted)" }}>Puedes seguir su estado en Mis pedidos.</p>
          <button onClick={() => navigate("/cliente/pedidos")} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--pan-accent)" }}>Ver mis pedidos</button>
        </div>) : cart.length === 0 ? (<div className="pan-card p-12 text-center">
          <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" style={{ color: "var(--pan-text)" }}/>
          <p className="font-semibold" style={{ color: "var(--pan-text)" }}>Tu carrito está vacío</p>
          <p className="text-sm mt-1" style={{ color: "var(--pan-text-muted)" }}>Agrega productos desde el catálogo</p>
        </div>) : (<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Items */}
          <div className="lg:col-span-3 space-y-3">
            {cart.map(({ producto: p, cantidad }) => (<div key={p.id} className="pan-card p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-oro-cream">
                  <img src={imagenDeProducto(p.nombre)} alt={p.nombre} className="w-full h-full object-cover"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "var(--pan-text)" }}>{p.nombre}</p>
                  <p className="text-xs" style={{ color: "var(--pan-text-muted)" }}>{formatCOP(p.precio)} c/u</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 rounded-lg border overflow-hidden" style={{ borderColor: "var(--pan-border)" }}>
                      <button onClick={() => onUpdate(p.id, cantidad - 1)} className="px-2 py-1.5 text-xs transition-colors" style={{ color: "var(--pan-text-muted)" }}>
                        <Minus size={11}/>
                      </button>
                      <span className="text-xs font-semibold w-5 text-center" style={{ color: "var(--pan-text)" }}>{cantidad}</span>
                      <button onClick={() => onUpdate(p.id, cantidad + 1)} className="px-2 py-1.5 text-xs transition-colors" style={{ color: "var(--pan-text-muted)" }}>
                        <Plus size={11}/>
                      </button>
                    </div>
                    <button onClick={() => onRemove(p.id)} className="text-xs transition-colors" style={{ color: "#C62828" }}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
                <p className="font-bold text-sm flex-shrink-0" style={{ color: "var(--pan-text)" }}>{formatCOP(p.precio * cantidad)}</p>
              </div>))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="pan-card p-5 sticky top-20">
              <h2 className="font-semibold mb-4" style={{ color: "var(--pan-text)" }}>Resumen del pedido</h2>

              {/* Fecha entrega */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl" style={{ background: "var(--pan-surface-2)" }}>
                <Truck size={14} style={{ color: "var(--pan-accent)", flexShrink: 0 }}/>
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--pan-text-muted)" }}>Entrega estimada</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--pan-text)" }}>
                    {pasaronHora ? `Mañana, ${formatFecha(manana)}` : `Hoy, ${formatFecha(ahora)}`} · 7–9 AM
                  </p>
                </div>
              </div>

              {/* Advertencia hora */}
              {pasaronHora && (<div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl" style={{ background: "rgba(249,168,37,0.12)", border: "1px solid rgba(249,168,37,0.25)" }}>
                  <AlertTriangle size={13} style={{ color: "#F9A825", flexShrink: 0, marginTop: 2 }}/>
                  <p className="text-[11px]" style={{ color: "var(--pan-text)" }}>
                    Pasó la hora límite (6:00 PM). Tu pedido será entregado <strong>mañana</strong>.
                  </p>
                </div>)}

              <div className="space-y-2 mb-4" style={{ borderBottom: "1px solid var(--pan-border)", paddingBottom: "1rem" }}>
                {cart.map(({ producto: p, cantidad }) => (<div key={p.id} className="flex justify-between text-xs">
                    <span style={{ color: "var(--pan-text-muted)" }}>{p.nombre} × {cantidad}</span>
                    <span style={{ color: "var(--pan-text)" }}>{formatCOP(p.precio * cantidad)}</span>
                  </div>))}
              </div>

              <div className="flex justify-between font-bold mb-5">
                <span style={{ color: "var(--pan-text)" }}>Total</span>
                <span style={{ color: "var(--pan-accent)" }}>{formatCOP(total)}</span>
              </div>

              <button onClick={onCheckout} className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-colors" style={{ background: "var(--pan-accent)" }}>
                Confirmar pedido
              </button>
            </div>
          </div>
        </div>)}
    </div>);
}
/* ─── MIS PEDIDOS ───────────────────────────────────────────────────────────── */
