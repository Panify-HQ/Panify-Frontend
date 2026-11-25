import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useApariencia from "../../hooks/useApariencia.js";
import useSesion from "../../hooks/useSesion.js";
import { cerrarSesion } from "../../services/auth.js";
import { actualizarUsuario, obtenerPerfilUsuario, actualizarPerfilUsuario } from "../../services/users.js";
import { Camera, Eye, EyeOff, Check, Sun, Moon, Monitor, LayoutGrid, List, AlertTriangle } from "lucide-react";
import { Button, Modal } from "../../components/common/ui.jsx";
const ACCENT_OPTIONS = [
    { key: "trigo", label: "Dorado trigo", color: "#D9903D" },
    { key: "terracota", label: "Terracota", color: "#C0654A" },
    { key: "oliva", label: "Verde oliva", color: "#6B8C4A" },
    { key: "cielo", label: "Azul cielo", color: "#3B82C4" },
    { key: "frambuesa", label: "Frambuesa", color: "#C0406A" },
];
const COVER_OPTIONS = [
    { id: "panaderia", src: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=180&fit=crop&auto=format", label: "Panadería" },
    { id: "croissant", src: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=180&fit=crop&auto=format", label: "Croissants" },
    { id: "horno", src: "https://images.unsplash.com/photo-1600430188203-bbb8dac93174?w=300&h=180&fit=crop&auto=format", label: "Horno artesanal" },
];
/* ─── Toast ────────────────────────────────────────────────────────────────── */
function Toast({ msg, onHide }) {
    return (<div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl pop-in" style={{ background: "var(--pan-text)", color: "var(--pan-bg)" }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#2E7D32" }}>
        <Check size={12} color="#fff"/>
      </div>
      <span className="text-sm font-medium">{msg}</span>
      <button onClick={onHide} className="ml-2 text-sm opacity-60 hover:opacity-100">✕</button>
    </div>);
}
export default function Configuracion() {
    const navigate = useNavigate();
    const sesion = useSesion();
    const role = sesion?.rol ?? "cliente";
    const { theme: currentTheme, setTheme: onThemeChange, accentColor, setAccentColor: onAccentChange, textSize, setTextSize: onTextSizeChange } = useApariencia();
    async function onDeactivateAccount() {
        try {
            await actualizarUsuario(sesion.usuario.id, { estado: "Inactivo" });
            await cerrarSesion();
        }
        catch (error) {
            console.error("Error al desactivar la cuenta:", error);
            localStorage.removeItem("usuario");
        }
        localStorage.removeItem("carrito");
        navigate("/", { replace: true });
    }
    const [tab, setTab] = useState("perfil");
    const [toast, setToast] = useState({ show: false, msg: "" });
    const [confirmarDesactivacion, setConfirmarDesactivacion] = useState(false);
    // Perfil state
    const [nombre, setNombre] = useState(sesion?.usuario?.nombre ?? "");
    const [apellido, setApellido] = useState(sesion?.usuario?.apellido ?? "");
    const email = sesion?.email ?? "";
    const [telefono, setTelefono] = useState(sesion?.usuario?.telefono ?? "");
    const [direccion, setDireccion] = useState(sesion?.usuario?.direccion ?? "");
    const [barrio, setBarrio] = useState(sesion?.usuario?.barrio ?? "");
    useEffect(() => {
        if (role !== "cliente")
            return;
        obtenerPerfilUsuario()
            .then(perfil => {
            setNombre(perfil.nombre);
            setApellido(perfil.apellido);
            setTelefono(perfil.telefono);
            setDireccion(perfil.direccion === "No registrada" ? "" : perfil.direccion);
        })
            .catch(error => console.error("Error al cargar el perfil:", error));
    }, [role]);
    const [oldPwd, setOldPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    // Apariencia state
    const [catalogView, setCatalogView] = useState("grid");
    const [coverImage, setCoverImage] = useState("panaderia");
    function showToast(msg) {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: "" }), 3200);
    }
    async function handleSavePerfil() {
        try {
            if (role === "cliente") {
                await actualizarPerfilUsuario(sesion.usuario.id, sesion.usuario.cliente_idCliente, { nombre, apellido, email, telefono, direccion, ciudad: sesion.usuario.ciudad ?? "Soacha" });
            }
            else {
                await actualizarUsuario(sesion.usuario.id, { nombre, apellido, telefono });
            }
            localStorage.setItem("usuario", JSON.stringify({ ...sesion.usuario, nombre, apellido, telefono, direccion }));
            window.dispatchEvent(new Event("usuarioActualizado"));
            showToast("Perfil actualizado correctamente");
        }
        catch (error) {
            console.error("Error al actualizar el perfil:", error);
            showToast("No se pudo actualizar el perfil");
        }
    }
    function handleSavePwd() {
        if (!oldPwd || !newPwd)
            return showToast("Completa los campos de contraseña");
        showToast("Contraseña actualizada correctamente");
        setOldPwd("");
        setNewPwd("");
    }
    function handleReset() {
        onThemeChange("auto");
        onAccentChange("trigo");
        onTextSizeChange("normal");
        setCatalogView("grid");
        setCoverImage("panaderia");
        showToast("Configuración restablecida");
    }
    // Apply accent color to root
    const accentHex = ACCENT_OPTIONS.find(a => a.key === accentColor)?.color ?? "#D9903D";
    return (<div className="max-w-3xl mx-auto">
      {toast.show && <Toast msg={toast.msg} onHide={() => setToast({ show: false, msg: "" })}/>}

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--pan-text)" }}>Configuración</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--pan-text-muted)" }}>Personaliza tu perfil y la apariencia de Panify</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "var(--pan-surface-2)" }}>
        {[{ id: "perfil", label: "Mi perfil" }, { id: "apariencia", label: "Apariencia" }].map(t => (<button key={t.id} onClick={() => setTab(t.id)} className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all" style={{
                background: tab === t.id ? "var(--pan-surface)" : "transparent",
                color: tab === t.id ? "var(--pan-text)" : "var(--pan-text-muted)",
                boxShadow: tab === t.id ? "var(--pan-shadow)" : "none",
            }}>
            {t.label}
          </button>))}
      </div>

      {/* ─── TAB: MI PERFIL ─────────────────────────────────────────────────────── */}
      {tab === "perfil" && (<div className="space-y-5">
          {/* Avatar upload */}
          <div className="pan-card p-6">
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--pan-text)" }}>Foto de perfil</h2>
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl text-white flex-shrink-0" style={{ background: accentHex }}>
                  {nombre[0]}{apellido[0]}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md" style={{ background: "var(--pan-text)" }}>
                  <Camera size={13}/>
                </button>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--pan-text)" }}>Cambiar foto</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--pan-text-muted)" }}>JPG, PNG o WebP · máx. 2 MB</p>
                <button className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" style={{ background: "rgba(217,144,61,0.12)", color: accentHex }}>
                  Subir imagen
                </button>
              </div>
            </div>
          </div>

          {/* Info personal */}
          <div className="pan-card p-6 space-y-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--pan-text)" }}>Información personal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--pan-text-muted)" }}>Nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} className="pan-input"/>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--pan-text-muted)" }}>Apellido</label>
                <input value={apellido} onChange={e => setApellido(e.target.value)} className="pan-input"/>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--pan-text-muted)" }}>Correo electrónico</label>
                <input value={email} readOnly className="pan-input opacity-60 cursor-not-allowed"/>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--pan-text-muted)" }}>Teléfono</label>
                <input value={telefono} onChange={e => setTelefono(e.target.value)} className="pan-input"/>
              </div>
              {role === "cliente" && (<>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--pan-text-muted)" }}>Dirección de entrega</label>
                    <input value={direccion} onChange={e => setDireccion(e.target.value)} className="pan-input"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--pan-text-muted)" }}>Barrio</label>
                    <input value={barrio} onChange={e => setBarrio(e.target.value)} className="pan-input"/>
                  </div>
                </>)}
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={handleSavePerfil} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors" style={{ background: accentHex }}>
                Guardar cambios
              </button>
            </div>
          </div>

          {/* Cambiar contraseña */}
          <div className="pan-card p-6 space-y-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--pan-text)" }}>Cambiar contraseña</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--pan-text-muted)" }}>Contraseña actual</label>
                <div className="relative">
                  <input type={showOld ? "text" : "password"} value={oldPwd} onChange={e => setOldPwd(e.target.value)} className="pan-input pr-10" placeholder="••••••••"/>
                  <button onClick={() => setShowOld(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--pan-text-faint)" }}>
                    {showOld ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--pan-text-muted)" }}>Nueva contraseña</label>
                <div className="relative">
                  <input type={showNew ? "text" : "password"} value={newPwd} onChange={e => setNewPwd(e.target.value)} className="pan-input pr-10" placeholder="••••••••"/>
                  <button onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--pan-text-faint)" }}>
                    {showNew ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleSavePwd} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ background: "var(--pan-surface-2)", color: "var(--pan-text)", border: "1px solid var(--pan-border)" }}>
                Actualizar contraseña
              </button>
            </div>
          </div>

          {/* Desactivar cuenta */}
          <div className="pan-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-oro-red">Desactivar cuenta</h2>
                <p className="mt-1 text-xs" style={{ color: "var(--pan-text-muted)" }}>
                  Tu perfil quedará marcado como desactivado y cerrarás la sesión actual.
                </p>
              </div>
              <Button variant="danger" onClick={() => setConfirmarDesactivacion(true)}>
                Desactivar mi cuenta
              </Button>
            </div>
          </div>
        </div>)}

      {/* ─── TAB: APARIENCIA ────────────────────────────────────────────────────── */}
      {tab === "apariencia" && (<div className="space-y-5">
          {/* Tema */}
          <div className="pan-card p-6">
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--pan-text)" }}>Tema de la interfaz</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "light", label: "Claro", icon: <Sun size={20}/>, preview: { bg: "#FFF8EE", surface: "#fff", text: "#3E2723", border: "#F0DFC8" } },
                { key: "dark", label: "Oscuro", icon: <Moon size={20}/>, preview: { bg: "#1A0F0C", surface: "#241510", text: "#F5EDE4", border: "#3E2723" } },
                { key: "auto", label: "Automático", icon: <Monitor size={20}/>, preview: { bg: "linear-gradient(135deg,#FFF8EE 50%,#1A0F0C 50%)", surface: "#ddd", text: "#3E2723", border: "#ccc" } },
            ].map(t => (<button key={t.key} onClick={() => onThemeChange(t.key)} className="rounded-xl overflow-hidden border-2 transition-all text-left" style={{ borderColor: currentTheme === t.key ? accentHex : "var(--pan-border)" }}>
                  {/* Mini preview */}
                  <div className="h-16 relative" style={{ background: t.preview.bg }}>
                    <div className="absolute left-2 top-2 right-2 h-2 rounded" style={{ background: t.preview.surface, border: `1px solid ${t.preview.border}` }}/>
                    <div className="absolute left-2 top-6 w-6 h-6 rounded-md flex items-center justify-center" style={{ background: accentHex, color: "#fff" }}>
                      {t.icon && <span className="scale-50">{t.icon}</span>}
                    </div>
                    {currentTheme === t.key && (<div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: accentHex }}>
                        <Check size={9} color="#fff"/>
                      </div>)}
                  </div>
                  <div className="px-3 py-2" style={{ background: "var(--pan-surface)" }}>
                    <p className="text-xs font-semibold" style={{ color: "var(--pan-text)" }}>{t.label}</p>
                  </div>
                </button>))}
            </div>
          </div>

          {/* Color de acento */}
          <div className="pan-card p-6">
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--pan-text)" }}>Color de acento</h2>
            <div className="flex gap-3 flex-wrap">
              {ACCENT_OPTIONS.map(a => (<button key={a.key} onClick={() => onAccentChange(a.key)} className="group flex flex-col items-center gap-1.5" title={a.label}>
                  <div className="w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center" style={{ background: a.color, borderColor: accentColor === a.key ? "var(--pan-text)" : "transparent", transform: accentColor === a.key ? "scale(1.15)" : "scale(1)" }}>
                    {accentColor === a.key && <Check size={14} color="#fff"/>}
                  </div>
                  <span className="text-[9px] font-medium" style={{ color: "var(--pan-text-muted)" }}>{a.label}</span>
                </button>))}
            </div>
          </div>

          {/* Tamaño de texto */}
          <div className="pan-card p-6">
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--pan-text)" }}>Tamaño de texto</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "small", label: "Pequeño", sample: "Aa", size: "text-sm" },
                { key: "normal", label: "Normal", sample: "Aa", size: "text-base" },
                { key: "large", label: "Grande", sample: "Aa", size: "text-xl" },
            ].map(s => (<button key={s.key} onClick={() => onTextSizeChange(s.key)} className="rounded-xl p-4 flex flex-col items-center gap-2 border-2 transition-all" style={{ borderColor: textSize === s.key ? accentHex : "var(--pan-border)", background: textSize === s.key ? `${accentHex}10` : "var(--pan-surface)" }}>
                  <span className={`font-display font-bold ${s.size}`} style={{ color: textSize === s.key ? accentHex : "var(--pan-text)" }}>{s.sample}</span>
                  <span className="text-xs font-medium" style={{ color: "var(--pan-text-muted)" }}>{s.label}</span>
                </button>))}
            </div>
          </div>

          {/* Cliente-only: catalog view + cover */}
          {role === "cliente" && (<>
              <div className="pan-card p-6">
                <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--pan-text)" }}>Vista del catálogo</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "grid", label: "Cuadrícula", icon: <LayoutGrid size={22}/> },
                    { key: "list", label: "Lista", icon: <List size={22}/> },
                ].map(v => (<button key={v.key} onClick={() => setCatalogView(v.key)} className="rounded-xl p-5 flex flex-col items-center gap-2 border-2 transition-all" style={{ borderColor: catalogView === v.key ? accentHex : "var(--pan-border)", background: catalogView === v.key ? `${accentHex}10` : "var(--pan-surface)" }}>
                      <span style={{ color: catalogView === v.key ? accentHex : "var(--pan-text-muted)" }}>{v.icon}</span>
                      <span className="text-xs font-semibold" style={{ color: catalogView === v.key ? accentHex : "var(--pan-text)" }}>{v.label}</span>
                    </button>))}
                </div>
              </div>

              <div className="pan-card p-6">
                <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--pan-text)" }}>Imagen de portada en Inicio</h2>
                <div className="grid grid-cols-3 gap-3">
                  {COVER_OPTIONS.map(c => (<button key={c.id} onClick={() => setCoverImage(c.id)} className="rounded-xl overflow-hidden border-2 transition-all" style={{ borderColor: coverImage === c.id ? accentHex : "var(--pan-border)" }}>
                      <div className="relative h-20">
                        <img src={c.src} alt={c.label} className="w-full h-full object-cover"/>
                        {coverImage === c.id && (<div className="absolute inset-0 flex items-center justify-center" style={{ background: `${accentHex}55` }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: accentHex }}>
                              <Check size={12} color="#fff"/>
                            </div>
                          </div>)}
                      </div>
                      <p className="text-[10px] font-medium py-1.5 text-center" style={{ color: "var(--pan-text-muted)", background: "var(--pan-surface)" }}>{c.label}</p>
                    </button>))}
                </div>
              </div>
            </>)}

          {/* Vista previa en vivo */}
          <div className="pan-card p-6">
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--pan-text)" }}>Vista previa</h2>
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--pan-border)", background: "var(--pan-surface-2)" }}>
              {/* Mini topbar */}
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "var(--pan-surface)", borderBottom: "1px solid var(--pan-border)" }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: accentHex }}>
                  <span className="text-[9px] font-bold text-white">P</span>
                </div>
                <div className="flex-1 h-2 rounded" style={{ background: "var(--pan-border)" }}/>
                <div className="w-5 h-5 rounded-full" style={{ background: accentHex }}/>
              </div>
              {/* Mini content */}
              <div className="p-4 space-y-2">
                <div className="h-3 rounded w-1/2" style={{ background: "var(--pan-border)" }}/>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map(i => (<div key={i} className="rounded-lg p-2.5" style={{ background: "var(--pan-surface)" }}>
                      <div className="w-5 h-5 rounded-md mb-1.5" style={{ background: `${accentHex}${i === 0 ? "ff" : "40"}` }}/>
                      <div className="h-1.5 rounded" style={{ background: "var(--pan-border)" }}/>
                    </div>))}
                </div>
              </div>
            </div>
          </div>

          {/* Restablecer */}
          <div className="flex justify-end">
            <button onClick={handleReset} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ color: "var(--pan-text-muted)", border: "1px solid var(--pan-border)" }}>
              Restablecer valores predeterminados
            </button>
          </div>
        </div>)}

      <Modal isOpen={confirmarDesactivacion} onClose={() => setConfirmarDesactivacion(false)} title="Desactivar cuenta" footer={<div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmarDesactivacion(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={onDeactivateAccount}>
              Sí, desactivar
            </Button>
          </div>}>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-oro-red-bg p-2.5 text-oro-red">
            <AlertTriangle size={20}/>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--pan-text)" }}>
              ¿Confirmas que deseas desactivar tu cuenta?
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--pan-text-muted)" }}>
              El administrador verá tu cuenta como desactivada en el listado de usuarios.
            </p>
          </div>
        </div>
      </Modal>
    </div>);
}
