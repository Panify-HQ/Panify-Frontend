import { useEffect, useState } from "react";
import { Package, ChevronDown } from "lucide-react";
import { obtenerMisPedidosPanel } from "../../services/panel.js";
import { formatCOP, formatFecha } from "../../utils/formatos.js";
import { ESTADO_TIMELINE, getTimelineStep } from "../../components/client/Timeline.jsx";
export default function MisPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    useEffect(() => {
        obtenerMisPedidosPanel()
            .then(setPedidos)
            .catch(e => console.error("Error al cargar los pedidos:", e))
            .finally(() => setCargando(false));
    }, []);
    const [expanded, setExpanded] = useState(null);
    const ESTADO_INFO = {
        pendiente: { label: "Recibido", color: "#F9A825", bg: "rgba(249,168,37,0.12)" },
        preparando: { label: "En preparación", color: "#1565C0", bg: "rgba(21,101,192,0.12)" },
        listo: { label: "En preparación", color: "#1565C0", bg: "rgba(21,101,192,0.12)" },
        en_camino: { label: "En ruta", color: "#1565C0", bg: "rgba(21,101,192,0.12)" },
        entregado: { label: "Entregado", color: "#2E7D32", bg: "rgba(46,125,50,0.12)" },
        cancelado: { label: "Cancelado", color: "#C62828", bg: "rgba(198,40,40,0.12)" },
    };
    return (<div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6" style={{ color: "var(--pan-text)" }}>Mis pedidos</h1>

      <div className="space-y-3">
        {pedidos.map(p => {
            const info = ESTADO_INFO[p.estado] ?? ESTADO_INFO.pendiente;
            const step = getTimelineStep(p.estado);
            const open = expanded === p.id;
            return (<div key={p.id} className="pan-card overflow-hidden">
              <button onClick={() => setExpanded(open ? null : p.id)} className="w-full flex items-center gap-4 p-5 text-left transition-colors" onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: "var(--pan-accent)" }}>{p.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ color: info.color, background: info.bg }}>{info.label}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--pan-text-muted)" }}>{formatFecha(p.fechaCreacion)} · {p.items.length} producto{p.items.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold" style={{ color: "var(--pan-text)" }}>{formatCOP(p.total)}</span>
                  <ChevronDown size={16} style={{ color: "var(--pan-text-faint)", transform: open ? "rotate(180deg)" : "", transition: "transform 0.2s" }}/>
                </div>
              </button>

              {open && (<div className="px-5 pb-5" style={{ borderTop: "1px solid var(--pan-border)" }}>
                  {/* Timeline */}
                  <div className="flex items-center gap-0 py-4">
                    {ESTADO_TIMELINE.map((t, i) => {
                        const done = i <= step;
                        const current = i === step;
                        return (<div key={t.key} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all" style={{
                                background: done ? "var(--pan-accent)" : "var(--pan-surface-2)",
                                borderColor: done ? "var(--pan-accent)" : "var(--pan-border)",
                                color: done ? "#fff" : "var(--pan-text-faint)",
                                boxShadow: current ? "0 0 0 3px rgba(217,144,61,0.2)" : "none",
                            }}>
                              {t.icon}
                            </div>
                            <span className="text-[9px] font-medium text-center leading-tight w-14" style={{ color: done ? "var(--pan-accent)" : "var(--pan-text-faint)" }}>
                              {t.label}
                            </span>
                          </div>
                          {i < ESTADO_TIMELINE.length - 1 && (<div className="flex-1 h-0.5 mb-5 mx-0.5 rounded" style={{ background: i < step ? "var(--pan-accent)" : "var(--pan-border)" }}/>)}
                        </div>);
                    })}
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mt-1">
                    {p.items.map((item, i) => (<div key={i} className="flex justify-between text-sm">
                        <span style={{ color: "var(--pan-text)" }}>{item.nombre} × {item.cantidad}</span>
                        <span style={{ color: "var(--pan-text-muted)" }}>{formatCOP(item.subtotal)}</span>
                      </div>))}
                    <div className="flex justify-between font-bold pt-2" style={{ borderTop: "1px solid var(--pan-border)" }}>
                      <span style={{ color: "var(--pan-text)" }}>Total</span>
                      <span style={{ color: "var(--pan-accent)" }}>{formatCOP(p.total)}</span>
                    </div>
                  </div>
                </div>)}
            </div>);
        })}
      </div>

      {!cargando && pedidos.length === 0 && (<div className="pan-card p-12 text-center">
          <Package size={40} className="mx-auto mb-3 opacity-20" style={{ color: "var(--pan-text)" }}/>
          <p style={{ color: "var(--pan-text-muted)" }}>Aún no tienes pedidos</p>
        </div>)}
    </div>);
}
/* ─── MIS RECIBOS ───────────────────────────────────────────────────────────── */
