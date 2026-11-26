import { useState } from "react";
import { Bell, AlertCircle, Info, CheckCircle } from "lucide-react";

const ICONOS_NOTIFICACION = {
    warning: <AlertCircle size={14} className="text-oro-amber"/>,
    info: <Info size={14} className="text-oro-blue"/>,
    success: <CheckCircle size={14} className="text-oro-green"/>,
};

export default function BellPopover({ notificaciones }) {
    const [leidas, setLeidas] = useState(false);
    const notifications = notificaciones.map(n => ({ ...n, icon: ICONOS_NOTIFICACION[n.tipo] ?? ICONOS_NOTIFICACION.info, text: n.texto, time: n.hora, unread: leidas ? false : n.sinLeer }));
    const unreadCount = notifications.filter(n => n.unread).length;
    return (<div className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50 pop-in" style={{ background: "var(--pan-surface)", border: "1px solid var(--pan-border)", boxShadow: "var(--pan-shadow-md)" }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--pan-border)" }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--pan-text)" }}>Notificaciones</span>
          {unreadCount > 0 && (<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "#C62828" }}>{unreadCount}</span>)}
        </div>
        <button onClick={() => setLeidas(true)} className="text-[11px] font-medium transition-colors" style={{ color: "var(--pan-accent)" }}>
          Marcar leídas
        </button>
      </div>

      {notifications.length === 0 ? (<div className="px-4 py-8 text-center">
          <Bell size={28} style={{ color: "var(--pan-text-faint)", margin: "0 auto 8px" }}/>
          <p className="text-sm" style={{ color: "var(--pan-text-muted)" }}>No tienes notificaciones</p>
        </div>) : (<div>
          {notifications.map(n => (<div key={n.id} className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer" style={{ borderBottom: "1px solid var(--pan-border-soft)", background: n.unread ? "var(--pan-surface-2)" : "transparent" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--pan-surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = n.unread ? "var(--pan-surface-2)" : "transparent"; }}>
              <div className="mt-0.5 flex-shrink-0">{n.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-snug" style={{ color: "var(--pan-text)" }}>{n.text}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--pan-text-faint)" }}>{n.time}</p>
              </div>
              {n.unread && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: "var(--pan-accent)" }}/>}
            </div>))}
        </div>)}
    </div>);
}
