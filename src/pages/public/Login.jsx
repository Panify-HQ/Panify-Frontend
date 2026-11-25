import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { iniciarSesion } from "../../services/auth.js";
import { rolDePanel } from "../../utils/adaptadores.js";
export default function Login() {
    const navigate = useNavigate();
    const onBack = () => navigate("/");
    const onRegister = () => navigate("/registro");
    const onForgot = () => navigate("/recuperacion");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (email.trim() === "" || password.trim() === "") {
            setError("Por favor completa el correo y la contraseña.");
            return;
        }
        setLoading(true);
        try {
            const usuario = await iniciarSesion(email.trim(), password);
            if (!usuario) {
                setError("Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.");
                return;
            }
            localStorage.setItem("usuario", JSON.stringify(usuario));
            navigate(rolDePanel(usuario.rol) === "cliente" ? "/cliente/inicio" : "/admin/dashboard", { replace: true });
        }
        catch (err) {
            console.error("Error al iniciar sesión:", err);
            setError("No se pudo conectar con el servidor. Inténtalo de nuevo en unos minutos.");
        }
        finally {
            setLoading(false);
        }
    }
    return (<div className="min-h-screen flex flex-col lg:flex-row bg-oro-cream">
      {/* Left panel — image + brand */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between overflow-hidden">
        {/* Background image */}
        <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=1400&fit=crop&auto=format" alt="Pan artesanal recién horneado" className="absolute inset-0 w-full h-full object-cover"/>
        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-oro-dark/80 via-oro-dark/50 to-oro-gold/40"/>

        {/* Top: Logo */}
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

        {/* Bottom: Slogan */}
        <div className="relative z-10 p-10 pb-14">
          <p className="font-display italic text-4xl xl:text-5xl text-white leading-tight font-light">
            "Horneamos Calidad,
            <br />
            <span className="text-oro-gold font-semibold not-italic">Entregamos Confianza."</span>
          </p>
          <p className="mt-5 text-white/60 text-sm font-sans font-light tracking-widest uppercase">
            Distribuciones Oro Pan · Soacha, Cundinamarca
          </p>
        </div>

        {/* Subtle grain texture overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}/>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-12 xl:px-16">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-oro-gold flex items-center justify-center shadow">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2C8.5 2 5.5 4.5 5 8c-1.7.5-3 2-3 3.8C2 13.6 3.5 15 5.3 15H9v2H7v2h10v-2h-2v-2h3.7c1.8 0 3.3-1.4 3.3-3.2 0-1.8-1.3-3.3-3-3.8C18.5 4.5 15.5 2 12 2z"/>
            </svg>
          </div>
          <span className="font-display text-xl font-bold text-oro-dark">Panify</span>
        </div>

        <div className="w-full max-w-md">
          {/* Back to landing */}
          {onBack && (<button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-oro-brown hover:text-oro-dark transition-colors mb-5">
              ← Volver al inicio
            </button>)}
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-oro-dark/8 border border-oro-light/60 px-8 py-10 sm:px-10">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-oro-dark leading-tight">
                Bienvenido de nuevo
              </h1>
              <p className="mt-1.5 text-sm text-oro-brown">
                Inicia sesión para gestionar tus pedidos en Oro Pan.
              </p>
            </div>

            {/* Error banner */}
            {error && (<div className="mb-6 flex gap-3 items-start bg-oro-red-bg border border-oro-red/20 rounded-xl px-4 py-3.5">
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-oro-red shrink-0 mt-0.5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p className="text-sm text-oro-red leading-snug">{error}</p>
              </div>)}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-oro-dark">
                  Correo electrónico
                </label>
                <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="tu@correo.com" className={`w-full h-11 px-4 rounded-xl border text-sm bg-oro-cream/40 text-oro-dark placeholder:text-oro-brown/40 transition-colors focus:outline-none focus:ring-2 focus:ring-oro-gold/50 focus:border-oro-gold ${error ? "border-oro-red/60 bg-oro-red-bg/30" : "border-oro-light"}`} disabled={loading} required/>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-oro-dark">
                  Contraseña
                </label>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" className={`w-full h-11 pl-4 pr-12 rounded-xl border text-sm bg-oro-cream/40 text-oro-dark placeholder:text-oro-brown/40 transition-colors focus:outline-none focus:ring-2 focus:ring-oro-gold/50 focus:border-oro-gold ${error ? "border-oro-red/60 bg-oro-red-bg/30" : "border-oro-light"}`} disabled={loading} required/>
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-oro-brown hover:text-oro-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} tabIndex={0}>
                    {showPassword ? (<svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>) : (<svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75C21.27 7.61 17 4.5 12 4.5c-1.27 0-2.49.2-3.64.57l2.17 2.17C11.21 7.1 11.59 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                      </svg>)}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <button type="button" onClick={onForgot} className="text-xs text-oro-gold font-medium hover:text-oro-dark transition-colors underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold rounded">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading || !email || !password} className="relative w-full h-12 rounded-xl bg-oro-gold text-white font-semibold text-sm tracking-wide overflow-hidden transition-all hover:bg-oro-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (<span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Verificando…
                  </span>) : ("Ingresar")}
              </button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-oro-brown">
              ¿No tienes cuenta?{" "}
              <button type="button" onClick={onRegister} className="font-semibold text-oro-gold hover:text-oro-dark transition-colors underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-oro-gold rounded">
                Regístrate
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>);
}
