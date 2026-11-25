import { useEffect, useState } from "react";
import useSesion from "../../hooks/useSesion.js";
import API from "../../services/api.js";
import { obtenerUsuariosPanel, obtenerPedidosPanel } from "../../services/panel.js";
import { crearUsuario, actualizarUsuario } from "../../services/users.js";
import { ID_POR_ROL } from "../../utils/adaptadores.js";
import { Users, Phone, MapPin, ShoppingBag, Mail, UserPlus, Pencil, UserCheck, UserX, ShieldCheck } from "lucide-react";
import { SearchInput, PageHeader, Badge, Button, Input, Modal, Select, Toast } from "../../components/common/ui.jsx";
import { formatCOP } from "../../utils/formatos.js";
const rolLabel = {
    superadmin: "Superadministrador",
    admin: "Administrador",
    panadero: "Panadero",
    domiciliario: "Domiciliario",
    cliente: "Cliente",
};
const FORM_VACIO = { nombre: "", apellido: "", email: "", telefono: "", direccion: "", barrio: "", rol: "cliente", password: "" };
export default function Usuarios() {
    const sesion = useSesion();
    const currentRole = sesion?.rol ?? "admin";
    const [usuarios, setUsuarios] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [guardando, setGuardando] = useState(false);
    async function cargar() {
        const [usr, ped] = await Promise.allSettled([obtenerUsuariosPanel(), obtenerPedidosPanel()]);
        if (usr.status === "fulfilled") setUsuarios(usr.value);
        else {
            console.error("Error al cargar usuarios:", usr.reason);
            setToast({ message: "No se pudieron cargar los usuarios", type: "error" });
        }
        if (ped.status === "fulfilled") setPedidos(ped.value);
    }
    useEffect(() => { cargar(); }, []);
    const [busqueda, setBusqueda] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioEditandoId, setUsuarioEditandoId] = useState(null);
    const [toast, setToast] = useState(null);
    const [nuevoUsuario, setNuevoUsuario] = useState(FORM_VACIO);
    const usuariosFiltrados = usuarios.filter(usuario => busqueda === "" ||
        usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.telefono.includes(busqueda));
    const rolesAsignables = currentRole === "superadmin"
        ? ["cliente", "panadero", "domiciliario", "admin"]
        : ["cliente", "panadero", "domiciliario"];
    function puedeGestionar(usuario) {
        if (usuario.rol === "superadmin")
            return false;
        return currentRole === "superadmin" || usuario.rol !== "admin";
    }
    function totalComprasCliente(clienteId) {
        return pedidos.filter(p => p.clienteId === clienteId && p.estado === "entregado").reduce((s, p) => s + p.total, 0);
    }
    function pedidosActivosCliente(clienteId) {
        return pedidos.filter(p => p.clienteId === clienteId && !["entregado", "cancelado"].includes(p.estado)).length;
    }
    function abrirCrearUsuario() {
        setUsuarioEditandoId(null);
        setNuevoUsuario(FORM_VACIO);
        setModalAbierto(true);
    }
    function abrirEditarUsuario(usuario) {
        if (!puedeGestionar(usuario)) {
            setToast({ message: "Solo el Superadministrador puede gestionar cuentas administrativas", type: "error" });
            return;
        }
        setUsuarioEditandoId(usuario.id);
        setNuevoUsuario({
            nombre: usuario.nombrePila,
            apellido: usuario.apellido,
            password: "",
            email: usuario.email,
            telefono: usuario.telefono,
            direccion: usuario.direccion ?? "",
            barrio: usuario.barrio ?? "",
            rol: usuario.rol,
        });
        setModalAbierto(true);
    }
    function cerrarModal() {
        setModalAbierto(false);
        setUsuarioEditandoId(null);
        setNuevoUsuario(FORM_VACIO);
    }
    async function guardarUsuario() {
        if (!nuevoUsuario.nombre.trim() || !nuevoUsuario.apellido.trim() || !nuevoUsuario.email.trim() || !nuevoUsuario.telefono.trim()) {
            setToast({ message: "Completa todos los campos para guardar el usuario", type: "error" });
            return;
        }
        if (usuarioEditandoId === null && !nuevoUsuario.password.trim()) {
            setToast({ message: "La contraseña es obligatoria para crear un usuario", type: "error" });
            return;
        }
        setGuardando(true);
        try {
            const datos = {
                nombre: nuevoUsuario.nombre.trim(),
                apellido: nuevoUsuario.apellido.trim(),
                correo: nuevoUsuario.email.trim(),
                email: nuevoUsuario.email.trim(),
                telefono: nuevoUsuario.telefono.trim(),
                Rol_idRol: ID_POR_ROL[nuevoUsuario.rol],
            };
            if (usuarioEditandoId !== null) {
                await actualizarUsuario(usuarioEditandoId, datos);
                const editado = usuarios.find(u => u.id === usuarioEditandoId);
                if (nuevoUsuario.rol === "cliente" && editado?.clienteId) {
                    try {
                        await API.patch(`/clientes/${editado.clienteId}`, { direccion: nuevoUsuario.direccion.trim(), barrio: nuevoUsuario.barrio.trim() });
                    }
                    catch (error) {
                        console.error("No se pudo actualizar la dirección del cliente:", error);
                    }
                }
                setToast({ message: "Datos del usuario actualizados", type: "success" });
            }
            else {
                await crearUsuario({ ...datos, password: nuevoUsuario.password, direccion: nuevoUsuario.direccion.trim(), barrio: nuevoUsuario.barrio.trim(), estado: "Activo" });
                setToast({ message: "Usuario creado correctamente", type: "success" });
            }
            await cargar();
            cerrarModal();
        }
        catch (error) {
            console.error("Error al guardar el usuario:", error);
            setToast({ message: "No se pudo guardar el usuario", type: "error" });
        }
        finally {
            setGuardando(false);
        }
    }
    async function cambiarEstadoUsuario(usuario) {
        if (!puedeGestionar(usuario)) {
            setToast({ message: "Esta cuenta está protegida por la jerarquía de roles", type: "error" });
            return;
        }
        try {
            await actualizarUsuario(usuario.id, { estado: usuario.activo ? "Inactivo" : "Activo" });
            setToast({
                message: usuario.activo
                    ? `La cuenta de ${usuario.nombre} fue desactivada`
                    : `La cuenta de ${usuario.nombre} fue activada`,
                type: "success",
            });
            await cargar();
        }
        catch (error) {
            console.error("Error al cambiar el estado del usuario:", error);
            setToast({ message: "No se pudo cambiar el estado de la cuenta", type: "error" });
        }
    }
    return (<div className="max-w-7xl mx-auto">
      <PageHeader title="Usuarios" subtitle={`${usuarios.length} usuarios registrados`} action={<Button variant="primary" onClick={abrirCrearUsuario}>
            <UserPlus size={16}/>
            Crear usuario
          </Button>}/>

      <div className="mb-5 max-w-sm">
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar usuario..."/>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {usuariosFiltrados.map(usuario => {
            const activos = usuario.clienteId ? pedidosActivosCliente(usuario.clienteId) : 0;
            const totalCompras = usuario.clienteId ? totalComprasCliente(usuario.clienteId) : 0;
            const gestionable = puedeGestionar(usuario);
            return (<div key={usuario.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${usuario.activo ? "border-oro-light/50 hover:shadow-md" : "border-oro-red/20 opacity-70"}`}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-oro-cream flex items-center justify-center flex-shrink-0 text-xl">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-oro-dark truncate">{usuario.nombre}</p>
                  <p className="text-xs text-oro-brown flex items-center gap-1 mt-0.5">
                    <Phone size={11}/>{usuario.telefono}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={usuario.rol === "admin" ? "gold" : "neutral"} size="sm">
                    {rolLabel[usuario.rol]}
                  </Badge>
                  <Badge variant={usuario.activo ? "success" : "danger"} size="sm" dot>
                    {usuario.activo ? "Activo" : "Desactivado"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-2 text-xs text-oro-brown">
                <Mail size={12} className="text-oro-gold flex-shrink-0"/>
                <span className="truncate">{usuario.email}</span>
              </div>
              {usuario.direccion && (<div className="flex items-center gap-1.5 mb-3 text-xs text-oro-brown">
                  <MapPin size={12} className="text-oro-gold flex-shrink-0"/>
                  <span className="truncate">
                    {usuario.direccion}{usuario.barrio ? ` · ${usuario.barrio}` : ""}
                  </span>
                </div>)}

              {usuario.rol === "cliente" && (<div className="grid grid-cols-2 gap-2">
                  <div className="bg-oro-cream/60 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-oro-brown">Total pedidos</p>
                    <p className="text-base font-bold text-oro-dark flex items-center gap-1">
                      <ShoppingBag size={13} className="text-oro-gold"/>{usuario.pedidosTotal ?? 0}
                    </p>
                  </div>
                  <div className="bg-oro-cream/60 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-oro-brown">{activos > 0 ? `${activos} activos` : "Compras"}</p>
                    <p className="text-sm font-bold text-oro-green">{formatCOP(totalCompras)}</p>
                  </div>
                </div>)}

              {gestionable ? (<div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="ghost" size="sm" fullWidth onClick={() => abrirEditarUsuario(usuario)}>
                    <Pencil size={14}/>
                    Editar
                  </Button>
                  <Button variant={usuario.activo ? "danger" : "outline"} size="sm" fullWidth onClick={() => cambiarEstadoUsuario(usuario)}>
                    {usuario.activo ? <UserX size={14}/> : <UserCheck size={14}/>}
                    {usuario.activo ? "Desactivar" : "Activar"}
                  </Button>
                </div>) : (<div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-oro-cream px-3 py-2 text-xs font-medium text-oro-brown">
                  <ShieldCheck size={14} className="text-oro-gold"/>
                  Cuenta protegida
                </div>)}
            </div>);
        })}
      </div>

      {usuariosFiltrados.length === 0 && (<div className="text-center py-12">
          <Users size={40} className="text-oro-light mx-auto mb-3"/>
          <p className="text-sm text-oro-brown">No se encontraron usuarios</p>
        </div>)}

      <Modal isOpen={modalAbierto} onClose={cerrarModal} title={usuarioEditandoId !== null ? "Editar usuario" : "Crear usuario"} footer={<div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={cerrarModal}>Cancelar</Button>
            <Button variant="primary" onClick={guardarUsuario}>
              {usuarioEditandoId !== null ? <Pencil size={16}/> : <UserPlus size={16}/>}
              {usuarioEditandoId !== null ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </div>}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre" value={nuevoUsuario.nombre} onChange={event => setNuevoUsuario(actual => ({ ...actual, nombre: event.target.value }))} placeholder="Ej. Laura"/>
            <Input label="Apellido" value={nuevoUsuario.apellido} onChange={event => setNuevoUsuario(actual => ({ ...actual, apellido: event.target.value }))} placeholder="Ej. Gómez"/>
          </div>
          <Input type="email" label="Correo electrónico" value={nuevoUsuario.email} onChange={event => setNuevoUsuario(actual => ({ ...actual, email: event.target.value }))} placeholder="usuario@panify.co"/>
          <Input type="tel" label="Teléfono" value={nuevoUsuario.telefono} onChange={event => setNuevoUsuario(actual => ({ ...actual, telefono: event.target.value }))} placeholder="300 000 0000"/>
          {usuarioEditandoId === null && (<Input type="password" label="Contraseña" value={nuevoUsuario.password} onChange={event => setNuevoUsuario(actual => ({ ...actual, password: event.target.value }))} autoComplete="new-password" placeholder="Contraseña de acceso"/>)}
          <Select label="Rol" value={nuevoUsuario.rol} onChange={event => setNuevoUsuario(actual => ({ ...actual, rol: event.target.value }))} options={[
            ...rolesAsignables.map(rol => ({ value: rol, label: rolLabel[rol] })),
        ]}/>
          {currentRole !== "superadmin" && usuarioEditandoId === null && (<p className="text-xs text-oro-brown">
              Solo el Superadministrador puede crear cuentas con rol Administrador.
            </p>)}
          {nuevoUsuario.rol === "cliente" && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Dirección de entrega" value={nuevoUsuario.direccion} onChange={event => setNuevoUsuario(actual => ({ ...actual, direccion: event.target.value }))} placeholder="Cra. 15 #42-18"/>
              <Input label="Barrio" value={nuevoUsuario.barrio} onChange={event => setNuevoUsuario(actual => ({ ...actual, barrio: event.target.value }))} placeholder="Chapinero"/>
            </div>)}
        </div>
      </Modal>

      {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>)}
    </div>);
}
