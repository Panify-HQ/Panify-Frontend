import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSesion from "../../hooks/useSesion.js";
import { obtenerPedidosPanel, obtenerProductosPanel, obtenerDomiciliariosPanel } from "../../services/panel.js";
import { ShoppingBag, Package, Truck, AlertTriangle, Clock, ArrowRight, BarChart2, ChevronDown, FileDown, } from "lucide-react";
import { formatCOP, formatHora } from "../../utils/formatos.js";
const ESTADO_INFO = {
    pendiente: { label: "Pendiente", color: "#F9A825", bg: "rgba(249,168,37,0.12)" },
    preparando: { label: "En preparación", color: "#1565C0", bg: "rgba(21,101,192,0.12)" },
    listo: { label: "Listo", color: "#D9903D", bg: "rgba(217,144,61,0.12)" },
    en_camino: { label: "En ruta", color: "#1565C0", bg: "rgba(21,101,192,0.12)" },
    entregado: { label: "Entregado", color: "#2E7D32", bg: "rgba(46,125,50,0.12)" },
    cancelado: { label: "Cancelado", color: "#C62828", bg: "rgba(198,40,40,0.12)" },
};
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
function mismoDia(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
/* Pedidos por día de los últimos 7 días (el último es "Hoy") */
function semanaDe(pedidos) {
    const hoy = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const dia = new Date(hoy);
        dia.setDate(hoy.getDate() - (6 - i));
        return {
            day: i === 6 ? "Hoy" : DIAS[dia.getDay()],
            orders: pedidos.filter(p => p.estado !== "cancelado" && mismoDia(p.fechaCreacion, dia)).length,
        };
    });
}
/* ─── KPI Card ─────────────────────────────────────────────────────────────── */
function KpiCard({ title, value, sub, icon, accentColor }) {
    return (<div className="pan-card p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{ background: accentColor }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--pan-text-muted)" }}>{title}</p>
        <p className="text-2xl font-bold mt-0.5 leading-none" style={{ color: "var(--pan-text)" }}>{value}</p>
        {sub && <p className="text-xs mt-1" style={{ color: "var(--pan-text-faint)" }}>{sub}</p>}
      </div>
    </div>);
}
/* ─── Badge ────────────────────────────────────────────────────────────────── */
function StatusBadge({ estado }) {
    const info = ESTADO_INFO[estado] ?? { label: estado, color: "#8D6E63", bg: "rgba(141,110,99,0.12)" };
    return (<span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ color: info.color, background: info.bg }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: info.color }}/>
      {info.label}
    </span>);
}
export default function Dashboard() {
    const sesion = useSesion();
    const navigate = useNavigate();
    const role = sesion?.rol ?? "admin";
    const onNavigate = (vista) => navigate(`/admin/${vista}`);
    const [pedidos, setPedidos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [domiciliariosBase, setDomiciliariosBase] = useState([]);
    useEffect(() => {
        let activo = true;
        Promise.allSettled([obtenerPedidosPanel(), obtenerProductosPanel(), obtenerDomiciliariosPanel()]).then(([ped, prod, dom]) => {
            if (!activo)
                return;
            if (ped.status === "fulfilled") setPedidos(ped.value);
            else console.error("Error al cargar los pedidos:", ped.reason);
            if (prod.status === "fulfilled") setProductos(prod.value);
            else console.error("Error al cargar los productos:", prod.reason);
            if (dom.status === "fulfilled") setDomiciliariosBase(dom.value);
            else console.error("Error al cargar los domiciliarios:", dom.reason);
        });
        return () => { activo = false; };
    }, []);
    const ahora = new Date();
    const domiciliarios = domiciliariosBase.map(d => {
        const delDia = pedidos.filter(p => String(p.domiciliarioId) === String(d.id) && p.estado !== "cancelado" && mismoDia(p.fechaCreacion, ahora));
        return { ...d, entregasHoy: delDia.length, entregasCompletadas: delDia.filter(p => p.estado === "entregado").length };
    });
    const week = semanaDe(pedidos);
    const maxOrders = Math.max(1, ...week.map(d => d.orders));
    const [reportType, setReportType] = useState("diario");
    const [showReport, setShowReport] = useState(false);
    const hoy = pedidos.filter(p => !["cancelado"].includes(p.estado));
    const pendientes = pedidos.filter(p => p.estado === "pendiente");
    const stockBajo = productos.filter(p => p.status === "stock_bajo" || p.status === "agotado");
    const enRuta = pedidos.filter(p => p.estado === "en_camino");
    const prioridades = [...pedidos]
        .filter(p => !["entregado", "cancelado"].includes(p.estado))
        .sort((a, b) => a.fechaCreacion.getTime() - b.fechaCreacion.getTime())
        .slice(0, 6);
    function canSeeSection(section) {
        if (role === "superadmin" || role === "admin")
            return true;
        if (role === "panadero")
            return ["inventario", "pedidos"].includes(section);
        if (role === "domiciliario")
            return section === "entregas";
        return false;
    }
    return (<div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--pan-text)" }}>
            Panel de gestión
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--pan-text-muted)" }}>
            {new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
          </p>
        </div>

        {/* Generar reporte */}
        <div className="relative flex-shrink-0">
          <div className="flex items-center gap-0 rounded-xl overflow-hidden border" style={{ borderColor: "var(--pan-accent)" }}>
            <button onClick={() => { alert(`Generando reporte ${reportType}…`); }} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors" style={{ background: "var(--pan-accent)", color: "#fff" }}>
              <FileDown size={15}/>
              Reporte {reportType}
            </button>
            <button onClick={() => setShowReport(p => !p)} className="px-2 py-2 transition-colors" style={{ background: "var(--pan-accent-hover)", color: "#fff" }}>
              <ChevronDown size={15} style={{ transform: showReport ? "rotate(180deg)" : "" }}/>
            </button>
          </div>
          {showReport && (<div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-10 pop-in" style={{ background: "var(--pan-surface)", border: "1px solid var(--pan-border)", boxShadow: "var(--pan-shadow-md)", minWidth: "140px" }}>
              {["diario", "semanal", "mensual"].map(t => (<button key={t} onClick={() => { setReportType(t); setShowReport(false); }} className="w-full px-4 py-2.5 text-[13px] text-left transition-colors capitalize" style={{ color: reportType === t ? "var(--pan-accent)" : "var(--pan-text)", background: reportType === t ? "rgba(217,144,61,0.08)" : "transparent" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = reportType === t ? "rgba(217,144,61,0.08)" : "transparent"; }}>
                  {t}
                </button>))}
            </div>)}
        </div>
      </div>

      {/* Alerta de hora de cierre */}
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl" style={{ background: "rgba(249,168,37,0.12)", border: "1px solid rgba(249,168,37,0.3)" }}>
        <Clock size={16} style={{ color: "#F9A825", flexShrink: 0 }}/>
        <p className="text-sm font-medium" style={{ color: "var(--pan-text)" }}>
          <strong style={{ color: "#F9A825" }}>Control de horario:</strong>{" "}
          Los pedidos para hoy cierran a las <strong>6:00 PM</strong>. Asegúrate de tener todo listo antes de esa hora.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Pedidos de hoy" value={String(hoy.length)} sub="En total activos" icon={<ShoppingBag size={20}/>} accentColor="#D9903D"/>
        <KpiCard title="Pendientes" value={String(pendientes.length)} sub="Esperando atención" icon={<AlertTriangle size={20}/>} accentColor={pendientes.length > 2 ? "#C62828" : "#F9A825"}/>
        <KpiCard title="Stock bajo" value={String(stockBajo.length)} sub={`${productos.filter(p => p.status === "agotado").length} agotados`} icon={<Package size={20}/>} accentColor={stockBajo.length > 0 ? "#F9A825" : "#2E7D32"}/>
        <KpiCard title="En ruta ahora" value={String(enRuta.length)} sub={`${domiciliarios.filter(d => d.activo).length} domiciliarios activos`} icon={<Truck size={20}/>} accentColor="#1565C0"/>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Panel de prioridades */}
        <div className="xl:col-span-2 pan-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--pan-border)" }}>
            <div>
              <h2 className="font-semibold" style={{ color: "var(--pan-text)" }}>Panel de Prioridades</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--pan-text-muted)" }}>Pedidos ordenados por hora de llegada y urgencia</p>
            </div>
            {canSeeSection("pedidos") && (<button onClick={() => onNavigate("pedidos")} className="flex items-center gap-1 text-xs font-medium transition-colors" style={{ color: "var(--pan-accent)" }}>
                Ver todos <ArrowRight size={13}/>
              </button>)}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--pan-surface-2)" }}>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--pan-text-muted)" }}>Pedido</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: "var(--pan-text-muted)" }}>Cliente</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: "var(--pan-text-muted)" }}>Hora</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--pan-text-muted)" }}>Total</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--pan-text-muted)" }}>Estado</th>
                  {canSeeSection("pedidos") && (<th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: "var(--pan-text-muted)" }}>Acción</th>)}
                </tr>
              </thead>
              <tbody>
                {prioridades.map((p, i) => (<tr key={p.id} className="transition-colors" style={{ background: i % 2 === 1 ? "var(--pan-surface-2)" : "transparent" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 1 ? "var(--pan-surface-2)" : "transparent"; }}>
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-semibold" style={{ color: "var(--pan-accent)" }}>{p.id}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <p className="text-sm font-medium" style={{ color: "var(--pan-text)" }}>{p.clienteNombre}</p>
                      <p className="text-xs" style={{ color: "var(--pan-text-muted)" }}>{p.items.length} ítem{p.items.length !== 1 ? "s" : ""}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs flex items-center gap-1" style={{ color: "var(--pan-text-muted)" }}>
                        <Clock size={11}/>{formatHora(p.fechaCreacion)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold" style={{ color: "var(--pan-text)" }}>{formatCOP(p.total)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge estado={p.estado}/>
                    </td>
                    {canSeeSection("pedidos") && (<td className="px-4 py-3.5 hidden lg:table-cell">
                        <button onClick={() => onNavigate("pedidos")} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors" style={{ color: "var(--pan-accent)", background: "rgba(217,144,61,0.1)" }}>
                          Gestionar
                        </button>
                      </td>)}
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Domiciliarios */}
        <div className="pan-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--pan-border)" }}>
            <h2 className="font-semibold" style={{ color: "var(--pan-text)" }}>Domiciliarios</h2>
            {canSeeSection("entregas") && (<button onClick={() => onNavigate("entregas")} className="text-xs font-medium" style={{ color: "var(--pan-accent)" }}>
                Ver rutas <ArrowRight size={12} className="inline"/>
              </button>)}
          </div>
          <div>
            {domiciliarios.map(d => {
            const pct = d.entregasHoy > 0 ? Math.round((d.entregasCompletadas / d.entregasHoy) * 100) : 0;
            const statusMap = {
                true: { label: d.entregasCompletadas < d.entregasHoy ? "En Ruta" : "Disponible", color: "#2E7D32" },
                false: { label: "Fuera de Servicio", color: "#C62828" },
            };
            const st = statusMap[String(d.activo)];
            return (<div key={d.id} className="px-5 py-3.5 transition-colors" style={{ borderBottom: "1px solid var(--pan-border-soft)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0" style={{ background: d.activo ? "rgba(46,125,50,0.15)" : "rgba(141,110,99,0.15)", color: d.activo ? "#2E7D32" : "#8D6E63" }}>
                      {d.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--pan-text)" }}>{d.nombre}</p>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ color: st.color, background: `${st.color}18` }}>
                          {st.label}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--pan-border)" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: d.activo ? "#2E7D32" : "#8D6E63" }}/>
                        </div>
                        <span className="text-[10px]" style={{ color: "var(--pan-text-faint)" }}>{d.entregasCompletadas}/{d.entregasHoy}</span>
                      </div>
                    </div>
                  </div>
                </div>);
        })}
          </div>
        </div>
      </div>

      {/* Inventory table + Chart side by side */}
      {canSeeSection("inventario") && (<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Inventory table */}
          <div className="xl:col-span-2 pan-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--pan-border)" }}>
              <div>
                <h2 className="font-semibold" style={{ color: "var(--pan-text)" }}>Inventario</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--pan-text-muted)" }}>Stock actual vs. mínimo requerido</p>
              </div>
              <button onClick={() => onNavigate("inventario")} className="text-xs font-medium" style={{ color: "var(--pan-accent)" }}>
                Ver todo <ArrowRight size={12} className="inline"/>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--pan-surface-2)" }}>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--pan-text-muted)" }}>Producto</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: "var(--pan-text-muted)" }}>Stock actual</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--pan-text-muted)" }}>Nivel</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--pan-text-muted)" }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.slice(0, 7).map((p, i) => {
                const pct = Math.min(100, Math.round((p.stock / (Math.max(1, p.minStock) * 3)) * 100));
                const statusInfo = {
                    disponible: { label: "Disponible", color: "#2E7D32", bg: "rgba(46,125,50,0.12)", bar: "#2E7D32" },
                    stock_bajo: { label: "Stock bajo", color: "#F9A825", bg: "rgba(249,168,37,0.12)", bar: "#F9A825" },
                    agotado: { label: "Agotado", color: "#C62828", bg: "rgba(198,40,40,0.12)", bar: "#C62828" },
                }[p.status];
                return (<tr key={p.id} className="transition-colors" style={{ background: i % 2 === 1 ? "var(--pan-surface-2)" : "transparent" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 1 ? "var(--pan-surface-2)" : "transparent"; }}>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{p.emoji}</span>
                            <div>
                              <p className="text-sm font-medium" style={{ color: "var(--pan-text)" }}>{p.nombre}</p>
                              <p className="text-[10px]" style={{ color: "var(--pan-text-faint)" }}>{p.categoria}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="text-sm font-semibold" style={{ color: "var(--pan-text)" }}>{p.stock} <span className="font-normal text-xs" style={{ color: "var(--pan-text-muted)" }}>{p.unidad}</span></p>
                          <p className="text-[10px]" style={{ color: "var(--pan-text-faint)" }}>mín. {p.minStock}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--pan-border)" }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: statusInfo.bar }}/>
                            </div>
                            <span className="text-[10px]" style={{ color: "var(--pan-text-faint)" }}>{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ color: statusInfo.color, background: statusInfo.bg }}>
                            {statusInfo.label}
                          </span>
                        </td>
                      </tr>);
            })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weekly chart */}
          <div className="pan-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={16} style={{ color: "var(--pan-accent)" }}/>
              <h2 className="font-semibold" style={{ color: "var(--pan-text)" }}>Pedidos por día</h2>
            </div>
            <div className="flex items-end gap-2 h-36">
              {week.map((d, i) => {
                const pct = (d.orders / maxOrders) * 100;
                const isToday = i === week.length - 1;
                return (<div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-semibold" style={{ color: isToday ? "var(--pan-accent)" : "var(--pan-text-muted)" }}>
                      {d.orders}
                    </span>
                    <div className="w-full rounded-t-md transition-all" style={{
                        height: `${pct}%`,
                        minHeight: "4px",
                        background: isToday ? "var(--pan-accent)" : "var(--pan-border)",
                    }}/>
                    <span className="text-[9px]" style={{ color: isToday ? "var(--pan-accent)" : "var(--pan-text-faint)", fontWeight: isToday ? "700" : "500" }}>
                      {d.day}
                    </span>
                  </div>);
            })}
            </div>
            <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid var(--pan-border)" }}>
              <div>
                <p className="text-[10px]" style={{ color: "var(--pan-text-muted)" }}>Total semana</p>
                <p className="text-lg font-bold" style={{ color: "var(--pan-text)" }}>
                  {week.reduce((s, d) => s + d.orders, 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px]" style={{ color: "var(--pan-text-muted)" }}>Hoy</p>
                <p className="text-lg font-bold" style={{ color: "var(--pan-accent)" }}>
                  {week[week.length - 1].orders}
                </p>
              </div>
            </div>
          </div>
        </div>)}
    </div>);
}
