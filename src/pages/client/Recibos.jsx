import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import {
    obtenerMisRecibosPanel,
    obtenerReciboDetallePanel,
} from "../../services/panel.js";
import { descargarReciboPdf } from "../../services/recibos.js";
import { formatCOP, formatFecha } from "../../utils/formatos.js";
export default function MisRecibos() {
    const [recibos, setRecibos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        obtenerMisRecibosPanel()
            .then(setRecibos)
            .catch(e => console.error("Error al cargar los recibos:", e))
            .finally(() => setCargando(false));
    }, []);
    const [reciboDetalle, setReciboDetalle] = useState(null);
    async function abrirDetalle(recibo) {
        setError("");
        setCargandoDetalle(true);
        try {
            setReciboDetalle(await obtenerReciboDetallePanel(recibo.idApi));
        }
        catch (e) {
            console.error("Error al cargar el detalle del recibo:", e);
            setError("No se pudo cargar el detalle del recibo.");
        }
        finally {
            setCargandoDetalle(false);
        }
    }
    async function descargarPdf(recibo) {
        setError("");
        try {
            const pdf = await descargarReciboPdf(recibo.idApi);
            const url = window.URL.createObjectURL(pdf);
            const link = document.createElement("a");
            link.href = url;
            link.download = `recibo-${recibo.numero}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        }
        catch (e) {
            console.error("Error al descargar el recibo:", e);
            setError("No se pudo descargar el recibo.");
        }
    }
    if (reciboDetalle) {
        return (<div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => setReciboDetalle(null)} className="flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors" style={{ color: "var(--pan-text-muted)" }}>
          ← Volver a mis recibos
        </button>
        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="pan-card p-8">
          {/* Header del recibo */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--pan-accent)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 8C8 10 5.9 16.17 3.82 19.5c.7-1.3 1.18-3.5 1.5-5.5"/><path d="M17 8a5 5 0 1 0-8.66 5"/><path d="M12.67 12.5A5 5 0 0 1 8 10"/>
                  </svg>
                </div>
                <span className="font-display font-semibold" style={{ color: "var(--pan-accent)" }}>Panify</span>
              </div>
              <p className="text-xs" style={{ color: "var(--pan-text-muted)" }}>Distribuciones Oro Pan · Soacha</p>
            </div>
            <div className="text-right">
              <p className="font-bold" style={{ color: "var(--pan-text)" }}>Recibo #{reciboDetalle.numero}</p>
              <p className="text-xs" style={{ color: "var(--pan-text-muted)" }}>{formatFecha(reciboDetalle.fecha)}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: reciboDetalle.pagado ? "rgba(46,125,50,0.15)" : "rgba(198,40,40,0.15)", color: reciboDetalle.pagado ? "#2E7D32" : "#C62828" }}>
                {reciboDetalle.pagado ? "Pagado" : "Pendiente"}
              </span>
            </div>
          </div>

          <div className="space-y-1 mb-5" style={{ borderBottom: "1px solid var(--pan-border)", paddingBottom: "1.25rem" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--pan-text)" }}>{reciboDetalle.clienteNombre}</p>
            <p className="text-xs" style={{ color: "var(--pan-text-muted)" }}>{reciboDetalle.clienteDireccion}</p>
          </div>

          {/* Items */}
          <table className="w-full mb-5">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--pan-border)" }}>
                <th className="text-left py-2 text-xs font-semibold" style={{ color: "var(--pan-text-muted)" }}>Producto</th>
                <th className="text-center py-2 text-xs font-semibold" style={{ color: "var(--pan-text-muted)" }}>Cant.</th>
                <th className="text-right py-2 text-xs font-semibold" style={{ color: "var(--pan-text-muted)" }}>Precio</th>
                <th className="text-right py-2 text-xs font-semibold" style={{ color: "var(--pan-text-muted)" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {reciboDetalle.items.map((item, i) => (<tr key={i} style={{ borderBottom: "1px solid var(--pan-border-soft)" }}>
                  <td className="py-2.5 text-sm" style={{ color: "var(--pan-text)" }}>{item.nombre}</td>
                  <td className="py-2.5 text-sm text-center" style={{ color: "var(--pan-text-muted)" }}>{item.cantidad}</td>
                  <td className="py-2.5 text-sm text-right" style={{ color: "var(--pan-text-muted)" }}>{formatCOP(item.precioUnit)}</td>
                  <td className="py-2.5 text-sm text-right font-medium" style={{ color: "var(--pan-text)" }}>{formatCOP(item.subtotal)}</td>
                </tr>))}
            </tbody>
          </table>

          <div className="space-y-1.5 mb-6">
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--pan-text-muted)" }}>Subtotal</span>
              <span style={{ color: "var(--pan-text)" }}>{formatCOP(reciboDetalle.subtotal)}</span>
            </div>
            {reciboDetalle.descuento > 0 && (<div className="flex justify-between text-sm">
                <span style={{ color: "#2E7D32" }}>Descuento</span>
                <span style={{ color: "#2E7D32" }}>−{formatCOP(reciboDetalle.descuento)}</span>
              </div>)}
            <div className="flex justify-between font-bold text-base pt-2" style={{ borderTop: "1px solid var(--pan-border)" }}>
              <span style={{ color: "var(--pan-text)" }}>Total</span>
              <span style={{ color: "var(--pan-accent)" }}>{formatCOP(reciboDetalle.total)}</span>
            </div>
          </div>

          <button onClick={() => descargarPdf(reciboDetalle)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors" style={{ background: "var(--pan-surface-2)", color: "var(--pan-text)", border: "1px solid var(--pan-border)" }}>
            <Download size={15}/>
            Descargar PDF
          </button>
        </div>
      </div>);
    }
    return (<div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6" style={{ color: "var(--pan-text)" }}>Mis recibos</h1>

      {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
      {cargandoDetalle && <p className="mb-4 text-sm" style={{ color: "var(--pan-text-muted)" }}>Cargando detalle del recibo…</p>}
      <div className="space-y-3">
        {recibos.map(r => (<div key={r.id} className="pan-card p-5 flex items-center gap-4 transition-colors" onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "var(--pan-surface)"; }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(217,144,61,0.12)" }}>
              <FileText size={18} style={{ color: "var(--pan-accent)" }}/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm" style={{ color: "var(--pan-text)" }}>Recibo #{r.numero}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: r.pagado ? "rgba(46,125,50,0.12)" : "rgba(198,40,40,0.12)", color: r.pagado ? "#2E7D32" : "#C62828" }}>
                  {r.pagado ? "Pagado" : "Pendiente"}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--pan-text-muted)" }}>{formatFecha(r.fecha)} · Pedido {r.pedidoId}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold" style={{ color: "var(--pan-text)" }}>{formatCOP(r.total)}</span>
              <button onClick={() => abrirDetalle(r)} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" style={{ background: "rgba(217,144,61,0.1)", color: "var(--pan-accent)" }}>
                Ver
              </button>
              <button onClick={() => descargarPdf(r)} className="text-xs font-medium transition-colors" style={{ color: "var(--pan-text-muted)" }} aria-label={`Descargar recibo ${r.numero} en PDF`}>
                <Download size={15}/>
              </button>
            </div>
          </div>))}
      </div>

      {!cargando && recibos.length === 0 && (<div className="pan-card p-12 text-center">
          <FileText size={40} className="mx-auto mb-3 opacity-20" style={{ color: "var(--pan-text)" }}/>
          <p style={{ color: "var(--pan-text-muted)" }}>Aún no tienes recibos</p>
        </div>)}
    </div>);
}
