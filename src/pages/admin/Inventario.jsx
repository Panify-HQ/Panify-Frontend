import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Package } from "lucide-react";
import { Button, Badge, SearchInput, Modal, Input, Textarea, PageHeader, Toast, EmptyState } from "../../components/common/ui.jsx";
import { obtenerProductosPanel, guardarProductoPanel, eliminarProductoPanel } from "../../services/panel.js";
import { formatCOP } from "../../utils/formatos.js";
import { estadoDeStock } from "../../utils/adaptadores.js";
const categorias = ["Todos", "Panes", "Dulces"];
const statusFiltros = ["Todos", "Disponible", "Stock bajo", "Agotado"];
function getStatusVariant(s) {
    if (s === "disponible")
        return "success";
    if (s === "stock_bajo")
        return "warning";
    return "danger";
}
function getStatusLabel(s) {
    if (s === "disponible")
        return "Disponible";
    if (s === "stock_bajo")
        return "Stock bajo";
    return "Agotado";
}
function computeStatus(stock, min) {
    return estadoDeStock(stock, min);
}
const emptyForm = { nombre: "", categoria: "Panes", precio: "", stock: "", minStock: "", unidad: "unidad", descripcion: "", emoji: "🍞" };
export default function AdminInventario() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    async function cargarProductos() {
        try {
            setProductos(await obtenerProductosPanel());
        }
        catch (error) {
            console.error("Error al cargar el inventario:", error);
            setToast({ msg: "No se pudo cargar el inventario", type: "error" });
        }
        finally {
            setCargando(false);
        }
    }
    useEffect(() => { cargarProductos(); }, []);
    const [catActiva, setCatActiva] = useState("Todos");
    const [statusActivo, setStatusActivo] = useState("Todos");
    const [busqueda, setBusqueda] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const productosFiltrados = productos.filter(p => {
        const matchCat = catActiva === "Todos" || p.categoria === catActiva;
        const matchStatus = statusActivo === "Todos" ||
            (statusActivo === "Disponible" && p.status === "disponible") ||
            (statusActivo === "Stock bajo" && p.status === "stock_bajo") ||
            (statusActivo === "Agotado" && p.status === "agotado");
        const matchBusq = busqueda === "" || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
        return matchCat && matchStatus && matchBusq;
    });
    function openNew() {
        setEditando(null);
        setForm(emptyForm);
        setErrors({});
        setModalOpen(true);
    }
    function openEdit(p) {
        setEditando(p);
        setForm({ nombre: p.nombre, categoria: p.categoria, precio: String(p.precio), stock: String(p.stock), minStock: String(p.minStock), unidad: p.unidad, descripcion: p.descripcion, emoji: p.emoji });
        setErrors({});
        setModalOpen(true);
    }
    function validate() {
        const e = {};
        if (!form.nombre.trim())
            e.nombre = "El nombre es obligatorio";
        if (!form.precio || isNaN(Number(form.precio)) || Number(form.precio) <= 0)
            e.precio = "Precio inválido";
        if (form.stock === "" || isNaN(Number(form.stock)) || Number(form.stock) < 0)
            e.stock = "Stock inválido";
        if (!form.minStock || isNaN(Number(form.minStock)) || Number(form.minStock) < 0)
            e.minStock = "Mínimo inválido";
        setErrors(e);
        return Object.keys(e).length === 0;
    }
    async function guardar() {
        if (!validate())
            return;
        try {
            const resultado = await guardarProductoPanel({
                id: editando?.id,
                nombre: form.nombre.trim(),
                descripcion: form.descripcion.trim(),
                precio: Number(form.precio),
                stock: Number(form.stock),
                minStock: Number(form.minStock),
            });
            await cargarProductos();
            setToast(resultado.stockActualizado
                ? { msg: editando ? "Producto actualizado correctamente" : "Producto creado correctamente", type: "success" }
                : { msg: "Producto guardado, pero no se pudo actualizar su stock", type: "warning" });
            setModalOpen(false);
        }
        catch (error) {
            console.error("Error al guardar el producto:", error);
            setToast({ msg: editando ? "No se pudo actualizar el producto" : "No se pudo agregar el producto", type: "error" });
        }
        setTimeout(() => setToast(null), 3000);
    }
    async function eliminar(p) {
        try {
            await eliminarProductoPanel(p.id);
            setProductos(prev => prev.filter(x => x.id !== p.id));
            setToast({ msg: `"${p.nombre}" eliminado del inventario`, type: "success" });
        }
        catch (error) {
            console.error("Error al eliminar el producto:", error);
            setToast({ msg: "No se pudo eliminar el producto", type: "error" });
        }
        setDeleteConfirm(null);
        setTimeout(() => setToast(null), 3000);
    }
    const stockTotal = productos.reduce((s, p) => s + p.stock, 0);
    const valorInventario = productos.reduce((s, p) => s + p.stock * p.precio, 0);
    return (<div className="max-w-7xl mx-auto">
      <PageHeader title="Inventario" subtitle={`${productos.length} productos · ${stockTotal} unidades · Valor: ${formatCOP(valorInventario)}`} action={<Button variant="primary" onClick={openNew}>
            <Plus size={16}/> Nuevo producto
          </Button>}/>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-oro-light/50 shadow-sm p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar producto..."/>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFiltros.map(s => (<button key={s} onClick={() => setStatusActivo(s)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] ${statusActivo === s ? "bg-oro-dark text-oro-cream" : "bg-oro-cream text-oro-brown hover:bg-oro-light"}`}>
                {s}
              </button>))}
          </div>
        </div>
        {/* Category tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {categorias.map(c => (<button key={c} onClick={() => setCatActiva(c)} className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors min-h-[36px] ${catActiva === c ? "bg-oro-gold text-white" : "bg-transparent text-oro-brown hover:text-oro-dark hover:bg-oro-cream"}`}>
              {c}
            </button>))}
        </div>
      </div>

      {/* Product grid */}
      {productosFiltrados.length === 0 ? (<EmptyState icon={<Package size={48}/>} title="Sin productos" description="No hay productos que coincidan con los filtros aplicados." action={<Button variant="outline" onClick={() => { setCatActiva("Todos"); setStatusActivo("Todos"); setBusqueda(""); }}>Limpiar filtros</Button>}/>) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productosFiltrados.map(p => (<div key={p.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all ${p.status === "agotado" ? "border-oro-red/30 opacity-80" : p.status === "stock_bajo" ? "border-oro-amber/40" : "border-oro-light/50"}`}>
              <div className={`px-5 pt-5 pb-3 flex items-start justify-between ${p.status === "agotado" ? "bg-oro-red-bg/30" : p.status === "stock_bajo" ? "bg-oro-amber-bg/30" : "bg-oro-cream/30"}`}>
                <div>
                  <span className="text-3xl">{p.emoji}</span>
                  <p className="text-[10px] font-semibold text-oro-brown uppercase tracking-wider mt-1">{p.categoria}</p>
                </div>
                <Badge variant={getStatusVariant(p.status)} size="sm" dot>{getStatusLabel(p.status)}</Badge>
              </div>
              <div className="px-5 py-4">
                <h3 className="font-semibold text-oro-dark mb-1">{p.nombre}</h3>
                <p className="text-xs text-oro-brown mb-3 line-clamp-2 leading-relaxed">{p.descripcion}</p>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-oro-brown">Precio</p>
                    <p className="text-lg font-bold font-display text-oro-gold">{formatCOP(p.precio)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-oro-brown">Stock</p>
                    <p className={`text-lg font-bold ${p.status === "agotado" ? "text-oro-red" : p.status === "stock_bajo" ? "text-oro-amber" : "text-oro-green"}`}>
                      {p.stock}
                    </p>
                  </div>
                </div>
                {/* Stock bar */}
                <div className="h-1.5 bg-oro-cream rounded-full overflow-hidden mb-4">
                  <div className={`h-full rounded-full transition-all ${p.status === "agotado" ? "bg-oro-red" : p.status === "stock_bajo" ? "bg-oro-amber" : "bg-oro-green"}`} style={{ width: `${Math.min(100, (p.stock / (p.minStock * 3)) * 100)}%` }}/>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="flex-1 justify-center">
                    <Edit2 size={13}/> Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(p)} className="text-oro-red hover:bg-oro-red-bg">
                    <Trash2 size={13}/>
                  </Button>
                </div>
              </div>
            </div>))}
        </div>)}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editando ? "Editar producto" : "Nuevo producto"} size="md" footer={<div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={guardar}>{editando ? "Guardar cambios" : "Crear producto"}</Button>
          </div>}>
        <div className="space-y-4">
          <Input label="Nombre del producto" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} error={errors.nombre} placeholder="Ej. Pan Blandito"/>
          <Input label="Precio (COP)" type="number" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} error={errors.precio} placeholder="1500"/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Stock actual" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} error={errors.stock} placeholder="0"/>
            <Input label="Stock mínimo" type="number" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))} error={errors.minStock} placeholder="10"/>
          </div>
          <Textarea label="Descripción" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={3} placeholder="Descripción breve del producto..."/>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar producto" size="sm" footer={<div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => deleteConfirm && eliminar(deleteConfirm)}>Eliminar</Button>
          </div>}>
        <p className="text-sm text-oro-brown">
          ¿Estás seguro de eliminar <strong className="text-oro-dark">"{deleteConfirm?.nombre}"</strong>? Esta acción no se puede deshacer.
        </p>
      </Modal>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
    </div>);
}
