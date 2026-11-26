import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, MapPin, Phone, Mail, Clock, Link2, Share2, ChevronDown, Star, Award, Truck, Heart, } from "lucide-react";
import { obtenerProductosPanel } from "../../services/panel.js";
import { formatCOP } from "../../utils/formatos.js";
import { imagenDeProducto } from "../../utils/adaptadores.js";
/* ─── Datos ──────────────────────────────────────────────────────────────────── */
const EQUIPO = [
    {
        nombre: "Carmen Díaz",
        rol: "Maestra Panadera",
        bio: "30 años de oficio, discípula de los hornos de Mompox. Especialista en panes de masa madre.",
        img: "photo-1607631568010-a87245c0daf8",
    },
    {
        nombre: "Tomás Guerrero",
        rol: "Maestro Panadero",
        bio: "Convierte cada receta tradicional en una pieza de artesanía, hornada a diario en la fábrica.",
        img: "photo-1566554273541-37a9ca77b91f",
    },
    {
        nombre: "Lucía Morales",
        rol: "Directora de Logística",
        bio: "Garantiza que cada pedido llegue a tiempo, fresco y en perfectas condiciones.",
        img: "photo-1580489944761-15a19d654956",
    },
];
const VALORES = [
    { icon: <Award size={22}/>, titulo: "Calidad artesanal", desc: "Horneamos con ingredientes seleccionados, sin conservantes ni atajos." },
    { icon: <Truck size={22}/>, titulo: "Entrega puntual", desc: "Tu pedido llega fresco antes de las 8 AM. Sin demoras, sin excusas." },
    { icon: <Heart size={22}/>, titulo: "Hecho con amor", desc: "Cada pieza sale de nuestras manos con la misma dedicación de siempre." },
];
function Navbar({ active, onScroll, onLogin }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);
    const links = [
        { id: "inicio", label: "Inicio" },
        { id: "nosotros", label: "Nosotros" },
        { id: "productos", label: "Productos" },
        { id: "contacto", label: "Contacto" },
    ];
    return (<header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{
            background: scrolled ? "rgba(255,248,238,0.96)" : "transparent",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            borderBottom: scrolled ? "1px solid #F0DFC8" : "1px solid transparent",
            boxShadow: scrolled ? "0 2px 16px rgba(62,39,35,0.08)" : "none",
        }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button onClick={() => onScroll("inicio")} className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#D9903D" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.5c.7-1.3 1.18-3.5 1.5-5.5"/>
              <path d="M17 8a5 5 0 1 0-8.66 5"/>
              <path d="M12.67 12.5A5 5 0 0 1 8 10"/>
            </svg>
          </div>
          <span className="font-display italic text-xl font-bold" style={{ color: "#3E2723" }}>Panify</span>
        </button>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (<button key={l.id} onClick={() => onScroll(l.id)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{
                color: active === l.id ? "#D9903D" : "#8D6E63",
                background: active === l.id ? "rgba(217,144,61,0.1)" : "transparent",
                fontWeight: active === l.id ? "600" : "500",
            }}>
              {l.label}
            </button>))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <button onClick={onLogin} className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={{ background: "#3E2723", color: "#FFF8EE" }} onMouseEnter={e => { e.currentTarget.style.background = "#D9903D"; }} onMouseLeave={e => { e.currentTarget.style.background = "#3E2723"; }}>
            Ingresar <ArrowRight size={14}/>
          </button>
          <button onClick={() => setMobileOpen(p => !p)} className="md:hidden p-2 rounded-xl transition-colors" style={{ color: "#3E2723" }}>
            {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (<div className="md:hidden border-t" style={{ background: "rgba(255,248,238,0.98)", borderColor: "#F0DFC8" }}>
          {links.map(l => (<button key={l.id} onClick={() => { onScroll(l.id); setMobileOpen(false); }} className="w-full px-6 py-4 text-sm font-medium text-left transition-colors border-b" style={{ color: active === l.id ? "#D9903D" : "#3E2723", borderColor: "#FAF3E8" }}>
              {l.label}
            </button>))}
          <div className="px-5 py-4">
            <button onClick={() => { onLogin(); setMobileOpen(false); }} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: "#D9903D", color: "#fff" }}>
              Ingresar
            </button>
          </div>
        </div>)}
    </header>);
}
export default function LandingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const onLogin = () => navigate("/ingresar");
    const sectionRefs = useRef({});
    const [destacados, setDestacados] = useState([]);
    const [activeSection, setActiveSection] = useState("inicio");
    useEffect(() => {
        let activo = true;
        obtenerProductosPanel()
            .then(lista => { if (activo) setDestacados(lista.filter(p => p.status !== "agotado").slice(0, 6)); })
            .catch(error => console.error("Error al cargar los productos:", error));
        return () => { activo = false; };
    }, []);
    /* Enlaces /#productos y /#contacto (y las rutas /productos y /contacto) */
    useEffect(() => {
        const id = location.hash.replace("#", "") || location.pathname.replace("/", "");
        if (!["nosotros", "productos", "contacto"].includes(id))
            return;
        const el = sectionRefs.current[id];
        if (el)
            el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [location]);
    /* Intersection observer — actualiza la sección activa al hacer scroll */
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting)
                    setActiveSection(entry.target.id);
            });
        }, { threshold: 0.35 });
        Object.values(sectionRefs.current).forEach(el => { if (el)
            observer.observe(el); });
        return () => observer.disconnect();
    }, []);
    function scrollTo(id) {
        const el = sectionRefs.current[id];
        if (el)
            el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function setRef(id) {
        return (el) => { sectionRefs.current[id] = el; };
    }
    return (<div className="min-h-screen" style={{ background: "#FFF8EE", color: "#3E2723" }}>
      <Navbar active={activeSection} onScroll={scrollTo} onLogin={onLogin}/>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section id="inicio" ref={setRef("inicio")} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-8 md:pt-28">
        {/* Background image */}
        <img src="https://images.unsplash.com/photo-1486887396153-fa416526c108?w=1600&h=1000&fit=crop&auto=format" alt="Panadería artesanal Oro Pan" className="absolute inset-0 w-full h-full object-cover"/>
        {/* Layered overlays */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(62,39,35,0.82) 0%, rgba(62,39,35,0.55) 55%, rgba(217,144,61,0.25) 100%)" }}/>
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }}/>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Pre-badge */}
          <div className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full border" style={{ borderColor: "rgba(217,144,61,0.5)", background: "rgba(217,144,61,0.12)" }}>
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#D9903D" }}>
              Distribuciones Oro Pan · Soacha, Cundinamarca
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold text-white leading-tight mb-5" style={{ fontSize: "clamp(2.4rem, 7vw, 5rem)", lineHeight: 1.1 }}>
            Horneamos Calidad,
            <br />
            <em style={{ color: "#D9903D", fontStyle: "italic" }}>Entregamos Confianza.</em>
          </h1>

          <p className="text-white/70 max-w-xl mx-auto mb-10 leading-relaxed" style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)" }}>
            Fábrica de pan: panes tradicionales y dulces, horneados a diario y entregados a tu puerta.
            Pedidos en línea con entrega al amanecer.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={onLogin} className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-base transition-all" style={{ background: "#D9903D", color: "#fff", boxShadow: "0 4px 24px rgba(217,144,61,0.45)" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(217,144,61,0.55)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(217,144,61,0.45)"; }}>
              Hacer mi pedido <ArrowRight size={17}/>
            </button>
            <button onClick={() => scrollTo("nosotros")} className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-base transition-all border" style={{ color: "rgba(255,248,238,0.85)", borderColor: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}>
              Conocer más
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
            { value: "+12", label: "Años de experiencia" },
            { value: "200+", label: "Pedidos diarios" },
            { value: "4.9", label: "Calificación promedio" },
        ].map(s => (<div key={s.label} className="text-center">
                <p className="font-display font-bold text-white" style={{ fontSize: "1.8rem" }}>{s.value}</p>
                <p className="text-[11px] text-white/55 mt-0.5 leading-tight">{s.label}</p>
              </div>))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <ChevronDown size={20} style={{ color: "rgba(255,255,255,0.4)" }}/>
        </div>
      </section>

      {/* ═══════════════════ NOSOTROS ═══════════════════ */}
      <section id="nosotros" ref={setRef("nosotros")} className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-[60px]" style={{ background: "#D9903D" }}/>
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#D9903D" }}>Nuestra historia</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <h2 className="font-display font-bold mb-5 leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "#3E2723" }}>
                Más de una década
                <br />
                <span style={{ color: "#D9903D" }}>amasando tradición.</span>
              </h2>
              <p className="leading-relaxed mb-5" style={{ color: "#8D6E63", fontSize: "1.0625rem" }}>
                Distribuciones Oro Pan nació en 2012 de la mano de Carmen Díaz, maestra panadera
                con treinta años de oficio. Lo que empezó como un pequeño horno familiar en la
                localidad de Chapinero hoy surte a cientos de hogares bogotanos cada mañana.
              </p>
              <p className="leading-relaxed mb-8" style={{ color: "#8D6E63", fontSize: "1.0625rem" }}>
                Usamos harinas de origen colombiano, fermentación lenta y recetas sin conservantes
                para que cada pan llegue a tu mesa con el sabor de siempre: el de las manos
                que lo hicieron con cuidado.
              </p>

              {/* Valores */}
              <div className="space-y-4">
                {VALORES.map(v => (<div key={v.titulo} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(217,144,61,0.12)", color: "#D9903D" }}>
                      {v.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#3E2723" }}>{v.titulo}</p>
                      <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "#8D6E63" }}>{v.desc}</p>
                    </div>
                  </div>))}
              </div>
            </div>

            {/* Images mosaic */}
            <div className="grid grid-cols-2 gap-3 h-[500px]">
              <div className="rounded-2xl overflow-hidden row-span-2 bg-oro-light">
                <img src="https://images.unsplash.com/photo-1556711905-b3f402820b2a?w=400&h=600&fit=crop&auto=format" alt="Horno artesanal" className="w-full h-full object-cover"/>
              </div>
              <div className="rounded-2xl overflow-hidden bg-oro-light">
                <img src="https://images.unsplash.com/photo-1612197527762-8cfb4b68b0b1?w=400&h=280&fit=crop&auto=format" alt="Pan recién horneado" className="w-full h-full object-cover"/>
              </div>
              <div className="rounded-2xl overflow-hidden bg-oro-light">
                <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=280&fit=crop&auto=format" alt="Pan artesanal recién horneado" className="w-full h-full object-cover"/>
              </div>
            </div>
          </div>

          {/* Equipo */}
          <div className="mt-20">
            <h3 className="font-display font-bold text-center mb-10" style={{ fontSize: "1.75rem", color: "#3E2723" }}>
              Nuestro equipo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {EQUIPO.map(p => (<div key={p.nombre} className="rounded-2xl overflow-hidden group" style={{ background: "#fff", border: "1px solid #F0DFC8", boxShadow: "0 2px 12px rgba(62,39,35,0.06)" }}>
                  <div className="h-56 overflow-hidden" style={{ background: "#F0DFC8" }}>
                    <img src={`https://images.unsplash.com/${p.img}?w=400&h=320&fit=crop&auto=format&face`} alt={p.nombre} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"/>
                  </div>
                  <div className="p-5">
                    <p className="font-semibold" style={{ color: "#3E2723" }}>{p.nombre}</p>
                    <p className="text-xs font-semibold mt-0.5 mb-2" style={{ color: "#D9903D" }}>{p.rol}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "#8D6E63" }}>{p.bio}</p>
                  </div>
                </div>))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRODUCTOS ═══════════════════ */}
      <section id="productos" ref={setRef("productos")} className="py-24 px-5" style={{ background: "linear-gradient(180deg, #FFF3E0 0%, #FFF8EE 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12" style={{ background: "#D9903D" }}/>
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#D9903D" }}>Catálogo</span>
              <div className="h-px w-12" style={{ background: "#D9903D" }}/>
            </div>
            <h2 className="font-display font-bold leading-tight mb-4" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "#3E2723" }}>
              Recién salido del horno
            </h2>
            <p className="max-w-lg mx-auto leading-relaxed" style={{ color: "#8D6E63" }}>
              Elaboramos cada producto diariamente con ingredientes frescos. Haz tu pedido
              antes de las 6:00 PM y recíbelo al amanecer.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {destacados.map((p, i) => (<div key={p.id} className="group rounded-2xl overflow-hidden transition-all duration-300" style={{
                background: "#fff",
                border: "1px solid #F0DFC8",
                boxShadow: "0 2px 12px rgba(62,39,35,0.06)",
            }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(62,39,35,0.14)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(62,39,35,0.06)"; }}>
                <div className="relative overflow-hidden" style={{ height: "clamp(140px, 22vw, 200px)", background: "#F0DFC8" }}>
                  <img src={imagenDeProducto(p.nombre)} alt={p.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108" style={{ transform: "scale(1)", transition: "transform 0.5s ease" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}/>
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(62,39,35,0.65)", color: "#FFF8EE", backdropFilter: "blur(4px)" }}>
                    {p.categoria}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold leading-tight" style={{ color: "#3E2723" }}>{p.nombre}</p>
                    <span className="text-lg flex-shrink-0">{p.emoji}</span>
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "#8D6E63" }}>{p.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold" style={{ color: "#D9903D" }}>{formatCOP(p.precio)}</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map(s => (<Star key={s} size={9} style={{ color: "#D9903D", fill: "#D9903D" }}/>))}
                        <span className="text-[9px] ml-1" style={{ color: "#B8998C" }}>({20 + i * 7})</span>
                      </div>
                    </div>
                    <button onClick={onLogin} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" style={{ background: "#3E2723", color: "#FFF8EE" }} onMouseEnter={e => { e.currentTarget.style.background = "#D9903D"; }} onMouseLeave={e => { e.currentTarget.style.background = "#3E2723"; }}>
                      Pedir
                    </button>
                  </div>
                </div>
              </div>))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <button onClick={onLogin} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all" style={{ background: "#3E2723", color: "#FFF8EE" }} onMouseEnter={e => { e.currentTarget.style.background = "#D9903D"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={e => { e.currentTarget.style.background = "#3E2723"; e.currentTarget.style.transform = ""; }}>
              Ver catálogo completo <ArrowRight size={15}/>
            </button>
            <p className="text-xs mt-3" style={{ color: "#B8998C" }}>Crea tu cuenta gratis y haz tu primer pedido en minutos</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CONTACTO ═══════════════════ */}
      <section id="contacto" ref={setRef("contacto")} className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12" style={{ background: "#D9903D" }}/>
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#D9903D" }}>Contáctanos</span>
              <div className="h-px w-12" style={{ background: "#D9903D" }}/>
            </div>
            <h2 className="font-display font-bold leading-tight mb-3" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "#3E2723" }}>
              Estamos para servirte
            </h2>
            <p style={{ color: "#8D6E63" }}>Escríbenos, llámanos o visítanos. Con gusto te atendemos.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Info cards */}
            <div className="lg:col-span-2 space-y-4">
              {[
            { icon: <MapPin size={20}/>, titulo: "Dirección", lineas: ["Cl. 15a #10-26", "Soacha, Cundinamarca"] },
            { icon: <Phone size={20}/>, titulo: "Teléfono", lineas: ["+57 310 1176 1270"] },
            { icon: <Mail size={20}/>, titulo: "Correo", lineas: ["brayan@panify.com"] },
            { icon: <Clock size={20}/>, titulo: "Horario de atención", lineas: ["Lun–Sáb: 7:00 AM – 2:00 PM"] },
        ].map(item => (<div key={item.titulo} className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: "#fff", border: "1px solid #F0DFC8", boxShadow: "0 2px 12px rgba(62,39,35,0.05)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(217,144,61,0.12)", color: "#D9903D" }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#B8998C" }}>{item.titulo}</p>
                    {item.lineas.map(l => (<p key={l} className="text-sm font-medium" style={{ color: "#3E2723" }}>{l}</p>))}
                  </div>
                </div>))}

              {/* Redes */}
              <div className="flex items-center gap-3 pt-2">
                {[
            { icon: <Link2 size={18}/>, label: "@panify.co" },
            { icon: <Share2 size={18}/>, label: "Panify Oro Pan" },
        ].map(r => (<button key={r.label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all" style={{ background: "#fff", border: "1px solid #F0DFC8", color: "#8D6E63" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#D9903D"; e.currentTarget.style.color = "#D9903D"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#F0DFC8"; e.currentTarget.style.color = "#8D6E63"; }}>
                    {r.icon} {r.label}
                  </button>))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3 rounded-2xl p-7" style={{ background: "#fff", border: "1px solid #F0DFC8", boxShadow: "0 4px 24px rgba(62,39,35,0.07)" }}>
              <h3 className="font-display font-semibold text-lg mb-5" style={{ color: "#3E2723" }}>Envíanos un mensaje</h3>
              <ContactForm onLogin={onLogin}/>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer style={{ background: "#3E2723", color: "#FFF8EE" }}>
        {/* Main footer */}
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#D9903D" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 8C8 10 5.9 16.17 3.82 19.5c.7-1.3 1.18-3.5 1.5-5.5"/>
                  <path d="M17 8a5 5 0 1 0-8.66 5"/>
                  <path d="M12.67 12.5A5 5 0 0 1 8 10"/>
                </svg>
              </div>
              <span className="font-display italic text-xl font-bold" style={{ color: "#D9903D" }}>Panify</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,248,238,0.55)" }}>
              Distribuciones Oro Pan.<br />
              Fábrica de pan con entrega<br /> a domicilio en Soacha.
            </p>
            <p className="font-display italic mt-4 text-sm" style={{ color: "#D9903D" }}>
              "Horneamos Calidad,<br />Entregamos Confianza."
            </p>
          </div>

          {/* Navegación */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,248,238,0.35)" }}>Navegación</p>
            <ul className="space-y-2.5">
              {["Inicio", "Nosotros", "Productos", "Contacto"].map(l => (<li key={l}>
                  <button onClick={() => scrollTo(l.toLowerCase())} className="text-sm transition-colors text-left" style={{ color: "rgba(255,248,238,0.65)" }} onMouseEnter={e => { e.currentTarget.style.color = "#D9903D"; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,248,238,0.65)"; }}>
                    {l}
                  </button>
                </li>))}
            </ul>
          </div>

          {/* Productos */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,248,238,0.35)" }}>Productos</p>
            <ul className="space-y-2.5">
              {["Hojaldre", "Blandito", "Costeño", "Mogolla Negra", "Roscones", "Cañas y Lenguas"].map(l => (<li key={l}>
                  <button className="text-sm text-left transition-colors" style={{ color: "rgba(255,248,238,0.65)" }} onMouseEnter={e => { e.currentTarget.style.color = "#D9903D"; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,248,238,0.65)"; }} onClick={onLogin}>
                    {l}
                  </button>
                </li>))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,248,238,0.35)" }}>Contacto</p>
            <ul className="space-y-3">
              {[
            { icon: <MapPin size={13}/>, text: "Cl. 15a #10-26, Soacha, Cundinamarca" },
            { icon: <Phone size={13}/>, text: "+57 310 1176 1270" },
            { icon: <Mail size={13}/>, text: "brayan@panify.com" },
            { icon: <Clock size={13}/>, text: "Lun–Sáb 7:00 AM – 2:00 PM" },
        ].map(item => (<li key={item.text} className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0" style={{ color: "#D9903D" }}>{item.icon}</span>
                  <span className="text-xs" style={{ color: "rgba(255,248,238,0.6)" }}>{item.text}</span>
                </li>))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t px-5 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-xs" style={{ color: "rgba(255,248,238,0.35)" }}>
            © {new Date().getFullYear()} Distribuciones Oro Pan · Panify v2.4.1
          </p>
          <div className="flex items-center gap-4">
            {["Términos de uso", "Privacidad", "Cookies"].map(t => (<button key={t} className="text-xs transition-colors" style={{ color: "rgba(255,248,238,0.35)" }} onMouseEnter={e => { e.currentTarget.style.color = "#D9903D"; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,248,238,0.35)"; }}>
                {t}
              </button>))}
          </div>
        </div>
      </footer>
    </div>);
}
/* ─── Formulario de contacto ─────────────────────────────────────────────────── */
function ContactForm({ onLogin }) {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [asunto, setAsunto] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [sent, setSent] = useState(false);
    function handleSubmit(e) {
        e.preventDefault();
        setSent(true);
    }
    if (sent) {
        return (<div className="text-center py-10">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(46,125,50,0.12)" }}>
          <span className="text-2xl">✉️</span>
        </div>
        <h4 className="font-semibold mb-2" style={{ color: "#3E2723" }}>¡Mensaje enviado!</h4>
        <p className="text-sm mb-5" style={{ color: "#8D6E63" }}>Nos comunicaremos contigo en menos de 24 horas.</p>
        <button onClick={() => setSent(false)} className="text-sm font-medium" style={{ color: "#D9903D" }}>
          Enviar otro mensaje
        </button>
      </div>);
    }
    return (<form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#8D6E63" }}>Nombre</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" required className="w-full px-3.5 py-2.5 rounded-xl text-sm border transition-colors outline-none" style={{ background: "#FFF8EE", borderColor: "#F0DFC8", color: "#3E2723" }} onFocus={e => { e.target.style.borderColor = "#D9903D"; }} onBlur={e => { e.target.style.borderColor = "#F0DFC8"; }}/>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#8D6E63" }}>Correo electrónico</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required className="w-full px-3.5 py-2.5 rounded-xl text-sm border transition-colors outline-none" style={{ background: "#FFF8EE", borderColor: "#F0DFC8", color: "#3E2723" }} onFocus={e => { e.target.style.borderColor = "#D9903D"; }} onBlur={e => { e.target.style.borderColor = "#F0DFC8"; }}/>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#8D6E63" }}>Asunto</label>
        <input value={asunto} onChange={e => setAsunto(e.target.value)} placeholder="¿En qué podemos ayudarte?" required className="w-full px-3.5 py-2.5 rounded-xl text-sm border transition-colors outline-none" style={{ background: "#FFF8EE", borderColor: "#F0DFC8", color: "#3E2723" }} onFocus={e => { e.target.style.borderColor = "#D9903D"; }} onBlur={e => { e.target.style.borderColor = "#F0DFC8"; }}/>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#8D6E63" }}>Mensaje</label>
        <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} placeholder="Cuéntanos más…" required rows={4} className="w-full px-3.5 py-2.5 rounded-xl text-sm border transition-colors outline-none resize-none" style={{ background: "#FFF8EE", borderColor: "#F0DFC8", color: "#3E2723" }} onFocus={e => { e.target.style.borderColor = "#D9903D"; }} onBlur={e => { e.target.style.borderColor = "#F0DFC8"; }}/>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button type="submit" className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all" style={{ background: "#D9903D", color: "#fff" }} onMouseEnter={e => { e.currentTarget.style.background = "#C47E2E"; }} onMouseLeave={e => { e.currentTarget.style.background = "#D9903D"; }}>
          Enviar mensaje
        </button>
        <button type="button" onClick={onLogin} className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all" style={{ border: "1px solid #F0DFC8", color: "#8D6E63", background: "#FFF8EE" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#D9903D"; e.currentTarget.style.color = "#D9903D"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#F0DFC8"; e.currentTarget.style.color = "#8D6E63"; }}>
          Hacer un pedido
        </button>
      </div>
    </form>);
}
