import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useSesion from "../hooks/useSesion.js";
import useCarrito from "../hooks/useCarrito.js";
import useNotificaciones from "../hooks/useNotificaciones.js";
import BellPopover from "../components/common/BellPopover.jsx";
import { cerrarSesion } from "../services/auth.js";
import { ShoppingCart, Bell, ChevronDown, Settings, LogOut, Menu, X, Home, BookOpen, Package, FileText, } from "lucide-react";
const NAV_LINKS = [
    { id: "inicio", label: "Inicio", icon: <Home size={15}/> },
    { id: "catalogo", label: "Catálogo", icon: <BookOpen size={15}/> },
    { id: "pedidos", label: "Mis pedidos", icon: <Package size={15}/> },
    { id: "recibos", label: "Mis recibos", icon: <FileText size={15}/> },
];
/* ─── Avatar Popover ───────────────────────────────────────────────────────── */
function AvatarPopover({ user, onNavigate, onLogout, onClose }) {
    return (<div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50 pop-in" style={{ background: "var(--pan-surface)", border: "1px solid var(--pan-border)", boxShadow: "var(--pan-shadow-md)" }}>
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--pan-border)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--pan-text)" }}>{user.name}</p>
        <p className="text-[11px]" style={{ color: "var(--pan-text-muted)" }}>{user.email}</p>
        <span className="mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(217,144,61,0.15)", color: "var(--pan-accent)" }}>
          Cliente
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
export default function ClientLayout() {
    const sesion = useSesion();
    const navigate = useNavigate();
    const location = useLocation();
    const { totalUnidades: cartCount } = useCarrito();
    const { notificaciones } = useNotificaciones("cliente");
    const currentView = location.pathname.split("/")[2] ?? "inicio";
    const user = { initials: sesion?.iniciales ?? "U", name: sesion?.nombre ?? "Cliente", email: sesion?.email ?? "" };
    const onNavigate = (vista) => navigate(`/cliente/${vista}`);
    async function onLogout() {
        try {
            await cerrarSesion();
        }
        catch (error) {
            console.error("Error al cerrar sesión en el servidor:", error);
            localStorage.removeItem("usuario");
        }
        localStorage.removeItem("carrito");
        navigate("/", { replace: true });
    }
    const [mobileMenu, setMobileMenu] = useState(false);
    const [showBell, setShowBell] = useState(false);
    const [showAvatar, setShowAvatar] = useState(false);
    const bellRef = useRef(null);
    const avatarRef = useRef(null);
    const unread = notificaciones.filter(n => n.sinLeer).length;
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
    return (<div className="min-h-screen flex flex-col" style={{ background: "var(--pan-bg)" }}>
      {/* Fixed navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center px-4 md:px-8 gap-4 topbar-surface" style={{ borderBottom: "1px solid var(--pan-border)" }}>
        {/* Logo */}
        <button onClick={() => onNavigate("inicio")} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--pan-accent)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.5c.7-1.3 1.18-3.5 1.5-5.5"/>
              <path d="M17 8a5 5 0 1 0-8.66 5"/>
              <path d="M12.67 12.5A5 5 0 0 1 8 10"/>
            </svg>
          </div>
          <span className="font-display italic text-lg font-semibold" style={{ color: "var(--pan-accent)" }}>Panify</span>
        </button>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {NAV_LINKS.map(link => (<button key={link.id} onClick={() => onNavigate(link.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all" style={{
                color: currentView === link.id ? "var(--pan-accent)" : "var(--pan-text-muted)",
                background: currentView === link.id ? "rgba(217,144,61,0.1)" : "transparent",
                fontWeight: currentView === link.id ? "600" : "500",
            }}>
              {link.label}
            </button>))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Cart */}
          <button onClick={() => onNavigate("carrito")} className="relative p-2.5 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" style={{ color: currentView === "carrito" ? "var(--pan-accent)" : "var(--pan-text-muted)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <ShoppingCart size={19}/>
            {cartCount > 0 && (<span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: "var(--pan-accent)" }}>
                {cartCount}
              </span>)}
          </button>

          {/* Bell */}
          <div ref={bellRef} className="relative">
            <button onClick={() => { setShowBell(p => !p); setShowAvatar(false); }} className="relative p-2.5 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" style={{ color: "var(--pan-text-muted)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <Bell size={18}/>
              {unread > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: "#C62828" }}/>}
            </button>
            {showBell && <BellPopover notificaciones={notificaciones}/>}
          </div>

          {/* Avatar */}
          <div ref={avatarRef} className="relative">
            <button onClick={() => { setShowAvatar(p => !p); setShowBell(false); }} className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors" onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <div className="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center" style={{ background: "var(--pan-accent)", color: "#fff" }}>
                {user.initials}
              </div>
              <span className="hidden sm:block text-[13px] font-semibold" style={{ color: "var(--pan-text)" }}>{sesion?.nombreCorto ?? user.name}</span>
              <ChevronDown size={13} style={{ color: "var(--pan-text-faint)" }}/>
            </button>
            {showAvatar && <AvatarPopover user={user} onNavigate={onNavigate} onLogout={onLogout} onClose={() => setShowAvatar(false)}/>}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenu(p => !p)} className="md:hidden p-2.5 rounded-xl transition-colors" style={{ color: "var(--pan-text-muted)" }}>
            {mobileMenu ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenu && (<div className="fixed top-16 left-0 right-0 z-30 md:hidden pop-in" style={{ background: "var(--pan-surface)", borderBottom: "1px solid var(--pan-border)", boxShadow: "var(--pan-shadow-md)" }}>
          {NAV_LINKS.map(link => (<button key={link.id} onClick={() => { onNavigate(link.id); setMobileMenu(false); }} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors text-left" style={{ color: currentView === link.id ? "var(--pan-accent)" : "var(--pan-text)", borderBottom: "1px solid var(--pan-border-soft)" }}>
              {link.icon}
              {link.label}
            </button>))}
        </div>)}

      {/* Page content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>);
}
