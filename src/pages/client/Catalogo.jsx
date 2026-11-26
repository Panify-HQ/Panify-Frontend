import { useEffect, useState } from "react";
import { Plus, Minus, Search } from "lucide-react";
import useCarrito from "../../hooks/useCarrito.js";
import { obtenerProductosPanel } from "../../services/panel.js";
import { formatCOP } from "../../utils/formatos.js";
import { imagenDeProducto } from "../../utils/adaptadores.js";
export default function Catalogo() {
    const { carrito, agregar: onAddToCart } = useCarrito();
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    useEffect(() => {
        obtenerProductosPanel()
            .then(setProductos)
            .catch(e => console.error("Error al cargar los productos:", e))
            .finally(() => setCargando(false));
    }, []);
    const [q, setQ] = useState("");
    const [cat, setCat] = useState("Todos");
    const [qty, setQty] = useState({});
    const categorias = ["Todos", ...Array.from(new Set(productos.map(p => p.categoria)))];
    const filtered = productos.filter(p => {
        const matchQ = p.nombre.toLowerCase().includes(q.toLowerCase());
        const matchC = cat === "Todos" || p.categoria === cat;
        return matchQ && matchC;
    });
    function getQty(id) { return qty[id] ?? 1; }
    function setQ2(id, v) { setQty(prev => ({ ...prev, [id]: Math.max(1, v) })); }
    return (<div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6" style={{ color: "var(--pan-text)" }}>Catálogo</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--pan-text-faint)" }}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar productos…" className="pan-input pl-9 h-10"/>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categorias.map(c => (<button key={c} onClick={() => setCat(c)} className="px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0" style={{
                background: cat === c ? "var(--pan-accent)" : "var(--pan-surface)",
                color: cat === c ? "#fff" : "var(--pan-text-muted)",
                border: `1px solid ${cat === c ? "var(--pan-accent)" : "var(--pan-border)"}`,
            }}>
              {c}
            </button>))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {filtered.map(p => {
            const inCart = carrito.some(c => c.id === p.id);
            return (<div key={p.id} className="pan-card overflow-hidden flex flex-col">
              <div className="h-40 relative bg-oro-cream overflow-hidden">
                <img src={imagenDeProducto(p.nombre)} alt={p.nombre} className="w-full h-full object-cover"/>
                {p.status === "agotado" && (<div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <span className="text-xs font-bold text-white px-3 py-1 rounded-full" style={{ background: "#C62828" }}>Agotado</span>
                  </div>)}
              </div>
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--pan-text)" }}>{p.nombre}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--pan-text-muted)" }}>{p.categoria}</p>
                  <p className="font-bold mt-1" style={{ color: "var(--pan-accent)" }}>{formatCOP(p.precio)}</p>
                </div>
                {p.status !== "agotado" && (<div className="flex items-center gap-2 mt-auto">
                    <div className="flex items-center gap-1 rounded-lg border overflow-hidden" style={{ borderColor: "var(--pan-border)" }}>
                      <button onClick={() => setQ2(p.id, getQty(p.id) - 1)} className="px-2.5 py-2 transition-colors" style={{ color: "var(--pan-text-muted)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                        <Minus size={12}/>
                      </button>
                      <span className="text-xs font-semibold w-5 text-center" style={{ color: "var(--pan-text)" }}>{getQty(p.id)}</span>
                      <button onClick={() => setQ2(p.id, getQty(p.id) + 1)} className="px-2.5 py-2 transition-colors" style={{ color: "var(--pan-text-muted)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                        <Plus size={12}/>
                      </button>
                    </div>
                    <button onClick={() => onAddToCart(p, getQty(p.id))} className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all" style={{
                        background: inCart ? "rgba(46,125,50,0.12)" : "var(--pan-accent)",
                        color: inCart ? "#2E7D32" : "#fff",
                    }}>
                      {inCart ? "✓ En carrito" : "Agregar"}
                    </button>
                  </div>)}
              </div>
            </div>);
        })}
      </div>

      {cargando && (<p className="text-center py-16 text-sm" style={{ color: "var(--pan-text-muted)" }}>Cargando productos…</p>)}

      {!cargando && filtered.length === 0 && (<div className="text-center py-16">
          <p className="text-4xl mb-3">🍞</p>
          <p className="text-sm" style={{ color: "var(--pan-text-muted)" }}>No se encontraron productos para "{q}"</p>
        </div>)}
    </div>);
}
/* ─── CARRITO ───────────────────────────────────────────────────────────────── */
