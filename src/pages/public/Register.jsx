import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { registrarUsuario } from "../../services/auth.js";
function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function validatePhone(v) {
    return /^[0-9\s\-\+]{7,15}$/.test(v.trim());
}
function passwordStrength(p) {
    if (p.length === 0)
        return { score: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 8)
        score++;
    if (/[A-Z]/.test(p))
        score++;
    if (/[0-9]/.test(p))
        score++;
    if (/[^A-Za-z0-9]/.test(p))
        score++;
    const map = [
        { label: "Muy débil", color: "bg-oro-red" },
        { label: "Débil", color: "bg-orange-400" },
        { label: "Regular", color: "bg-oro-amber" },
        { label: "Fuerte", color: "bg-lime-500" },
        { label: "Muy fuerte", color: "bg-oro-green" },
    ];
    return { score, ...map[score] };
}
function getFieldError(key, fields) {
    switch (key) {
        case "nombre": return fields.nombre.trim().length < 2 ? "El nombre debe tener al menos 2 caracteres." : "";
        case "apellido": return fields.apellido.trim().length < 2 ? "El apellido debe tener al menos 2 caracteres." : "";
        case "correo": return !validateEmail(fields.correo) ? "Ingresa un correo válido." : "";
        case "telefono": return !validatePhone(fields.telefono) ? "Teléfono inválido (7-15 dígitos)." : "";
        case "password": return fields.password.length < 8 ? "Mínimo 8 caracteres." : "";
        case "confirmar": return fields.confirmar !== fields.password ? "Las contraseñas no coinciden." : "";
        case "direccion": return fields.direccion.trim().length < 5 ? "Ingresa una dirección completa." : "";
        case "terminos": return !fields.terminos ? "Debes aceptar los términos." : "";
        default: return "";
    }
}
const TEXT_FIELDS = ["nombre", "apellido", "correo", "telefono", "password", "confirmar", "direccion"];
function isFormValid(fields) {
    return TEXT_FIELDS.every((k) => getFieldError(k, fields) === "") && fields.terminos;
}
function Field({ id, label, value, touched, error, onChange, onBlur, type = "text", placeholder, autoComplete, disabled, suffix }) {
    const hasError = touched && error !== "";
    const isOk = touched && error === "" && value.trim() !== "";
    return (<div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-oro-dark">{label}</label>
      <div className="relative">
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder} autoComplete={autoComplete} disabled={disabled} className={`w-full h-11 ${suffix ? "pr-10" : "pr-4"} pl-4 rounded-xl border text-sm bg-oro-cream/40 text-oro-dark placeholder:text-oro-brown/40 transition-colors focus:outline-none focus:ring-2 focus:ring-oro-gold/50 focus:border-oro-gold ${hasError
            ? "border-oro-red/60 bg-oro-red-bg/30 focus:ring-oro-red/30 focus:border-oro-red/60"
            : isOk
                ? "border-oro-green/50 bg-oro-green-bg/20"
                : "border-oro-light"}`}/>
        {/* Status icon */}
        {!suffix && isOk && (<span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-oro-green"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </span>)}
        {!suffix && hasError && (<span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-oro-red"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </span>)}
        {suffix}
      </div>
      {hasError && <p className="text-xs text-oro-red leading-snug">{error}</p>}
    </div>);
}
export default function Register() {
    const navigate = useNavigate();
    const onBack = () => navigate("/ingresar");
    const onSuccess = () => navigate("/ingresar");
    const [errorServidor, setErrorServidor] = useState("");
    const [fields, setFields] = useState({
        nombre: "", apellido: "", correo: "", telefono: "",
        password: "", confirmar: "", direccion: "", terminos: false,
    });
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmar, setShowConfirmar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const set = useCallback((key, val) => {
        setFields((f) => ({ ...f, [key]: val }));
    }, []);
    const touch = useCallback((key) => {
        setTouched((t) => ({ ...t, [key]: true }));
    }, []);
    const strength = passwordStrength(fields.password);
    const valid = isFormValid(fields);
    async function handleSubmit(e) {
        e.preventDefault();
        // Touch all fields
        const allTouched = {};
        TEXT_FIELDS.forEach((k) => { allTouched[k] = true; });
        allTouched.terminos = true;
        setTouched(allTouched);
        if (!valid)
            return;
        setLoading(true);
        setErrorServidor("");
        try {
            await registrarUsuario({
                nombre: fields.nombre.trim(),
                apellido: fields.apellido.trim(),
                email: fields.correo.trim(),
                telefono: fields.telefono.trim(),
                direccion: fields.direccion.trim(),
                password: fields.password,
            });
            setSubmitted(true);
            setTimeout(() => onSuccess(), 1600);
        }
        catch (error) {
            console.error("Error al registrar el usuario:", error);
            setErrorServidor("No se pudo completar el registro. Inténtalo de nuevo.");
        }
        finally {
            setLoading(false);
        }
    }
    if (submitted) {
        return (<div className="min-h-screen flex items-center justify-center bg-oro-cream px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-oro-green-bg border-2 border-oro-green/30 flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-oro-green"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
          <h2 className="font-display text-3xl font-bold text-oro-dark mb-2">¡Cuenta creada!</h2>
          <p className="text-sm text-oro-brown">Te estamos redirigiendo al inicio de sesión…</p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen flex flex-col lg:flex-row bg-oro-cream">
      {/* Left panel */}
      <div className="relative hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col justify-between overflow-hidden">
        <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&h=1400&fit=crop&auto=format" alt="Panadero dando forma a masa artesanal" className="absolute inset-0 w-full h-full object-cover object-center"/>
        <div className="absolute inset-0 bg-gradient-to-b from-oro-dark/75 via-oro-dark/45 to-oro-gold/50"/>

        {/* Logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-oro-gold flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M12 2C8.5 2 5.5 4.5 5 8c-1.7.5-3 2-3 3.8C2 13.6 3.5 15 5.3 15H9v2H7v2h10v-2h-2v-2h3.7c1.8 0 3.3-1.4 3.3-3.2 0-1.8-1.3-3.3-3-3.8C18.5 4.5 15.5 2 12 2z"/>
              </svg>
            </div>
            <span className="font-display text-2xl font-bold text-white tracking-wide">Panify</span>
          </div>
        </div>

        {/* Steps copy */}
        <div className="relative z-10 p-10 pb-14 space-y-6">
          <p className="font-display italic text-3xl xl:text-4xl text-white leading-snug font-light">
            Únete a nuestra<br />
            <span className="text-oro-gold font-semibold not-italic">comunidad panadera.</span>
          </p>
          <div className="space-y-3">
            {[
            { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", label: "Realiza pedidos en minutos" },
            { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", label: "Recibe en tu puerta" },
            { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Rastrea tus pedidos en tiempo real" },
        ].map(({ icon, label }) => (<div key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-white fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon}/>
                  </svg>
                </div>
                <span className="text-sm text-white/85">{label}</span>
              </div>))}
          </div>
          <p className="text-white/40 text-xs tracking-widest uppercase">Distribuciones Oro Pan · Soacha</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-start items-center px-6 py-10 lg:px-10 xl:px-14 overflow-y-auto">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-oro-gold flex items-center justify-center shadow">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2C8.5 2 5.5 4.5 5 8c-1.7.5-3 2-3 3.8C2 13.6 3.5 15 5.3 15H9v2H7v2h10v-2h-2v-2h3.7c1.8 0 3.3-1.4 3.3-3.2 0-1.8-1.3-3.3-3-3.8C18.5 4.5 15.5 2 12 2z"/>
            </svg>
          </div>
          <span className="font-display text-xl font-bold text-oro-dark">Panify</span>
        </div>

        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-xl shadow-oro-dark/8 border border-oro-light/60 px-8 py-9 sm:px-10">
            {/* Heading */}
            <div className="mb-7">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-oro-dark leading-tight">
                Crea tu cuenta
              </h1>
              <p className="mt-1.5 text-sm text-oro-brown">
                Completa tus datos para empezar a pedir.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {errorServidor && (<div className="flex gap-3 items-start bg-oro-red-bg border border-oro-red/20 rounded-xl px-4 py-3.5">
                  <p className="text-sm text-oro-red leading-snug">{errorServidor}</p>
                </div>)}
              {/* Nombre + Apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field id="nombre" label="Nombre" value={fields.nombre} touched={!!touched.nombre} error={getFieldError("nombre", fields)} onChange={(v) => set("nombre", v)} onBlur={() => touch("nombre")} placeholder="María" autoComplete="given-name" disabled={loading}/>
                <Field id="apellido" label="Apellido" value={fields.apellido} touched={!!touched.apellido} error={getFieldError("apellido", fields)} onChange={(v) => set("apellido", v)} onBlur={() => touch("apellido")} placeholder="Rodríguez" autoComplete="family-name" disabled={loading}/>
              </div>

              {/* Correo */}
              <Field id="correo" label="Correo electrónico" value={fields.correo} touched={!!touched.correo} error={getFieldError("correo", fields)} onChange={(v) => set("correo", v)} onBlur={() => touch("correo")} type="email" placeholder="maria@correo.com" autoComplete="email" disabled={loading}/>

              {/* Teléfono */}
              <Field id="telefono" label="Teléfono" value={fields.telefono} touched={!!touched.telefono} error={getFieldError("telefono", fields)} onChange={(v) => set("telefono", v)} onBlur={() => touch("telefono")} type="tel" placeholder="+57 300 123 4567" autoComplete="tel" disabled={loading}/>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-oro-dark">Contraseña</label>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"} value={fields.password} onChange={(e) => set("password", e.target.value)} onBlur={() => touch("password")} placeholder="Mínimo 8 caracteres" autoComplete="new-password" disabled={loading} className={`w-full h-11 pl-4 pr-11 rounded-xl border text-sm bg-oro-cream/40 text-oro-dark placeholder:text-oro-brown/40 transition-colors focus:outline-none focus:ring-2 focus:ring-oro-gold/50 focus:border-oro-gold ${touched.password && getFieldError("password", fields)
            ? "border-oro-red/60 bg-oro-red-bg/30 focus:ring-oro-red/30 focus:border-oro-red/60"
            : touched.password && !getFieldError("password", fields)
                ? "border-oro-green/50 bg-oro-green-bg/20"
                : "border-oro-light"}`}/>
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-oro-brown hover:text-oro-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                    {showPassword ? (<svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>) : (<svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75C21.27 7.61 17 4.5 12 4.5c-1.27 0-2.49.2-3.64.57l2.17 2.17C11.21 7.1 11.59 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>)}
                  </button>
                </div>

                {/* Strength meter */}
                {fields.password.length > 0 && (<div className="space-y-1.5 pt-0.5">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength.score ? strength.color : "bg-oro-light"}`}/>))}
                    </div>
                    <p className={`text-xs font-medium ${strength.score <= 1 ? "text-oro-red" :
                strength.score === 2 ? "text-oro-amber" :
                    strength.score === 3 ? "text-lime-600" : "text-oro-green"}`}>
                      {strength.label}
                      <span className="text-oro-brown/50 font-normal ml-1">
                        — usa mayúsculas, números y símbolos para fortalecer.
                      </span>
                    </p>
                  </div>)}
                {touched.password && getFieldError("password", fields) && (<p className="text-xs text-oro-red">{getFieldError("password", fields)}</p>)}
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-1.5">
                <label htmlFor="confirmar" className="block text-sm font-medium text-oro-dark">Confirmar contraseña</label>
                <div className="relative">
                  <input id="confirmar" type={showConfirmar ? "text" : "password"} value={fields.confirmar} onChange={(e) => set("confirmar", e.target.value)} onBlur={() => touch("confirmar")} placeholder="Repite tu contraseña" autoComplete="new-password" disabled={loading} className={`w-full h-11 pl-4 pr-11 rounded-xl border text-sm bg-oro-cream/40 text-oro-dark placeholder:text-oro-brown/40 transition-colors focus:outline-none focus:ring-2 focus:ring-oro-gold/50 focus:border-oro-gold ${touched.confirmar && getFieldError("confirmar", fields)
            ? "border-oro-red/60 bg-oro-red-bg/30 focus:ring-oro-red/30 focus:border-oro-red/60"
            : touched.confirmar && !getFieldError("confirmar", fields) && fields.confirmar
                ? "border-oro-green/50 bg-oro-green-bg/20"
                : "border-oro-light"}`}/>
                  <button type="button" onClick={() => setShowConfirmar((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-oro-brown hover:text-oro-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold" aria-label={showConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}>
                    {showConfirmar ? (<svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>) : (<svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75C21.27 7.61 17 4.5 12 4.5c-1.27 0-2.49.2-3.64.57l2.17 2.17C11.21 7.1 11.59 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>)}
                  </button>
                  {touched.confirmar && !getFieldError("confirmar", fields) && fields.confirmar && (<span className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-oro-green"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    </span>)}
                </div>
                {touched.confirmar && getFieldError("confirmar", fields) && (<p className="text-xs text-oro-red">{getFieldError("confirmar", fields)}</p>)}
              </div>

              {/* Dirección */}
              <Field id="direccion" label="Dirección de entrega" value={fields.direccion} touched={!!touched.direccion} error={getFieldError("direccion", fields)} onChange={(v) => set("direccion", v)} onBlur={() => touch("direccion")} placeholder="Calle 45 # 12-34, Apto 201" autoComplete="street-address" disabled={loading}/>

              {/* Términos */}
              <div className="space-y-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input type="checkbox" checked={fields.terminos} onChange={(e) => { set("terminos", e.target.checked); touch("terminos"); }} className="sr-only peer" disabled={loading}/>
                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-oro-gold peer-focus-visible:ring-offset-1 ${fields.terminos
            ? "bg-oro-gold border-oro-gold"
            : touched.terminos
                ? "border-oro-red/60 bg-oro-red-bg/30"
                : "border-oro-light group-hover:border-oro-gold/60"}`}>
                      {fields.terminos && (<svg viewBox="0 0 24 24" className="w-3 h-3 fill-white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>)}
                    </div>
                  </div>
                  <span className="text-sm text-oro-brown leading-snug">
                    Acepto los{" "}
                    <button type="button" className="text-oro-gold font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold rounded">
                      Términos y Condiciones
                    </button>{" "}
                    y la{" "}
                    <button type="button" className="text-oro-gold font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold rounded">
                      Política de Privacidad
                    </button>{" "}
                    de Panify.
                  </span>
                </label>
                {touched.terminos && !fields.terminos && (<p className="text-xs text-oro-red pl-8">Debes aceptar los términos para continuar.</p>)}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-oro-gold text-white font-semibold text-sm tracking-wide transition-all hover:bg-oro-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? (<span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creando cuenta…
                  </span>) : ("Crear cuenta")}
              </button>
            </form>

            {/* Login link */}
            <p className="mt-6 text-center text-sm text-oro-brown">
              ¿Ya tienes cuenta?{" "}
              <button type="button" onClick={onBack} className="font-semibold text-oro-gold hover:text-oro-dark transition-colors underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold rounded">
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>);
}
