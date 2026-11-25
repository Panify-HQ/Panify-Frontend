import { useEffect, useState } from "react";
import { Truck, MapPin, Phone, Clock, CheckCircle, User } from "lucide-react";
import { Button, Badge, Select, PageHeader, Toast } from "../../components/common/ui.jsx";
import { obtenerPedidosPanel, obtenerDomiciliariosPanel, cambiarEstadoPedidoPanel } from "../../services/panel.js";
import { formatCOP, formatHora } from "../../utils/formatos.js";
import { conConteoDeEntregas } from "../../utils/adaptadores.js";
const estadoEntregaBadge = {
    listo: { variant: "gold", label: "Listo para envío" },
    en_camino: { variant: "info", label: "En camino" },
    entregado: { variant: "success", label: "Entregado" },
};
export default function Entregas() {
    const [pedidos, setPedidos] = useState([]);
    const [domiciliariosBase, setDomiciliarios] = useState([]);
    const domiciliarios = conConteoDeEntregas(domiciliariosBase, pedidos);
    async function cargar() {
        const [ped, dom] = await Promise.allSettled([obtenerPedidosPanel(), obtenerDomiciliariosPanel()]);
        if (ped.status === "fulfilled") setPedidos(ped.value);
        else console.error("Error al cargar las entregas:", ped.reason);
        if (dom.status === "fulfilled") setDomiciliarios(dom.value);
    }
    useEffect(() => { cargar(); }, []);
    const [asignaciones, setAsignaciones] = useState({});
    const [toast, setToast] = useState(null);
    const entregasActivas = pedidos.filter(p => ["listo", "en_camino"].includes(p.estado) && p.tipoEntrega === "domicilio");
    const entregasCompletadas = pedidos.filter(p => p.estado === "entregado" && p.tipoEntrega === "domicilio");
    function avisar(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }
    async function asignarYEnviar(p) {
        const domId = asignaciones[p.id];
        if (!domId) {
            avisar("Selecciona un domiciliario antes de enviar", "error");
            return;
        }
        const dom = domiciliarios.find(d => String(d.id) === String(domId));
        try {
            await cambiarEstadoPedidoPanel(p.idApi, "en_camino", { domiciliario_idDomiciliario: Number(domId) });
            avisar(`${p.id} asignado a ${dom?.nombre}`);
            await cargar();
        }
        catch (error) {
            console.error("Error al asignar el domiciliario:", error);
            avisar("No se pudo asignar el domiciliario", "error");
        }
    }
    async function confirmarEntrega(p) {
        try {
            await cambiarEstadoPedidoPanel(p.idApi, "entregado", { fechaHoraEntrega: new Date().toISOString() });
            avisar(`Entrega ${p.id} confirmada exitosamente`);
            await cargar();
        }
        catch (error) {
            console.error("Error al confirmar la entrega:", error);
            avisar("No se pudo confirmar la entrega", "error");
        }
    }
    const domsActivos = domiciliarios.filter(d => d.activo);
    return (<div className="max-w-7xl mx-auto">
      <PageHeader title="Entregas" subtitle={`${entregasActivas.length} activas · ${entregasCompletadas.length} completadas hoy`}/>

      {/* Domiciliarios summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {domiciliarios.map(d => (<div key={d.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${d.activo ? "border-oro-light/50" : "border-oro-light/30 opacity-60"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-oro-cream flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🚴</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-oro-dark truncate">{d.nombre}</p>
                <p className="text-xs text-oro-brown">{d.telefono}</p>
              </div>
              <Badge variant={d.activo ? "success" : "neutral"} size="sm">{d.activo ? "Activo" : "Inactivo"}</Badge>
            </div>
            <div className="flex gap-3 text-center">
              <div className="flex-1 bg-oro-cream rounded-lg py-2">
                <p className="text-lg font-bold text-oro-dark">{d.entregasHoy}</p>
                <p className="text-[10px] text-oro-brown">Asignadas</p>
              </div>
              <div className="flex-1 bg-oro-green-bg rounded-lg py-2">
                <p className="text-lg font-bold text-oro-green">{d.entregasCompletadas}</p>
                <p className="text-[10px] text-oro-brown">Completadas</p>
              </div>
            </div>
          </div>))}
      </div>

      {/* Active deliveries */}
      <div className="mb-6">
        <h2 className="font-semibold text-oro-dark mb-3">Entregas activas</h2>
        {entregasActivas.length === 0 ? (<div className="bg-white rounded-2xl border border-oro-light/50 shadow-sm p-8 text-center">
            <Truck size={40} className="text-oro-light mx-auto mb-3"/>
            <p className="text-sm text-oro-brown">No hay entregas activas en este momento</p>
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entregasActivas.map(p => {
                const estado = estadoEntregaBadge[p.estado];
                return (<div key={p.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${p.estado === "en_camino" ? "border-oro-blue/30" : "border-oro-amber/30"}`}>
                  {/* Header */}
                  <div className={`px-5 py-3 flex items-center justify-between ${p.estado === "en_camino" ? "bg-oro-blue-bg/50" : "bg-oro-amber-bg/50"}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-oro-gold">{p.id}</span>
                      <span className="text-oro-brown/40">·</span>
                      <span className="text-xs text-oro-brown flex items-center gap-1">
                        <Clock size={11}/>{formatHora(p.fechaCreacion)}
                      </span>
                    </div>
                    <Badge variant={estado.variant} size="sm" dot>{estado.label}</Badge>
                  </div>

                  <div className="px-5 py-4 space-y-3">
                    {/* Client info */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-oro-cream flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User size={14} className="text-oro-brown"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-oro-dark">{p.clienteNombre}</p>
                        <p className="text-xs text-oro-brown flex items-center gap-1">
                          <Phone size={10}/>{p.clienteTelefono}
                        </p>
                      </div>
                      <a href={`tel:${p.clienteTelefono}`} className="text-xs text-oro-blue bg-oro-blue-bg px-2 py-1 rounded-lg hover:bg-oro-blue/20 transition-colors">
                        Llamar
                      </a>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2 bg-oro-cream/50 rounded-lg px-3 py-2">
                      <MapPin size={14} className="text-oro-gold mt-0.5 flex-shrink-0"/>
                      <p className="text-xs text-oro-dark">{p.clienteDireccion}</p>
                    </div>

                    {/* Items summary */}
                    <div className="text-xs text-oro-brown">
                      <span className="font-semibold text-oro-dark">{p.items.length} ítem{p.items.length !== 1 ? "s" : ""}: </span>
                      {p.items.map(i => `${i.cantidad}x ${i.nombre}`).join(", ")} · <strong className="text-oro-dark">{formatCOP(p.total)}</strong>
                    </div>

                    {/* Assign delivery */}
                    {p.estado === "listo" && (<div className="flex gap-2">
                        <div className="flex-1">
                          <Select value={asignaciones[p.id] || ""} onChange={e => setAsignaciones(prev => ({ ...prev, [p.id]: e.target.value }))} options={[{ value: "", label: "Asignar domiciliario..." }, ...domsActivos.map(d => ({ value: String(d.id), label: d.nombre }))]}/>
                        </div>
                        <Button variant="primary" size="sm" onClick={() => asignarYEnviar(p)}>
                          <Truck size={14}/>
                          Enviar
                        </Button>
                      </div>)}

                    {/* Domiciliario assigned */}
                    {p.estado === "en_camino" && p.domiciliarioNombre && (<div className="flex items-center gap-2 bg-oro-blue-bg rounded-lg px-3 py-2">
                        <span className="text-base">🚴</span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-oro-blue">{p.domiciliarioNombre}</p>
                          <p className="text-[10px] text-oro-brown">En camino</p>
                        </div>
                        <Button variant="primary" size="sm" onClick={() => confirmarEntrega(p)}>
                          <CheckCircle size={13}/>
                          Confirmar
                        </Button>
                      </div>)}
                  </div>
                </div>);
            })}
          </div>)}
      </div>

      {/* Completed deliveries */}
      {entregasCompletadas.length > 0 && (<div>
          <h2 className="font-semibold text-oro-dark mb-3">Completadas hoy</h2>
          <div className="bg-white rounded-2xl border border-oro-light/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-oro-cream/60 border-b border-oro-light">
                    <th className="text-left px-6 py-3 text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Pedido</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Cliente</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-oro-brown uppercase tracking-wider hidden md:table-cell">Domiciliario</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Total</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-oro-cream">
                  {entregasCompletadas.map((p, i) => (<tr key={p.id} className={`${i % 2 === 1 ? "bg-oro-cream/20" : ""}`}>
                      <td className="px-6 py-3">
                        <p className="text-sm font-semibold text-oro-gold">{p.id}</p>
                        {p.fechaEntrega && <p className="text-[10px] text-oro-brown">{formatHora(p.fechaEntrega)}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-oro-dark">{p.clienteNombre}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-oro-brown">🚴 {p.domiciliarioNombre || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-bold text-oro-dark">{formatCOP(p.total)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="success" size="sm" dot>Entregado</Badge>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>
        </div>)}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
    </div>);
}
