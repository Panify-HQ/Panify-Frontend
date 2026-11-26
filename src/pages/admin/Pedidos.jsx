import { useEffect, useState } from "react";
import { Eye, MapPin, Phone, Clock, Truck } from "lucide-react";
import { Button, Badge, SearchInput, Modal, Select, PageHeader, Toast } from "../../components/common/ui.jsx";
import { obtenerPedidosPanel, obtenerDomiciliariosPanel, cambiarEstadoPedidoPanel } from "../../services/panel.js";
import { formatCOP, formatFecha, formatHora } from "../../utils/formatos.js";
const tabs = [
    { id: "todos", label: "Todos" },
    { id: "pendiente", label: "Pendientes" },
    { id: "preparando", label: "Preparando" },
    { id: "listo", label: "Listos" },
    { id: "en_camino", label: "En camino" },
    { id: "entregado", label: "Entregados" },
    { id: "cancelado", label: "Cancelados" },
];
const estadoBadge = {
    pendiente: { variant: "warning", label: "Pendiente" },
    preparando: { variant: "info", label: "Preparando" },
    listo: { variant: "gold", label: "Listo" },
    en_camino: { variant: "info", label: "En camino" },
    entregado: { variant: "success", label: "Entregado" },
    cancelado: { variant: "danger", label: "Cancelado" },
};
const siguienteEstado = {
    pendiente: "preparando",
    preparando: "listo",
    listo: "en_camino",
    en_camino: "entregado",
};
const accionLabel = {
    pendiente: "Iniciar preparación",
    preparando: "Marcar listo",
    listo: "Asignar y enviar",
    en_camino: "Confirmar entrega",
};
export default function AdminPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [domiciliarios, setDomiciliarios] = useState([]);
    async function cargar() {
        const [ped, dom] = await Promise.allSettled([obtenerPedidosPanel(), obtenerDomiciliariosPanel()]);
        if (ped.status === "fulfilled") setPedidos(ped.value);
        else {
            console.error("Error al cargar los pedidos:", ped.reason);
            showToast("No se pudieron cargar los pedidos", "error");
        }
        if (dom.status === "fulfilled") setDomiciliarios(dom.value);
    }
    useEffect(() => { cargar(); }, []);
    const [tabActivo, setTabActivo] = useState("todos");
    const [busqueda, setBusqueda] = useState("");
    const [pedidoDetalle, setPedidoDetalle] = useState(null);
    const [toast, setToast] = useState(null);
    const [domiciliarioAsignado, setDomiciliarioAsignado] = useState("");
    function showToast(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }
    const pedidosFiltrados = pedidos.filter(p => {
        const matchTab = tabActivo === "todos" || p.estado === tabActivo;
        const matchBusq = busqueda === "" || p.id.toLowerCase().includes(busqueda.toLowerCase()) || p.clienteNombre.toLowerCase().includes(busqueda.toLowerCase());
        return matchTab && matchBusq;
    });
    async function avanzarEstado(pedidoId) {
        const pedido = pedidos.find(p => p.id === pedidoId);
        const next = pedido && siguienteEstado[pedido.estado];
        if (!next)
            return;
        const extra = {};
        if (next === "en_camino" && domiciliarioAsignado)
            extra.domiciliario_idDomiciliario = Number(domiciliarioAsignado);
        if (next === "entregado")
            extra.fechaHoraEntrega = new Date().toISOString();
        try {
            await cambiarEstadoPedidoPanel(pedido.idApi, next, extra);
            showToast(`Pedido actualizado: ${accionLabel[pedido.estado]}`);
            setPedidoDetalle(prev => prev ? { ...prev, estado: next } : null);
            await cargar();
        }
        catch (error) {
            console.error("Error al actualizar el pedido:", error);
            showToast("No se pudo actualizar el estado del pedido", "error");
        }
    }
    async function cancelar(pedidoId) {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido)
            return;
        try {
            await cambiarEstadoPedidoPanel(pedido.idApi, "cancelado");
            showToast("Pedido cancelado", "error");
            setPedidoDetalle(null);
            await cargar();
        }
        catch (error) {
            console.error("Error al cancelar el pedido:", error);
            showToast("No se pudo cancelar el pedido", "error");
        }
    }
    function countByTab(tab) {
        if (tab === "todos")
            return pedidos.length;
        return pedidos.filter(p => p.estado === tab).length;
    }
    return (<div className="max-w-7xl mx-auto">
      <PageHeader title="Pedidos" subtitle={`${pedidos.filter(p => !["entregado", "cancelado"].includes(p.estado)).length} pedidos activos hoy`}/>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-5">
        {tabs.map(t => {
            const count = countByTab(t.id);
            const active = tabActivo === t.id;
            return (<button key={t.id} onClick={() => setTabActivo(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all min-h-[40px] ${active ? "bg-oro-dark text-oro-cream shadow-sm" : "bg-white text-oro-brown border border-oro-light hover:border-oro-gold hover:text-oro-dark"}`}>
              {t.label}
              {count > 0 && (<span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-oro-cream" : "bg-oro-cream text-oro-brown"}`}>
                  {count}
                </span>)}
            </button>);
        })}
      </div>

      {/* Search */}
      <div className="mb-4 max-w-xs">
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por pedido o cliente..."/>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-oro-light/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-oro-cream/60 border-b border-oro-light">
                <th className="text-left px-6 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Pedido</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider hidden sm:table-cell">Cliente</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider hidden md:table-cell">Ítems</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider hidden lg:table-cell">Entrega</th>
                <th className="text-right px-4 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-oro-cream">
              {pedidosFiltrados.length === 0 ? (<tr><td colSpan={7} className="py-12 text-center text-sm text-oro-brown">No hay pedidos para mostrar</td></tr>) : (pedidosFiltrados.map((p, i) => {
            const estado = estadoBadge[p.estado];
            const sigEst = siguienteEstado[p.estado];
            return (<tr key={p.id} className={`${i % 2 === 1 ? "bg-oro-cream/20" : ""} hover:bg-oro-cream/50 transition-colors`}>
                      <td className="px-6 py-3.5">
                        <p className="text-sm font-semibold text-oro-gold">{p.id}</p>
                        <p className="text-[10px] text-oro-brown flex items-center gap-1">
                          <Clock size={10}/>{formatHora(p.fechaCreacion)}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <p className="text-sm font-medium text-oro-dark">{p.clienteNombre}</p>
                        <p className="text-xs text-oro-brown flex items-center gap-1">
                          <Phone size={10}/>{p.clienteTelefono}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="text-sm text-oro-dark">{p.items.length} ítem{p.items.length !== 1 ? "s" : ""}</p>
                        <p className="text-xs text-oro-brown">{p.items.map(i => i.nombre).join(", ").slice(0, 30)}...</p>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${p.tipoEntrega === "domicilio" ? "bg-oro-blue-bg text-oro-blue" : "bg-oro-cream text-oro-brown"}`}>
                          {p.tipoEntrega === "domicilio" ? "🛵 Domicilio" : "🏪 Recogida"}
                        </span>
                        {p.domiciliarioNombre && (<p className="text-[10px] text-oro-brown mt-1 flex items-center gap-1">
                            <Truck size={10}/>{p.domiciliarioNombre}
                          </p>)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm font-bold text-oro-dark">{formatCOP(p.total)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={estado.variant} size="sm" dot>{estado.label}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => setPedidoDetalle(p)}>
                            <Eye size={14}/>
                          </Button>
                          {sigEst && (<Button variant="primary" size="sm" onClick={() => avanzarEstado(p.id)}>
                              {accionLabel[p.estado]}
                            </Button>)}
                        </div>
                      </td>
                    </tr>);
        }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {pedidoDetalle && (<Modal isOpen={!!pedidoDetalle} onClose={() => setPedidoDetalle(null)} title={`Pedido ${pedidoDetalle.id}`} size="lg" footer={<div className="flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                {!["entregado", "cancelado"].includes(pedidoDetalle.estado) && (<Button variant="danger" size="sm" onClick={() => cancelar(pedidoDetalle.id)}>
                    Cancelar pedido
                  </Button>)}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setPedidoDetalle(null)}>Cerrar</Button>
                {siguienteEstado[pedidoDetalle.estado] && (<Button variant="primary" onClick={() => avanzarEstado(pedidoDetalle.id)}>
                    {accionLabel[pedidoDetalle.estado]}
                  </Button>)}
              </div>
            </div>}>
          <div className="space-y-5">
            {/* Status + info */}
            <div className="flex flex-wrap gap-3 items-center">
              <Badge variant={estadoBadge[pedidoDetalle.estado].variant} dot>
                {estadoBadge[pedidoDetalle.estado].label}
              </Badge>
              <span className="text-xs text-oro-brown flex items-center gap-1">
                <Clock size={12}/>{formatFecha(pedidoDetalle.fechaCreacion)} · {formatHora(pedidoDetalle.fechaCreacion)}
              </span>
            </div>

            {/* Client */}
            <div className="bg-oro-cream/50 rounded-xl p-4 grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider mb-1">Cliente</p>
                <p className="text-sm font-semibold text-oro-dark">{pedidoDetalle.clienteNombre}</p>
                <p className="text-xs text-oro-brown flex items-center gap-1 mt-1">
                  <Phone size={11}/>{pedidoDetalle.clienteTelefono}
                </p>
              </div>
              {pedidoDetalle.tipoEntrega === "domicilio" && (<div>
                  <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider mb-1">Dirección</p>
                  <p className="text-xs text-oro-dark flex items-start gap-1">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0 text-oro-gold"/>{pedidoDetalle.clienteDireccion}
                  </p>
                </div>)}
            </div>

            {/* Items */}
            <div>
              <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider mb-2">Ítems del pedido</p>
              <div className="border border-oro-light rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-oro-cream/70">
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-oro-brown uppercase">Producto</th>
                      <th className="text-center px-4 py-2 text-[10px] font-semibold text-oro-brown uppercase">Cant.</th>
                      <th className="text-right px-4 py-2 text-[10px] font-semibold text-oro-brown uppercase">P. Unit.</th>
                      <th className="text-right px-4 py-2 text-[10px] font-semibold text-oro-brown uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-oro-cream">
                    {pedidoDetalle.items.map((item, i) => (<tr key={i}>
                        <td className="px-4 py-2.5 font-medium text-oro-dark">{item.nombre}</td>
                        <td className="px-4 py-2.5 text-center text-oro-brown">{item.cantidad}</td>
                        <td className="px-4 py-2.5 text-right text-oro-brown">{formatCOP(item.precioUnit)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-oro-dark">{formatCOP(item.subtotal)}</td>
                      </tr>))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-oro-cream/40">
                      <td colSpan={3} className="px-4 py-3 text-right font-semibold text-oro-dark">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-oro-gold font-display text-base">{formatCOP(pedidoDetalle.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notas */}
            {pedidoDetalle.notas && (<div className="bg-oro-amber-bg rounded-xl px-4 py-3">
                <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider mb-1">Notas del cliente</p>
                <p className="text-sm text-oro-dark">{pedidoDetalle.notas}</p>
              </div>)}

            {/* Assign delivery */}
            {pedidoDetalle.estado === "listo" && (<Select label="Asignar domiciliario" value={domiciliarioAsignado} onChange={e => setDomiciliarioAsignado(e.target.value)} options={[{ value: "", label: "Seleccionar..." }, ...domiciliarios.filter(d => d.activo).map(d => ({ value: String(d.id), label: d.nombre }))]}/>)}
          </div>
        </Modal>)}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
    </div>);
}
