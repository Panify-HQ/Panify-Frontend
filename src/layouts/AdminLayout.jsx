import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useSesion, { ETIQUETA_ROL } from "../hooks/useSesion.js";
import useNotificaciones from "../hooks/useNotificaciones.js";
import BellPopover from "../components/common/BellPopover.jsx";
import { cerrarSesion } from "../services/auth.js";
import { LayoutDashboard, Package, ShoppingBag, FileText, Truck, Users, Menu, X, Bell, ChevronDown, Settings, LogOut, Search, CheckCircle, AlertCircle, Info, } from "lucide-react";
const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18}/>, roles: ["superadmin", "admin", "panadero", "domiciliario"] },
    { id: "inventario", label: "Productos e Inventario", icon: <Package size={18}/>, roles: ["superadmin", "admin", "panadero"] },
    { id: "pedidos", label: "Pedidos", icon: <ShoppingBag size={18}/>, roles: ["superadmin", "admin", "panadero"] },
    { id: "recibos", label: "Recibos", icon: <FileText size={18}/>, roles: ["superadmin", "admin"] },
    { id: "entregas", label: "Entregas y Rutas", icon: <Truck size={18}/>, roles: ["superadmin", "admin", "domiciliario"] },
    { id: "usuarios", label: "Usuarios", icon: <Users size={18}/>, roles: ["superadmin", "admin"] },
];
const ROLE_LABELS = ETIQUETA_ROL;
const TITULOS = {
    dashboard: "Dashboard",
    inventario: "Productos e Inventario",
    pedidos: "Gestión de Pedidos",
    recibos: "Recibos y Facturación",
    entregas: "Entregas y Rutas",
    usuarios: "Usuarios",
    configuracion: "Configuración",
};
function Sidebar({ role, user, badges, currentView, onNavigate, onClose, onLogout }) {
    const navItems = NAV_ITEMS.filter(n => n.roles.includes(role));
    function nav(id) {
        onNavigate(id);
        onClose?.();
    }
    return (<aside className="w-[256px] h-full flex flex-col flex-shrink-0" style={{ background: "var(--pan-sidebar-bg)" }}>
      {/* Logo */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--pan-sidebar-border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--pan-accent)" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.5c.7-1.3 1.18-3.5 1.5-5.5"/>
              <path d="M17 8a5 5 0 1 0-8.66 5"/>
              <path d="M12.67 12.5A5 5 0 0 1 8 10"/>
            </svg>
          </div>
          <div>
            <span className="font-display italic text-lg font-semibold tracking-wide" style={{ color: "var(--pan-accent)" }}>Panify</span>
            <p className="text-[9px] leading-none" style={{ color: "var(--pan-sidebar-muted)" }}>Oro Pan</p>
          </div>
        </div>
        {onClose && (<button onClick={onClose} className="md:hidden transition-colors" style={{ color: "var(--pan-sidebar-muted)" }}>
            <X size={18}/>
          </button>)}
      </div>

      {/* Signed-in user */}
      <div className="px-3 py-3" style={{ borderBottom: "1px solid var(--pan-sidebar-border)" }}>
        <div className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background: "var(--pan-sidebar-hover)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs" style={{ background: "rgba(217,144,61,0.25)", color: "var(--pan-accent)" }}>
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "var(--pan-sidebar-text)" }}>{user.name}</p>
            <p className="text-[10px]" style={{ color: "var(--pan-sidebar-muted)" }}>{ROLE_LABELS[role]}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-[9px] font-semibold uppercase tracking-widest" style={{ color: "var(--pan-sidebar-muted)" }}>Menú</p>
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const active = currentView === item.id;
            return (<li key={item.id}>
                <button onClick={() => nav(item.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-left" style={{
                    background: active ? "var(--pan-sidebar-active-bg)" : "transparent",
                    color: active ? "var(--pan-sidebar-active-text)" : "var(--pan-sidebar-muted)",
                }} onMouseEnter={e => { if (!active)
                e.currentTarget.style.background = "var(--pan-sidebar-hover)"; }} onMouseLeave={e => { if (!active)
                e.currentTarget.style.background = "transparent"; }}>
                  <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {badges[item.id] > 0 && (<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: active ? "rgba(62,39,35,0.2)" : "rgba(217,144,61,0.25)", color: active ? "var(--pan-sidebar-active-text)" : "var(--pan-accent)" }}>
                      {badges[item.id]}
                    </span>)}
                </button>
              </li>);
        })}
        </ul>

        <div className="my-4" style={{ borderTop: "1px solid var(--pan-sidebar-border)" }}/>

        <ul className="space-y-0.5">
          <li>
            <button onClick={() => nav("configuracion")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-left" style={{ color: currentView === "configuracion" ? "var(--pan-accent)" : "var(--pan-sidebar-muted)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-sidebar-hover)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <Settings size={17} style={{ opacity: 0.7 }}/>
              Configuración
            </button>
          </li>
          <li>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-left" style={{ color: "#EF4444" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <LogOut size={17} style={{ opacity: 0.8 }}/>
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3" style={{ borderTop: "1px solid var(--pan-sidebar-border)" }}>
        <p className="text-[10px]" style={{ color: "var(--pan-sidebar-muted)" }}>Distribuciones Oro Pan · v2.4.1</p>
      </div>
    </aside>);
}
/* ─── Bell Popover ────────────────────────────────────────────────────────── */
/* ─── Avatar Popover ──────────────────────────────────────────────────────── */
function AvatarPopover({ role, user, onNavigate, onLogout, onClose }) {
    return (<div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50 pop-in" style={{ background: "var(--pan-surface)", border: "1px solid var(--pan-border)", boxShadow: "var(--pan-shadow-md)" }}>
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--pan-border)" }}>
        <p className="text-sm font-semibold truncate" style={{ color: "var(--pan-text)" }}>{user.name}</p>
        <p className="text-[11px] truncate" style={{ color: "var(--pan-text-muted)" }}>{user.email}</p>
        <span className="mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(217,144,61,0.15)", color: "var(--pan-accent)" }}>
          {ROLE_LABELS[role]}
        </span>
      </div>
      <div className="py-1">
        <button onClick={() => { onNavigate("configuracion"); onClose(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors text-left" style={{ color: "var(--pan-text)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
          <Settings size={14} style={{ color: "var(--pan-text-muted)" }}/>
          Configuración
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors text-left" style={{ color: "#EF4444" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
          <LogOut size={14}/>
          Cerrar sesión
        </button>
      </div>
    </div>);
}
export default function AdminLayout() {
    const sesion = useSesion();
    const navigate = useNavigate();
    const location = useLocation();
    const role = sesion?.rol ?? "admin";
    const currentView = location.pathname.split("/")[2] ?? "dashboard";
    const pageTitle = TITULOS[currentView] ?? "Panify";
    const { notificaciones, pedidosPendientes, entregasActivas } = useNotificaciones(role);
    const badges = { pedidos: pedidosPendientes, entregas: entregasActivas };
    const user = { initials: sesion?.iniciales ?? "U", name: sesion?.nombre ?? "Usuario", email: sesion?.email ?? "" };
    const onNavigate = (vista) => navigate(`/admin/${vista}`);
    async function onLogout() {
        try {
            await cerrarSesion();
        }
        catch (error) {
            console.error("Error al cerrar sesión en el servidor:", error);
            localStorage.removeItem("usuario");
        }
        navigate("/", { replace: true });
    }
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showBell, setShowBell] = useState(false);
    const [showAvatar, setShowAvatar] = useState(false);
    const [search, setSearch] = useState("");
    const bellRef = useRef(null);
    const avatarRef = useRef(null);
    useEffect(() => {
        function handleClick(e) {
            if (bellRef.current && !bellRef.current.contains(e.target))
                setShowBell(false);
            if (avatarRef.current && !avatarRef.current.contains(e.target))
                setShowAvatar(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);
    const unreadCount = notificaciones.filter(n => n.sinLeer).length;
    return (<div className="flex h-screen overflow-hidden" style={{ background: "var(--pan-bg)" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar role={role} user={user} badges={badges} currentView={currentView} onNavigate={onNavigate} onLogout={onLogout}/>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (<div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: "rgba(62,39,35,0.55)" }} onClick={() => setSidebarOpen(false)}/>
          <div className="relative flex h-full">
            <Sidebar role={role} user={user} badges={badges} currentView={currentView} onNavigate={v => { onNavigate(v); setSidebarOpen(false); }} onClose={() => setSidebarOpen(false)} onLogout={onLogout}/>
          </div>
        </div>)}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center px-4 md:px-6 gap-4 flex-shrink-0 topbar-surface" style={{ borderBottom: "1px solid var(--pan-border)" }}>
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: "var(--pan-text-muted)" }}>
            <Menu size={20}/>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--pan-text-faint)" }}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar pedidos, clientes, productos…" className="pan-input pl-9 h-9" style={{ fontSize: "0.8125rem" }}/>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Bell */}
            <div ref={bellRef} className="relative">
              <button onClick={() => { setShowBell(p => !p); setShowAvatar(false); }} className="relative p-2.5 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" style={{ color: "var(--pan-text-muted)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <Bell size={18}/>
                {unreadCount > 0 && (<span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: "#C62828" }}/>)}
              </button>
              {showBell && <BellPopover notificaciones={notificaciones}/>}
            </div>

            {/* Avatar */}
            <div ref={avatarRef} className="relative">
              <button onClick={() => { setShowAvatar(p => !p); setShowBell(false); }} className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors" onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <div className="w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0" style={{ background: "var(--pan-accent)", color: "#fff" }}>
                  {user.initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold leading-tight" style={{ color: "var(--pan-text)" }}>{user.name}</p>
                  <p className="text-[10px] leading-tight" style={{ color: "var(--pan-text-muted)" }}>{ROLE_LABELS[role]}</p>
                </div>
                <ChevronDown size={13} style={{ color: "var(--pan-text-faint)" }}/>
              </button>
              {showAvatar && (<AvatarPopover role={role} user={user} onNavigate={onNavigate} onLogout={onLogout} onClose={() => setShowAvatar(false)}/>)}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>);
}
