import { X, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
const btnVariants = {
    primary: "bg-oro-gold text-white hover:bg-[#C47E2E] active:bg-[#B3721F] shadow-sm",
    secondary: "bg-oro-dark text-oro-cream hover:bg-[#2C1B18] active:bg-[#1E100E]",
    outline: "border-2 border-oro-gold text-oro-gold bg-transparent hover:bg-oro-gold/10 active:bg-oro-gold/20",
    ghost: "text-oro-brown hover:bg-oro-light/60 active:bg-oro-light hover:text-oro-dark",
    danger: "bg-oro-red text-white hover:bg-[#A82020] active:bg-[#911A1A] shadow-sm",
};
const btnSizes = {
    sm: "px-3 py-1.5 text-xs font-medium rounded-lg min-h-[36px]",
    md: "px-4 py-2.5 text-sm font-semibold rounded-xl min-h-[44px]",
    lg: "px-6 py-3 text-base font-semibold rounded-xl min-h-[52px]",
};
export function Button({ variant = "primary", size = "md", children, onClick, disabled, type = "button", className = "", fullWidth }) {
    return (<button type={type} onClick={onClick} disabled={disabled} className={[
            "inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer select-none",
            btnVariants[variant],
            btnSizes[size],
            disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "",
            fullWidth ? "w-full" : "",
            className,
        ].join(" ")}>
      {children}
    </button>);
}
const badgeVariants = {
    success: "bg-oro-green-bg text-oro-green",
    warning: "bg-oro-amber-bg text-[#B8760A]",
    danger: "bg-oro-red-bg text-oro-red",
    info: "bg-oro-blue-bg text-oro-blue",
    neutral: "bg-[#EFEBE9] text-oro-brown",
    gold: "bg-[#FFF3E0] text-oro-gold",
};
const dotColors = {
    success: "bg-oro-green",
    warning: "bg-oro-amber",
    danger: "bg-oro-red",
    info: "bg-oro-blue",
    neutral: "bg-oro-brown",
    gold: "bg-oro-gold",
};
export function Badge({ variant = "neutral", children, size = "md", dot }) {
    return (<span className={[
            "inline-flex items-center gap-1.5 font-medium rounded-full",
            badgeVariants[variant],
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        ].join(" ")}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}/>}
      {children}
    </span>);
}
export function Input({ label, error, hint, leftIcon, rightIcon, className = "", ...props }) {
    return (<div className="flex flex-col gap-1.5">
      {label && (<label className="text-xs font-semibold text-oro-dark uppercase tracking-wider">
          {label}
        </label>)}
      <div className="relative">
        {leftIcon && (<span className="absolute left-3 top-1/2 -translate-y-1/2 text-oro-brown">{leftIcon}</span>)}
        <input {...props} className={[
            "w-full bg-white border rounded-xl px-3 py-2.5 text-sm text-oro-dark placeholder:text-oro-brown/60",
            "transition-colors duration-150 min-h-[44px]",
            error
                ? "border-oro-red focus:border-oro-red focus:ring-2 focus:ring-oro-red/20"
                : "border-oro-light focus:border-oro-gold focus:ring-2 focus:ring-oro-gold/20",
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            "outline-none",
            className,
        ].join(" ")}/>
        {rightIcon && (<span className="absolute right-3 top-1/2 -translate-y-1/2 text-oro-brown">{rightIcon}</span>)}
      </div>
      {error && <p className="text-xs text-oro-red flex items-center gap-1"><AlertTriangle size={12}/>{error}</p>}
      {hint && !error && <p className="text-xs text-oro-brown">{hint}</p>}
    </div>);
}
export function Select({ label, options, error, className = "", ...props }) {
    return (<div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-oro-dark uppercase tracking-wider">{label}</label>}
      <select {...props} className={[
            "w-full bg-white border rounded-xl px-3 py-2.5 text-sm text-oro-dark appearance-none cursor-pointer",
            "transition-colors duration-150 min-h-[44px] outline-none",
            error
                ? "border-oro-red focus:border-oro-red"
                : "border-oro-light focus:border-oro-gold focus:ring-2 focus:ring-oro-gold/20",
            className,
        ].join(" ")}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-oro-red">{error}</p>}
    </div>);
}
export function Textarea({ label, error, className = "", ...props }) {
    return (<div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-oro-dark uppercase tracking-wider">{label}</label>}
      <textarea {...props} className={[
            "w-full bg-white border rounded-xl px-3 py-2.5 text-sm text-oro-dark placeholder:text-oro-brown/60",
            "transition-colors duration-150 outline-none resize-none",
            error ? "border-oro-red" : "border-oro-light focus:border-oro-gold focus:ring-2 focus:ring-oro-gold/20",
            className,
        ].join(" ")}/>
      {error && <p className="text-xs text-oro-red">{error}</p>}
    </div>);
}
const modalSizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };
export function Modal({ isOpen, onClose, title, children, size = "md", footer }) {
    if (!isOpen)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-oro-dark/50 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative w-full ${modalSizes[size]} bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-oro-light">
          <h2 className="font-display text-lg font-semibold text-oro-dark">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-oro-cream text-oro-brown hover:text-oro-dark transition-colors">
            <X size={18}/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-oro-light bg-oro-cream/40 rounded-b-2xl">{footer}</div>}
      </div>
    </div>);
}
export function StatCard({ title, value, subtitle, icon, accentColor = "bg-oro-gold", trend }) {
    return (<div className="bg-white rounded-2xl p-5 shadow-sm border border-oro-light/50 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-oro-brown uppercase tracking-wider">{title}</p>
        <div className={`${accentColor} p-2 rounded-xl text-white`}>{icon}</div>
      </div>
      <p className="font-display text-2xl font-bold text-oro-dark mb-1">{value}</p>
      {trend && (<span className={`text-xs font-medium ${trend.up ? "text-oro-green" : "text-oro-red"}`}>
          {trend.up ? "↑" : "↓"} {trend.value}
        </span>)}
      {subtitle && <p className="text-xs text-oro-brown mt-1">{subtitle}</p>}
    </div>);
}
const toastStyles = {
    success: { bg: "border-oro-green bg-oro-green-bg", icon: <CheckCircle size={16} className="text-oro-green flex-shrink-0"/> },
    error: { bg: "border-oro-red bg-oro-red-bg", icon: <XCircle size={16} className="text-oro-red flex-shrink-0"/> },
    warning: { bg: "border-oro-amber bg-oro-amber-bg", icon: <AlertTriangle size={16} className="text-oro-amber flex-shrink-0"/> },
    info: { bg: "border-oro-blue bg-oro-blue-bg", icon: <Info size={16} className="text-oro-blue flex-shrink-0"/> },
};
export function Toast({ message, type = "success", onClose }) {
    const style = toastStyles[type];
    return (<div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${style.bg}`}>
      {style.icon}
      <p className="text-sm font-medium text-oro-dark flex-1">{message}</p>
      <button onClick={onClose} className="text-oro-brown hover:text-oro-dark"><X size={14}/></button>
    </div>);
}
export function EmptyState({ icon, title, description, action }) {
    return (<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-oro-light mb-4">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-oro-dark mb-2">{title}</h3>
      {description && <p className="text-sm text-oro-brown max-w-xs mb-5">{description}</p>}
      {action}
    </div>);
}
const alertStyles = {
    success: "bg-oro-green-bg border-oro-green text-oro-green",
    warning: "bg-oro-amber-bg border-oro-amber text-[#7A5700]",
    danger: "bg-oro-red-bg border-oro-red text-oro-red",
    info: "bg-oro-blue-bg border-oro-blue text-oro-blue",
};
export function Alert({ type, message, onClose }) {
    return (<div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${alertStyles[type]}`}>
      <AlertTriangle size={16} className="flex-shrink-0"/>
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose}><X size={14}/></button>}
    </div>);
}
export function SearchInput({ value, onChange, placeholder = "Buscar..." }) {
    return (<div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-oro-brown" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-white border border-oro-light rounded-xl pl-10 pr-4 py-2.5 text-sm text-oro-dark placeholder:text-oro-brown/60 focus:border-oro-gold focus:ring-2 focus:ring-oro-gold/20 outline-none min-h-[44px] transition-all"/>
    </div>);
}
// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ className = "" }) {
    return <hr className={`border-oro-light ${className}`}/>;
}
export function PageHeader({ title, subtitle, action }) {
    return (<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-oro-dark">{title}</h1>
        {subtitle && <p className="text-sm text-oro-brown mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>);
}
