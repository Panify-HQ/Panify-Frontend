import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { recuperarPassword } from "../../services/auth.js";
function passwordStrength(p) {
    if (p.length === 0)
        return { score: 0, label: "", color: "", textColor: "" };
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
        { label: "Muy débil", color: "bg-oro-red", textColor: "text-oro-red" },
        { label: "Débil", color: "bg-orange-400", textColor: "text-orange-500" },
        { label: "Regular", color: "bg-oro-amber", textColor: "text-amber-600" },
        { label: "Fuerte", color: "bg-lime-500", textColor: "text-lime-600" },
        { label: "Muy fuerte", color: "bg-oro-green", textColor: "text-oro-green" },
    ];
    return { score, ...map[score] };
}
/* ── Step 1: Ingresar correo ─────────────────────────────────────────────── */
function StepEmail({ onSend }) {
    const [email, setEmail] = useState("");
    const [errorServidor, setErrorServidor] = useState("");
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const showError = touched && !isValid;
    async function handleSubmit(e) {
        e.preventDefault();
        setTouched(true);
        if (!isValid)
            return;
        setLoading(true);
        setErrorServidor("");
        try {
            await recuperarPassword(email.trim());
            onSend(email.trim());
        }
        catch (error) {
            console.error("Error al recuperar la contraseña:", error);
            setErrorServidor("No se pudo enviar el enlace. Inténtalo de nuevo.");
        }
        finally {
            setLoading(false);
        }
    }
    return (<>
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-oro-amber-bg border border-oro-amber/20 flex items-center justify-center mx-auto mb-7">
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-oro-gold">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
        </svg>
      </div>

      <h1 className="font-display text-2xl font-bold text-oro-dark text-center leading-tight mb-2">
        ¿Olvidaste tu contraseña?
      </h1>
      <p className="text-sm text-oro-brown text-center leading-relaxed mb-8">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errorServidor && (<p className="text-sm text-oro-red">{errorServidor}</p>)}
        <div className="space-y-1.5">
          <label htmlFor="fp-email" className="block text-sm font-medium text-oro-dark">
            Correo electrónico
          </label>
          <input id="fp-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setTouched(false); }} onBlur={() => setTouched(true)} placeholder="tu@correo.com" autoComplete="email" disabled={loading} className={`w-full h-11 px-4 rounded-xl border text-sm bg-oro-cream/40 text-oro-dark placeholder:text-oro-brown/40 transition-colors focus:outline-none focus:ring-2 focus:ring-oro-gold/50 focus:border-oro-gold ${showError
            ? "border-oro-red/60 bg-oro-red-bg/30 focus:ring-oro-red/30 focus:border-oro-red"
            : touched && isValid
                ? "border-oro-green/50 bg-oro-green-bg/20"
                : "border-oro-light"}`}/>
          {showError && (<p className="text-xs text-oro-red flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              Ingresa un correo válido.
            </p>)}
        </div>

        <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-oro-gold text-white font-semibold text-sm tracking-wide transition-all hover:bg-oro-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (<span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Enviando…
            </span>) : ("Enviar enlace")}
        </button>
      </form>
    </>);
}
/* ── Step 2: Confirmación de envío ───────────────────────────────────────── */
function StepSent({ email, onResend, onEnterCode }) {
    const [resent, setResent] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (cooldown <= 0)
            return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);
    async function handleResend() {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 900));
        setLoading(false);
        setResent(true);
        setCooldown(30);
        onResend();
        setTimeout(() => setResent(false), 3000);
    }
    return (<>
      {/* Envelope illustration */}
      <div className="relative w-24 h-24 mx-auto mb-7">
        <div className="absolute inset-0 rounded-full bg-oro-amber-bg border border-oro-amber/20"/>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 48 48" className="w-12 h-12">
            <rect x="4" y="10" width="40" height="28" rx="3" fill="#FFF8EE" stroke="#D9903D" strokeWidth="2"/>
            <path d="M4 13l20 14 20-14" stroke="#D9903D" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <circle cx="36" cy="12" r="7" fill="#D9903D"/>
            <path d="M33 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full border-2 border-oro-gold/30 animate-ping" style={{ animationDuration: "2s" }}/>
      </div>

      <h1 className="font-display text-2xl font-bold text-oro-dark text-center leading-tight mb-2">
        Revisa tu correo
      </h1>
      <p className="text-sm text-oro-brown text-center leading-relaxed mb-1">
        Te enviamos un enlace de recuperación a
      </p>
      <p className="text-sm font-semibold text-oro-dark text-center mb-7 truncate px-2">{email}</p>

      {/* Info box */}
      <div className="bg-oro-cream rounded-xl border border-oro-light px-4 py-3.5 mb-6 space-y-1.5">
        {[
            "Revisa también tu carpeta de spam.",
            "El enlace expira en 30 minutos.",
            "Solo un enlace activo a la vez.",
        ].map((tip) => (<div key={tip} className="flex items-start gap-2 text-xs text-oro-brown">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-oro-gold shrink-0 mt-0.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {tip}
          </div>))}
      </div>

      {/* Resend */}
      {resent && (<div className="flex items-center justify-center gap-1.5 text-xs text-oro-green font-medium mb-3">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          Enlace reenviado correctamente.
        </div>)}

      <button onClick={handleResend} disabled={loading || cooldown > 0} className="w-full h-11 rounded-xl border border-oro-light text-sm font-medium text-oro-brown hover:border-oro-gold hover:text-oro-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mb-3">
        {loading ? (<span className="flex items-center justify-center gap-2">
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Reenviando…
          </span>) : cooldown > 0 ? (`Reenviar en ${cooldown}s`) : ("Reenviar enlace")}
      </button>

      {/* Simulate "click link" for demo */}
      <button onClick={onEnterCode} className="w-full h-11 rounded-xl bg-oro-gold text-white font-semibold text-sm tracking-wide transition-all hover:bg-oro-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold focus-visible:ring-offset-2">
        Continuar con nueva contraseña →
      </button>
      <p className="text-center text-xs text-oro-brown/60 mt-2">(Demo: simula clic en el enlace)</p>
    </>);
}
/* ── Step 3: Nueva contraseña ────────────────────────────────────────────── */
function StepNewPassword({ onSuccess }) {
    const [password, setPassword] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showCf, setShowCf] = useState(false);
    const [touchedPw, setTouchedPw] = useState(false);
    const [touchedCf, setTouchedCf] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const strength = passwordStrength(password);
    const pwError = touchedPw && password.length < 8 ? "Mínimo 8 caracteres." : "";
    const cfError = touchedCf && confirmar !== password ? "Las contraseñas no coinciden." : "";
    const isValid = password.length >= 8 && confirmar === password && password === confirmar;
    async function handleSubmit(e) {
        e.preventDefault();
        setTouchedPw(true);
        setTouchedCf(true);
        if (!isValid)
            return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1200));
        setLoading(false);
        setDone(true);
    }
    if (done) {
        return (<div className="text-center py-4">
        {/* Success checkmark */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="w-20 h-20 rounded-full bg-oro-green-bg border-2 border-oro-green/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-oro-green">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
        </div>
        <h2 className="font-display text-2xl font-bold text-oro-dark mb-2">¡Contraseña actualizada!</h2>
        <p className="text-sm text-oro-brown mb-8 leading-relaxed">
          Tu contraseña fue cambiada exitosamente.<br />Ya puedes iniciar sesión con tu nueva clave.
        </p>
        <button onClick={onSuccess} className="w-full h-12 rounded-xl bg-oro-gold text-white font-semibold text-sm tracking-wide transition-all hover:bg-oro-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold focus-visible:ring-offset-2">
          Ir a iniciar sesión
        </button>
      </div>);
    }
    return (<>
      <div className="w-16 h-16 rounded-2xl bg-oro-green-bg border border-oro-green/20 flex items-center justify-center mx-auto mb-7">
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-oro-green">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
        </svg>
      </div>

      <h1 className="font-display text-2xl font-bold text-oro-dark text-center leading-tight mb-2">
        Nueva contraseña
      </h1>
      <p className="text-sm text-oro-brown text-center leading-relaxed mb-8">
        Elige una contraseña segura que no hayas usado antes.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Contraseña */}
        <div className="space-y-1.5">
          <label htmlFor="np-password" className="block text-sm font-medium text-oro-dark">
            Nueva contraseña
          </label>
          <div className="relative">
            <input id="np-password" type={showPw ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setTouchedPw(false); }} onBlur={() => setTouchedPw(true)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" disabled={loading} className={`w-full h-11 pl-4 pr-11 rounded-xl border text-sm bg-oro-cream/40 text-oro-dark placeholder:text-oro-brown/40 transition-colors focus:outline-none focus:ring-2 focus:ring-oro-gold/50 focus:border-oro-gold ${pwError
            ? "border-oro-red/60 bg-oro-red-bg/30"
            : touchedPw && !pwError && password
                ? "border-oro-green/50 bg-oro-green-bg/20"
                : "border-oro-light"}`}/>
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-oro-brown hover:text-oro-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold" aria-label={showPw ? "Ocultar" : "Mostrar"}>
              {showPw ? (<svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>) : (<svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75C21.27 7.61 17 4.5 12 4.5c-1.27 0-2.49.2-3.64.57l2.17 2.17C11.21 7.1 11.59 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>)}
            </button>
          </div>

          {/* Strength meter */}
          {password.length > 0 && (<div className="space-y-1.5 pt-0.5">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (<div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < strength.score ? strength.color : "bg-oro-light"}`}/>))}
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xs font-semibold ${strength.textColor}`}>{strength.label}</p>
                <p className="text-xs text-oro-brown/50">
                  {strength.score < 2 && "Añade mayúsculas y números"}
                  {strength.score === 2 && "Añade símbolos especiales"}
                  {strength.score >= 3 && "¡Buena contraseña!"}
                </p>
              </div>

              {/* Requirements checklist */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
                {[
                { ok: password.length >= 8, label: "8+ caracteres" },
                { ok: /[A-Z]/.test(password), label: "Una mayúscula" },
                { ok: /[0-9]/.test(password), label: "Un número" },
                { ok: /[^A-Za-z0-9]/.test(password), label: "Un símbolo" },
            ].map(({ ok, label }) => (<div key={label} className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${ok ? "bg-oro-green" : "bg-oro-light"}`}>
                      {ok && <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                    </div>
                    <span className={`text-xs transition-colors ${ok ? "text-oro-green font-medium" : "text-oro-brown/60"}`}>{label}</span>
                  </div>))}
              </div>
            </div>)}
          {pwError && <p className="text-xs text-oro-red">{pwError}</p>}
        </div>

        {/* Confirmar */}
        <div className="space-y-1.5">
          <label htmlFor="np-confirmar" className="block text-sm font-medium text-oro-dark">
            Confirmar contraseña
          </label>
          <div className="relative">
            <input id="np-confirmar" type={showCf ? "text" : "password"} value={confirmar} onChange={(e) => { setConfirmar(e.target.value); setTouchedCf(false); }} onBlur={() => setTouchedCf(true)} placeholder="Repite tu nueva contraseña" autoComplete="new-password" disabled={loading} className={`w-full h-11 pl-4 pr-11 rounded-xl border text-sm bg-oro-cream/40 text-oro-dark placeholder:text-oro-brown/40 transition-colors focus:outline-none focus:ring-2 focus:ring-oro-gold/50 focus:border-oro-gold ${cfError
            ? "border-oro-red/60 bg-oro-red-bg/30"
            : touchedCf && !cfError && confirmar
                ? "border-oro-green/50 bg-oro-green-bg/20"
                : "border-oro-light"}`}/>
            <button type="button" onClick={() => setShowCf((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-oro-brown hover:text-oro-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold" aria-label={showCf ? "Ocultar" : "Mostrar"}>
              {showCf ? (<svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>) : (<svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75C21.27 7.61 17 4.5 12 4.5c-1.27 0-2.49.2-3.64.57l2.17 2.17C11.21 7.1 11.59 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>)}
            </button>
            {touchedCf && !cfError && confirmar && (<span className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-oro-green"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </span>)}
          </div>
          {cfError && <p className="text-xs text-oro-red">{cfError}</p>}
        </div>

        <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-oro-gold text-white font-semibold text-sm tracking-wide transition-all hover:bg-oro-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (<span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Actualizando…
            </span>) : ("Guardar nueva contraseña")}
        </button>
      </form>
    </>);
}
export default function Recuperacion() {
    const navigate = useNavigate();
    const onBack = () => navigate("/ingresar");
    const [step, setStep] = useState("email");
    const [sentEmail, setSentEmail] = useState("");
    const stepIndex = step === "email" ? 0 : step === "sent" ? 1 : 2;
    return (<div className="min-h-screen bg-oro-cream flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 rounded-xl bg-oro-gold flex items-center justify-center shadow">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
            <path d="M12 2C8.5 2 5.5 4.5 5 8c-1.7.5-3 2-3 3.8C2 13.6 3.5 15 5.3 15H9v2H7v2h10v-2h-2v-2h3.7c1.8 0 3.3-1.4 3.3-3.2 0-1.8-1.3-3.3-3-3.8C18.5 4.5 15.5 2 12 2z"/>
          </svg>
        </div>
        <span className="font-display text-xl font-bold text-oro-dark">Panify</span>
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-2 mb-10">
        {["Correo", "Confirmación", "Nueva clave"].map((label, i) => (<div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${i < stepIndex
                ? "bg-oro-green text-white"
                : i === stepIndex
                    ? "bg-oro-gold text-white shadow-md shadow-oro-gold/30"
                    : "bg-oro-light text-oro-brown/60"}`}>
                {i < stepIndex ? (<svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>) : (i + 1)}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block transition-colors ${i === stepIndex ? "text-oro-gold" : i < stepIndex ? "text-oro-green" : "text-oro-brown/40"}`}>{label}</span>
            </div>
            {i < 2 && (<div className={`w-8 h-px mb-4 transition-colors duration-300 ${i < stepIndex ? "bg-oro-green" : "bg-oro-light"}`}/>)}
          </div>))}
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-oro-dark/8 border border-oro-light/60 px-8 py-10 sm:px-10">
        {step === "email" && (<StepEmail onSend={(email) => { setSentEmail(email); setStep("sent"); }}/>)}
        {step === "sent" && (<StepSent email={sentEmail} onResend={() => { }} onEnterCode={() => setStep("new-password")}/>)}
        {step === "new-password" && (<StepNewPassword onSuccess={onBack}/>)}

        {/* Back link — hidden on success sub-state */}
        {!(step === "new-password") && (<button onClick={step === "email" ? onBack : () => setStep("email")} className="mt-6 w-full flex items-center justify-center gap-1.5 text-sm text-oro-brown hover:text-oro-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold rounded">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            {step === "email" ? "Volver a iniciar sesión" : "Cambiar correo"}
          </button>)}
      </div>

      <p className="mt-8 text-xs text-oro-brown/40">
        Distribuciones Oro Pan · Panify &copy; {new Date().getFullYear()}
      </p>
    </div>);
}
