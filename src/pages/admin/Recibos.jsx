import { useEffect, useState } from "react";
import { CalendarDays, Download, Eye, Filter, RotateCcw } from "lucide-react";
import { Button, Badge, Input, SearchInput, Modal, PageHeader, Select, Toast } from "../../components/common/ui.jsx";
import { obtenerRecibosPanel } from "../../services/panel.js";
import { formatCOP, formatFecha, formatHora } from "../../utils/formatos.js";
const metodoPagoLabel = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    nequi: "Nequi",
    daviplata: "Daviplata",
};
const metodoPagoEmoji = {
    efectivo: "💵",
    transferencia: "🏦",
    nequi: "📱",
    daviplata: "📲",
};
function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
export default function Recibos() {
    const [recibos, setRecibos] = useState([]);
    useEffect(() => {
        obtenerRecibosPanel()
            .then(setRecibos)
            .catch(error => {
            console.error("Error al cargar recibos:", error);
            setToast({ msg: "No se pudieron cargar los recibos", type: "error" });
        });
    }, []);
    const [busqueda, setBusqueda] = useState("");
    const [tipoFiltroFecha, setTipoFiltroFecha] = useState("fecha");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [filtroFechaAplicado, setFiltroFechaAplicado] = useState(null);
    const [reciboSeleccionado, setReciboSeleccionado] = useState(null);
    const [toast, setToast] = useState(null);
    const recibosFiltrados = recibos.filter(r => {
        const termino = busqueda.toLowerCase();
        const coincideBusqueda = termino === "" ||
            r.id.toLowerCase().includes(termino) ||
            r.clienteNombre.toLowerCase().includes(termino) ||
            r.pedidoId.toLowerCase().includes(termino);
        const fechaRecibo = toDateInputValue(r.fecha);
        const coincideFecha = !filtroFechaAplicado ||
            (filtroFechaAplicado.tipo === "fecha"
                ? fechaRecibo === filtroFechaAplicado.desde
                : fechaRecibo >= filtroFechaAplicado.desde && fechaRecibo <= filtroFechaAplicado.hasta);
        return coincideBusqueda && coincideFecha;
    });
    const totalCobrado = recibos.filter(r => r.pagado).reduce((s, r) => s + r.total, 0);
    const totalPendiente = recibos.filter(r => !r.pagado).reduce((s, r) => s + r.total, 0);
    function simularDescarga(r) {
        setToast({ msg: `Recibo ${r.id} descargado como PDF`, type: "success" });
        setTimeout(() => setToast(null), 3000);
    }
    function aplicarFiltroFecha() {
        if (!fechaDesde || (tipoFiltroFecha === "rango" && !fechaHasta)) {
            setToast({
                msg: tipoFiltroFecha === "fecha"
                    ? "Selecciona una fecha para filtrar"
                    : "Selecciona la fecha inicial y la fecha final",
                type: "error",
            });
            return;
        }
        if (tipoFiltroFecha === "rango" && fechaDesde > fechaHasta) {
            setToast({ msg: "La fecha inicial no puede ser posterior a la fecha final", type: "error" });
            return;
        }
        setFiltroFechaAplicado({
            tipo: tipoFiltroFecha,
            desde: fechaDesde,
            hasta: tipoFiltroFecha === "rango" ? fechaHasta : fechaDesde,
        });
    }
    function limpiarFiltroFecha() {
        setFechaDesde("");
        setFechaHasta("");
        setFiltroFechaAplicado(null);
    }
    return (<div className="max-w-7xl mx-auto">
      <PageHeader title="Recibos" subtitle={`${recibos.length} recibos generados · Cobrado: ${formatCOP(totalCobrado)} · Pendiente: ${formatCOP(totalPendiente)}`}/>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-oro-light/50 shadow-sm p-4">
          <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider mb-1">Total cobrado</p>
          <p className="font-display text-xl font-bold text-oro-green">{formatCOP(totalCobrado)}</p>
          <p className="text-xs text-oro-brown mt-0.5">{recibos.filter(r => r.pagado).length} pagados</p>
        </div>
        <div className="bg-white rounded-2xl border border-oro-light/50 shadow-sm p-4">
          <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider mb-1">Por cobrar</p>
          <p className="font-display text-xl font-bold text-oro-amber">{formatCOP(totalPendiente)}</p>
          <p className="text-xs text-oro-brown mt-0.5">{recibos.filter(r => !r.pagado).length} pendientes</p>
        </div>
        <div className="bg-white rounded-2xl border border-oro-light/50 shadow-sm p-4 hidden sm:block">
          <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider mb-1">Total facturado</p>
          <p className="font-display text-xl font-bold text-oro-dark">{formatCOP(totalCobrado + totalPendiente)}</p>
          <p className="text-xs text-oro-brown mt-0.5">{recibos.length} recibos</p>
        </div>
      </div>

      {/* Search and date filter */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="w-full sm:max-w-sm">
          <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por recibo, pedido o cliente..."/>
        </div>

        <div className="pan-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-oro-cream text-oro-gold">
              <CalendarDays size={17}/>
            </div>
            <div>
              <p className="text-sm font-semibold text-oro-dark">Filtrar recibos por fecha</p>
              <p className="text-xs text-oro-brown">Selecciona una fecha específica o un período.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 items-end">
            <Select label="Tipo de filtro" value={tipoFiltroFecha} onChange={event => {
            const tipo = event.target.value;
            setTipoFiltroFecha(tipo);
            if (tipo === "fecha")
                setFechaHasta("");
        }} options={[
            { value: "fecha", label: "Fecha específica" },
            { value: "rango", label: "Rango de fechas" },
        ]}/>
            <Input type="date" label={tipoFiltroFecha === "fecha" ? "Fecha" : "Desde"} value={fechaDesde} onChange={event => setFechaDesde(event.target.value)}/>
            {tipoFiltroFecha === "rango" && (<Input type="date" label="Hasta" value={fechaHasta} min={fechaDesde || undefined} onChange={event => setFechaHasta(event.target.value)}/>)}
            <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
              <Button variant="primary" onClick={aplicarFiltroFecha}>
                <Filter size={15}/>
                Filtrar
              </Button>
              {filtroFechaAplicado && (<Button variant="ghost" onClick={limpiarFiltroFecha} className="px-3">
                  <RotateCcw size={15}/>
                  Limpiar
                </Button>)}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-oro-light/50 shadow-sm overflow-hidden">
        {filtroFechaAplicado && (<div className="flex items-center gap-2 border-b border-oro-light bg-oro-cream/40 px-6 py-2.5 text-xs text-oro-brown">
            <CalendarDays size={14} className="text-oro-gold"/>
            <span>
              {recibosFiltrados.length} {recibosFiltrados.length === 1 ? "recibo encontrado" : "recibos encontrados"}{" "}
              <strong className="font-semibold text-oro-dark">
                {filtroFechaAplicado.tipo === "fecha"
                ? `para el ${formatFecha(new Date(`${filtroFechaAplicado.desde}T12:00:00`))}`
                : `entre el ${formatFecha(new Date(`${filtroFechaAplicado.desde}T12:00:00`))} y el ${formatFecha(new Date(`${filtroFechaAplicado.hasta}T12:00:00`))}`}
              </strong>
            </span>
          </div>)}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-oro-cream/60 border-b border-oro-light">
                <th className="text-left px-6 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Recibo</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider hidden sm:table-cell">Pedido</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider hidden md:table-cell">Fecha</th>
                <th className="text-right px-4 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider hidden lg:table-cell">Método</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3.5 text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-oro-cream">
              {recibosFiltrados.length === 0 ? (<tr><td colSpan={8} className="py-12 text-center text-sm text-oro-brown">No hay recibos para mostrar</td></tr>) : (recibosFiltrados.map((r, i) => (<tr key={r.id} className={`${i % 2 === 1 ? "bg-oro-cream/20" : ""} hover:bg-oro-cream/50 transition-colors`}>
                    <td className="px-6 py-3.5">
                      <p className="text-sm font-semibold text-oro-gold">{r.id}</p>
                      <p className="text-[10px] text-oro-brown">#{r.numero.toString().padStart(4, "0")}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-xs font-medium text-oro-brown">{r.pedidoId}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-oro-dark">{r.clienteNombre}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-xs text-oro-dark">{formatFecha(r.fecha)}</p>
                      <p className="text-[10px] text-oro-brown">{formatHora(r.fecha)}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <p className="text-sm font-bold text-oro-dark">{formatCOP(r.total)}</p>
                      {r.descuento > 0 && <p className="text-[10px] text-oro-green">-{formatCOP(r.descuento)}</p>}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-oro-dark">
                        {r.metodoPago ? `${metodoPagoEmoji[r.metodoPago] ?? ""} ${metodoPagoLabel[r.metodoPago] ?? r.metodoPago}` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={r.pagado ? "success" : "warning"} size="sm" dot>
                        {r.pagado ? "Pagado" : "Pendiente"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => setReciboSeleccionado(r)}>
                          <Eye size={14}/>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => simularDescarga(r)}>
                          <Download size={14}/>
                        </Button>
                      </div>
                    </td>
                  </tr>)))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt detail modal */}
      <Modal isOpen={!!reciboSeleccionado} onClose={() => setReciboSeleccionado(null)} title="Vista de recibo" size="lg" footer={<div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setReciboSeleccionado(null)}>Cerrar</Button>
            <Button variant="primary" onClick={() => reciboSeleccionado && simularDescarga(reciboSeleccionado)}>
              <Download size={14}/> Descargar PDF
            </Button>
          </div>}>
        {reciboSeleccionado && (<div className="font-sans">
            {/* Header */}
            <div className="bg-oro-dark rounded-xl p-5 text-center mb-5">
              <p className="font-display italic text-2xl font-bold text-oro-gold">Panify</p>
              <p className="text-xs text-oro-cream/70 mt-0.5">Distribuciones Oro Pan</p>
              <p className="text-[10px] text-oro-cream/50 mt-0.5">NIT: 901.234.567-8 · Bogotá, Colombia</p>
              <p className="text-[10px] text-oro-cream/50">Tel: +57 601 234 5678 · oropan@gmail.com</p>
            </div>

            {/* Receipt ID & Date */}
            <div className="flex justify-between mb-5 text-sm">
              <div>
                <p className="text-[10px] text-oro-brown uppercase tracking-wider">Recibo No.</p>
                <p className="font-bold text-oro-gold text-lg">{reciboSeleccionado.id}</p>
                <p className="text-xs text-oro-brown">Pedido: {reciboSeleccionado.pedidoId}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-oro-brown uppercase tracking-wider">Fecha</p>
                <p className="font-semibold text-oro-dark">{formatFecha(reciboSeleccionado.fecha)}</p>
                <p className="text-xs text-oro-brown">{formatHora(reciboSeleccionado.fecha)}</p>
              </div>
            </div>

            {/* Client */}
            <div className="bg-oro-cream rounded-xl p-4 mb-5">
              <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider mb-2">Facturado a</p>
              <p className="font-semibold text-oro-dark">{reciboSeleccionado.clienteNombre}</p>
              <p className="text-xs text-oro-brown">{reciboSeleccionado.clienteTelefono}</p>
              <p className="text-xs text-oro-brown">{reciboSeleccionado.clienteDireccion}</p>
            </div>

            {/* Items */}
            <table className="w-full text-sm mb-5 border border-oro-light rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-oro-cream">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-oro-brown uppercase">Producto</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-oro-brown uppercase">Cant.</th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-oro-brown uppercase">P. Unit.</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-oro-brown uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-oro-cream">
                {reciboSeleccionado.items.map((item, i) => (<tr key={i}>
                    <td className="px-4 py-2.5 text-oro-dark">{item.nombre}</td>
                    <td className="px-3 py-2.5 text-center text-oro-brown">{item.cantidad}</td>
                    <td className="px-3 py-2.5 text-right text-oro-brown">{formatCOP(item.precioUnit)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-oro-dark">{formatCOP(item.subtotal)}</td>
                  </tr>))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-oro-brown">Subtotal</span>
                <span className="text-oro-dark">{formatCOP(reciboSeleccionado.subtotal)}</span>
              </div>
              {reciboSeleccionado.descuento > 0 && (<div className="flex justify-between text-sm">
                  <span className="text-oro-green">Descuento</span>
                  <span className="text-oro-green">-{formatCOP(reciboSeleccionado.descuento)}</span>
                </div>)}
              <div className="flex justify-between border-t border-oro-light pt-2">
                <span className="font-bold text-oro-dark">TOTAL</span>
                <span className="font-bold text-oro-gold font-display text-lg">{formatCOP(reciboSeleccionado.total)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="flex items-center justify-between bg-oro-cream rounded-xl px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider">Método de pago</p>
                <p className="text-sm font-medium text-oro-dark">
                  {reciboSeleccionado.metodoPago ? `${metodoPagoEmoji[reciboSeleccionado.metodoPago] ?? ""} ${metodoPagoLabel[reciboSeleccionado.metodoPago] ?? reciboSeleccionado.metodoPago}` : "—"}
                </p>
              </div>
              <Badge variant={reciboSeleccionado.pagado ? "success" : "warning"} dot>
                {reciboSeleccionado.pagado ? "Pagado" : "Pendiente"}
              </Badge>
            </div>

            <p className="text-center text-[10px] text-oro-brown/60 mt-5">
              ¡Gracias por su compra! • "Horneamos Calidad, Entregamos Confianza."
            </p>
          </div>)}
      </Modal>

      {toast && (<Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>)}
    </div>);
}
