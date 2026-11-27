import { useEffect, useState } from "react";
import useSesion from "../../hooks/useSesion.js";
import { MapPin, Phone, CheckCircle, Clock, Bike, Eye, FileText } from "lucide-react";
import { Button, Badge, Toast, PageHeader, Modal } from "../../components/common/ui.jsx";
import {
    obtenerPedidosPanel,
    obtenerRecibosPanel,
    obtenerReciboDetallePanel,
    cambiarEstadoPedidoPanel,
} from "../../services/panel.js";
import { formatCOP, formatFecha, formatHora } from "../../utils/formatos.js";
export default function DomiciliarioView() {
    const sesion = useSesion();
    const [pedidos, setPedidos] = useState([]);
    const [recibos, setRecibos] = useState([]);
    async function cargar() {
        const [ped, rec] = await Promise.allSettled([obtenerPedidosPanel(), obtenerRecibosPanel()]);
        if (ped.status === "fulfilled") setPedidos(ped.value);
        else console.error("Error al cargar las entregas:", ped.reason);
        if (rec.status === "fulfilled") setRecibos(rec.value);
    }
    useEffect(() => { cargar(); }, []);
    const [toast, setToast] = useState(null);
    const [reciboSeleccionado, setReciboSeleccionado] = useState(null);
    const domId = sesion?.usuario?.domiciliario_idDomiciliario;
    const misEntregas = pedidos.filter(p => String(p.domiciliarioId) === String(domId) && p.estado === "en_camino");
    const completadas = pedidos.filter(p => String(p.domiciliarioId) === String(domId) && p.estado === "entregado");
    async function marcarEntregado(p) {
        try {
            await cambiarEstadoPedidoPanel(p.idApi, "entregado", { fechaHoraEntrega: new Date().toISOString() });
            setToast({ msg: `Entrega ${p.id} marcada como completada`, type: "success" });
            await cargar();
        }
        catch (error) {
            console.error("Error al marcar la entrega:", error);
            setToast({ msg: "No se pudo marcar la entrega", type: "error" });
        }
        setTimeout(() => setToast(null), 3000);
    }
    const gananciasHoy = completadas.reduce((s, p) => s + p.total, 0);
    function reciboDe(pedidoId) {
        return recibos.find(r => r.pedidoId === pedidoId);
    }
    async function verRecibo(pedidoId) {
        const recibo = reciboDe(pedidoId);
        if (!recibo) return;
        try {
            setReciboSeleccionado(
                await obtenerReciboDetallePanel(recibo.idApi),
            );
        }
        catch (error) {
            console.error("Error al cargar el recibo:", error);
            setToast({ msg: "No se pudo cargar el recibo", type: "error" });
        }
    }
    return (<div className="max-w-2xl mx-auto">
      <PageHeader title="Mis Entregas" subtitle="Jhon Fredy Ríos · Ruta de hoy"/>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-oro-light/50 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold font-display text-oro-gold">{misEntregas.length}</p>
          <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider mt-1">Pendientes</p>
        </div>
        <div className="bg-white rounded-2xl border border-oro-light/50 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold font-display text-oro-green">{completadas.length}</p>
          <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider mt-1">Completadas</p>
        </div>
        <div className="bg-white rounded-2xl border border-oro-light/50 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold font-display text-oro-dark">{formatCOP(gananciasHoy).replace("COP", "")}</p>
          <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider mt-1">Valor entregado</p>
        </div>
      </div>

      {/* Pending deliveries */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Bike size={18} className="text-oro-gold"/>
          <h2 className="font-semibold text-oro-dark">Por entregar</h2>
          {misEntregas.length > 0 && (<span className="bg-oro-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{misEntregas.length}</span>)}
        </div>

        {misEntregas.length === 0 ? (<div className="bg-white rounded-2xl border border-oro-light/50 shadow-sm p-8 text-center">
            <CheckCircle size={40} className="text-oro-green mx-auto mb-3"/>
            <p className="font-semibold text-oro-dark mb-1">Todo entregado</p>
            <p className="text-sm text-oro-brown">No tienes entregas pendientes. Buen trabajo!</p>
          </div>) : (<div className="space-y-4">
            {misEntregas.map(p => (<div key={p.id} className="bg-white rounded-2xl border border-oro-gold/30 shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="bg-oro-amber-bg/60 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-oro-gold text-sm">{p.id}</span>
                    <span className="text-oro-brown/40">·</span>
                    <span className="text-xs text-oro-brown flex items-center gap-1">
                      <Clock size={11}/>{formatHora(p.fechaCreacion)}
                    </span>
                  </div>
                  <Badge variant="info" size="sm" dot>En camino</Badge>
                </div>

                <div className="px-5 py-4 space-y-4">
                  {/* Client */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-oro-cream rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                      👤
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-oro-dark">{p.clienteNombre}</p>
                      <p className="text-xs text-oro-brown">{p.clienteTelefono}</p>
                    </div>
                    <a href={`tel:${p.clienteTelefono}`} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-oro-green px-3 py-2 rounded-xl hover:bg-oro-green/90 transition-colors min-h-[44px]">
                      <Phone size={13}/>
                      Llamar
                    </a>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 bg-oro-cream rounded-xl px-4 py-3">
                    <MapPin size={16} className="text-oro-gold mt-0.5 flex-shrink-0"/>
                    <div>
                      <p className="text-sm font-medium text-oro-dark">{p.clienteDireccion}</p>
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(p.clienteDireccion)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-oro-blue underline mt-0.5 inline-block">
                        Abrir en Maps
                      </a>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-oro-cream/50 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider mb-2">Contenido del pedido</p>
                    <div className="space-y-1">
                      {p.items.map((item, i) => (<div key={i} className="flex justify-between text-sm">
                          <span className="text-oro-dark">{item.cantidad}× {item.nombre}</span>
                          <span className="text-oro-brown">{formatCOP(item.subtotal)}</span>
                        </div>))}
                    </div>
                    <div className="border-t border-oro-light mt-2 pt-2 flex justify-between">
                      <span className="text-sm font-semibold text-oro-dark">Total a cobrar</span>
                      <span className="font-bold text-oro-gold">{formatCOP(p.total)}</span>
                    </div>
                  </div>

                  {p.notas && (<div className="bg-oro-amber-bg rounded-xl px-4 py-2.5 text-xs text-oro-dark">
                      ⚠️ <strong>Nota:</strong> {p.notas}
                    </div>)}

                  {/* Action */}
                  {reciboDe(p.id) && (<Button variant="outline" size="md" fullWidth onClick={() => verRecibo(p.id)}>
                      <Eye size={16}/>
                      Ver recibo
                    </Button>)}
                  <Button variant="primary" size="lg" fullWidth onClick={() => marcarEntregado(p)}>
                    <CheckCircle size={18}/>
                    Marcar como entregado
                  </Button>
                </div>
              </div>))}
          </div>)}
      </div>

      {/* Completed today */}
      {completadas.length > 0 && (<div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-oro-green"/>
            <h2 className="font-semibold text-oro-dark">Completadas hoy</h2>
            <span className="bg-oro-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{completadas.length}</span>
          </div>
          <div className="space-y-2">
            {completadas.map(p => (<div key={p.id} className="bg-white rounded-xl border border-oro-green/30 shadow-sm px-5 py-3 flex items-center gap-3">
                <CheckCircle size={18} className="text-oro-green flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-oro-gold">{p.id}</span>
                    <span className="text-xs text-oro-brown truncate">· {p.clienteNombre}</span>
                  </div>
                  {p.fechaEntrega && (<p className="text-[10px] text-oro-brown">{formatHora(p.fechaEntrega)}</p>)}
                </div>
                <span className="text-sm font-bold text-oro-dark">{formatCOP(p.total)}</span>
                {reciboDe(p.id) && (<Button variant="ghost" size="sm" onClick={() => verRecibo(p.id)}>
                    <Eye size={14}/>
                    Ver recibo
                  </Button>)}
              </div>))}
          </div>
        </div>)}

      <Modal isOpen={!!reciboSeleccionado} onClose={() => setReciboSeleccionado(null)} title="Recibo de la entrega" size="md" footer={<div className="flex justify-end">
            <Button variant="primary" onClick={() => setReciboSeleccionado(null)}>
              Cerrar
            </Button>
          </div>}>
        {reciboSeleccionado && (<div className="space-y-5">
            <div className="flex items-start justify-between gap-4 rounded-xl bg-oro-cream p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oro-gold text-white">
                  <FileText size={18}/>
                </div>
                <div>
                  <p className="font-semibold text-oro-dark">{reciboSeleccionado.id}</p>
                  <p className="text-xs text-oro-brown">Pedido {reciboSeleccionado.pedidoId}</p>
                </div>
              </div>
              <Badge variant={reciboSeleccionado.pagado ? "success" : "warning"} size="sm" dot>
                {reciboSeleccionado.pagado ? "Pagado" : "Pendiente"}
              </Badge>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-oro-brown">Cliente</p>
                <p className="mt-1 text-sm font-semibold text-oro-dark">{reciboSeleccionado.clienteNombre}</p>
                <p className="text-xs text-oro-brown">{reciboSeleccionado.clienteDireccion}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-oro-brown">Fecha</p>
                <p className="mt-1 text-sm font-medium text-oro-dark">{formatFecha(reciboSeleccionado.fecha)}</p>
                <p className="text-xs text-oro-brown">{formatHora(reciboSeleccionado.fecha)}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-oro-light">
              <div className="bg-oro-cream px-4 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-oro-brown">Contenido de la entrega</p>
              </div>
              <div className="divide-y divide-oro-cream">
                {reciboSeleccionado.items.map(item => (<div key={item.productoId} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-oro-dark">{item.nombre}</p>
                      <p className="text-xs text-oro-brown">{item.cantidad} × {formatCOP(item.precioUnit)}</p>
                    </div>
                    <p className="text-sm font-semibold text-oro-dark">{formatCOP(item.subtotal)}</p>
                  </div>))}
              </div>
              <div className="flex items-center justify-between border-t border-oro-light bg-oro-cream/50 px-4 py-3">
                <span className="text-sm font-semibold text-oro-dark">Total</span>
                <span className="font-display text-lg font-bold text-oro-gold">{formatCOP(reciboSeleccionado.total)}</span>
              </div>
            </div>
          </div>)}
      </Modal>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
    </div>);
}
