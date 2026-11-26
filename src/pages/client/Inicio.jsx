import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, Package, FileText, Clock, CheckCircle, Truck, ChefHat, Download, ChevronDown, ChevronRight, AlertTriangle, Search, Star, } from "lucide-react";
import useSesion from "../../hooks/useSesion.js";
import { obtenerMisPedidosPanel, obtenerProductosPanel } from "../../services/panel.js";
import { formatCOP, formatFecha } from "../../utils/formatos.js";
import { imagenDeProducto } from "../../utils/adaptadores.js";
import { ESTADO_TIMELINE, getTimelineStep } from "../../components/client/Timeline.jsx";
export default function Inicio() {
    const navigate = useNavigate();
    const sesion = useSesion();
    const onNavigate = (vista) => navigate(`/cliente/${vista}`);
    const [pedidos, setPedidos] = useState([]);
    const [productos, setProductos] = useState([]);
    useEffect(() => {
        obtenerMisPedidosPanel().then(setPedidos).catch(e => console.error("Error al cargar los pedidos:", e));
        obtenerProductosPanel().then(setProductos).catch(e => console.error("Error al cargar los productos:", e));
    }, []);
    const ultimoPedido = pedidos[0];
    const step = ultimoPedido ? getTimelineStep(ultimoPedido.estado) : 0;
    const destacados = productos.filter(p => p.status === "disponible").slice(0, 4);
    return (<div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden min-h-[240px] flex items-end">
        <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&h=400&fit=crop&auto=format" alt="Pan artesanal" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(62,39,35,0.85) 0%, rgba(62,39,35,0.25) 60%, transparent 100%)" }}/>
        <div className="relative z-10 p-7">
          <p className="text-sm font-medium text-white/70 mb-1">Bienvenido de vuelta</p>
          <h1 className="font-display text-3xl font-bold text-white">
            Hola, <span style={{ color: "var(--pan-accent)" }}>{sesion?.nombreCorto ?? "Cliente"}</span> 👋
          </h1>
          <p className="text-sm text-white/70 mt-1">¿Qué te apetece hoy? Haz tu pedido antes de las 6:00 PM.</p>
          <button onClick={() => onNavigate("catalogo")} className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all" style={{ background: "var(--pan-accent)", color: "#fff" }}>
            <ShoppingCart size={15}/>
            Hacer nuevo pedido
          </button>
        </div>
      </section>

      {/* Alerta hora límite */}
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl" style={{ background: "rgba(249,168,37,0.12)", border: "1px solid rgba(249,168,37,0.3)" }}>
        <Clock size={16} style={{ color: "#F9A825", flexShrink: 0 }}/>
        <p className="text-sm" style={{ color: "var(--pan-text)" }}>
          <strong style={{ color: "#F9A825" }}>Recuerda:</strong>{" "}
          Los pedidos para entrega el mismo día cierran a las <strong>6:00 PM</strong>.
        </p>
      </div>

      {/* Último pedido */}
      {ultimoPedido && (<section>
          <h2 className="font-display text-lg font-semibold mb-4" style={{ color: "var(--pan-text)" }}>Tu pedido reciente</h2>
          <div className="pan-card p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="font-bold" style={{ color: "var(--pan-accent)" }}>{ultimoPedido.id}</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--pan-text-muted)" }}>{formatFecha(ultimoPedido.fechaCreacion)}</p>
              </div>
              <span className="font-bold text-lg" style={{ color: "var(--pan-text)" }}>{formatCOP(ultimoPedido.total)}</span>
            </div>
            {/* Timeline */}
            <div className="flex items-center gap-0">
              {ESTADO_TIMELINE.map((t, i) => {
                const done = i <= step;
                const current = i === step;
                return (<div key={t.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all border-2" style={{
                        background: done ? "var(--pan-accent)" : "var(--pan-surface-2)",
                        borderColor: done ? "var(--pan-accent)" : "var(--pan-border)",
                        color: done ? "#fff" : "var(--pan-text-faint)",
                        boxShadow: current ? `0 0 0 3px ${`rgba(217,144,61,0.25)`}` : "none",
                    }}>
                        {t.icon}
                      </div>
                      <span className="text-[10px] font-medium text-center leading-tight w-16" style={{ color: done ? "var(--pan-accent)" : "var(--pan-text-faint)" }}>
                        {t.label}
                      </span>
                    </div>
                    {i < ESTADO_TIMELINE.length - 1 && (<div className="flex-1 h-0.5 mb-5 mx-1 rounded" style={{ background: i < step ? "var(--pan-accent)" : "var(--pan-border)" }}/>)}
                  </div>);
            })}
            </div>
          </div>
        </section>)}

      {/* Productos destacados */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold" style={{ color: "var(--pan-text)" }}>Productos destacados</h2>
          <button onClick={() => onNavigate("catalogo")} className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--pan-accent)" }}>
            Ver todo <ChevronRight size={14}/>
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {destacados.map(p => (<div key={p.id} className="pan-card overflow-hidden">
              <div className="h-32 bg-oro-cream overflow-hidden">
                <img src={imagenDeProducto(p.nombre)} alt={p.nombre} className="w-full h-full object-cover"/>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold leading-tight" style={{ color: "var(--pan-text)" }}>{p.nombre}</p>
                <p className="text-xs mt-0.5 font-bold" style={{ color: "var(--pan-accent)" }}>{formatCOP(p.precio)}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={9} fill="#D9903D" style={{ color: "#D9903D" }}/>)}
                  <span className="text-[9px]" style={{ color: "var(--pan-text-faint)" }}>(24)</span>
                </div>
              </div>
            </div>))}
        </div>
      </section>
    </div>);
}
/* ─── CATÁLOGO ──────────────────────────────────────────────────────────────── */
