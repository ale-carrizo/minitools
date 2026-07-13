"use client";

import { useEffect, useRef, useState } from "react";
import ParticleField from "./components/ParticleField";

// Inline SVG icons — lucide-style line art
function IconPresupuestos() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
}
function IconStock() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
}
function IconProyectos() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function IconCobranzas() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
}
function IconSueldos() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IconCRM() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IconAgenda() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IconCalculadora() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><circle cx="8" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="17" r="1"/><circle cx="12" cy="17" r="1"/><circle cx="16" cy="17" r="1"/></svg>;
}
function IconGarantia() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function IconCheck() {
  return <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="#5448EE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function ZimpleIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="zimpleGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6E63FF" />
          <stop offset="50%" stopColor="#3B6BFF" />
          <stop offset="100%" stopColor="#00BFE6" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill="url(#zimpleGradient)" />
      <polyline
        points="25,30 75,30 28,70 75,70"
        fill="none"
        stroke="white"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const chipColors = ["#3B82F6","#14B8A6","#22C55E","#F59E0B","#EC4899","#8B5CF6","#3B82F6","#14B8A6","#22C55E"];

const chips = [
  "Control de Stock","Presupuestos","Caja + Pagos","Calculadora de Precios",
  "Recibo de Sueldo","Gestión de Turnos","Garantías","Clientes y Pagos","Tareas / Kanban",
];

const categories = ["Todos","Finanzas","Operaciones","Productividad","Comercio"];

const tools = [
  { id: "stock", Icon: IconStock, name: "Control de Stock", desc: "Controlá el stock en tiempo real. Alertas de bajo inventario.", category: "Operaciones" },
  { id: "presupuestos", Icon: IconPresupuestos, name: "Presupuestos", desc: "Creá cotizaciones profesionales y haceles seguimiento de estado.", category: "Finanzas" },
  { id: "caja", Icon: IconCobranzas, name: "Caja + Pagos", desc: "Registrá ingresos y egresos. Lectura de comprobantes por IA.", category: "Finanzas" },
  { id: "precios", Icon: IconCalculadora, name: "Calculadora de Precios", desc: "Calculá precio de venta desde costo, IVA, margen y punto de equilibrio.", category: "Finanzas" },
  { id: "sueldos", Icon: IconSueldos, name: "Recibo de Sueldo", desc: "Generá recibos de sueldo PDF para empleados y monotributistas.", category: "Finanzas" },
  { id: "turnos", Icon: IconAgenda, name: "Gestión de Turnos", desc: "Sistema de turnos online con recordatorios automáticos.", category: "Productividad" },
  { id: "garantias", Icon: IconGarantia, name: "Garantías", desc: "Seguimiento de garantías con alertas de vencimiento e historial.", category: "Operaciones" },
  { id: "socios", Icon: IconCRM, name: "Clientes y Pagos", desc: "Cobranza recurrente, recordatorios y seguimiento de clientes.", category: "Comercio" },
  { id: "tareas", Icon: IconProyectos, name: "Tareas / Kanban", desc: "Organizá tareas en tableros kanban con hasta 8 columnas.", category: "Productividad" },
];

const monthlyFeatures = ["Acceso a las 9 herramientas","Actualizaciones automáticas","Soporte por email","Cancelá en cualquier momento"];
const annualFeatures = ["Todo lo del plan Mensual","Soporte prioritario 24/7","Acceso anticipado a nuevas tools","Ahorrás pagando anual"];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [cardsVisible, setCardsVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredTools = activeCategory === "Todos" ? tools : tools.filter(t => t.category === activeCategory);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCardsVisible(true); },
      { threshold: 0.05 }
    );
    if (gridRef.current) observer.observe(gridRef.current);
    return () => { window.removeEventListener("scroll", handleScroll); observer.disconnect(); };
  }, []);

  return (
    <main>
      {/* ── NAVBAR ─────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-between px-6 transition-all duration-300 ${
        scrolled ? "bg-[#0C0B1A]/90 backdrop-blur-md border-b border-white/[0.06]" : "bg-white/[0.06]"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0 shadow-[0_4px_14px_-3px_rgba(84,72,238,0.7)]">
            <ZimpleIcon size={28} />
          </div>
          <span className="font-display text-white font-semibold text-[16px] tracking-[-0.03em]">Zimple Tools</span>
        </div>
        <a href="https://app.zimple.tools/register" className="btn-brand text-white text-[13px] font-semibold px-4 py-[7px] rounded-[8px]">
          Empezar gratis
        </a>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="relative min-h-screen bg-[#0C0B1A] flex flex-col items-center justify-center overflow-hidden">
        {/* Aurora mesh + central glow + particles */}
        <div className="aurora" />
        <ParticleField className="z-[1] opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
          <div className="animate-pulse-glow" style={{
            width: "860px", height: "500px", borderRadius: "50%",
            background: "radial-gradient(ellipse at center, #5448EE 0%, #8880F5 30%, transparent 70%)",
            filter: "blur(2px)",
          }} />
        </div>

        <div className="relative z-10 text-center px-6 animate-fade-up">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.10] backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#8880F5] opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8880F5]" />
            </span>
            <span className="text-white/70 text-[12.5px] font-medium">9 herramientas · una sola suscripción</span>
          </div>

          <h1 className="font-display text-5xl sm:text-[70px] lg:text-[82px] font-semibold leading-[1.04] tracking-[-0.045em] mb-5">
            <span className="text-white block">Todas las herramientas</span>
            <span className="text-gradient block">en una sola suscripción</span>
          </h1>
          <p className="text-white/45 text-[17px] leading-relaxed mb-8 max-w-[360px] mx-auto">
            Una suscripción. Acceso ilimitado. Sin complicaciones.
          </p>

          <div className="flex items-center justify-center gap-3 mb-3">
            <a href="https://app.zimple.tools/register" className="btn-brand text-white font-semibold text-[15px] px-6 py-3 rounded-xl">
              Empezar gratis — 14 días
            </a>
            <button className="group text-white font-medium text-[15px] px-6 py-3 rounded-xl border border-white/25 hover:border-white/50 hover:bg-white/[0.06] transition-all duration-200">
              Ver herramientas
              <span className="inline-block ml-1.5 transition-transform duration-200 group-hover:translate-y-0.5">↓</span>
            </button>
          </div>
          <p className="text-white/30 text-[13px] mb-10">
            No requiere tarjeta de crédito · Cancelá cuando quieras
          </p>

          {/* Module chips with colored dots */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {chips.map((chip, i) => (
              <span
                key={chip}
                style={{ animationDelay: `${0.4 + i * 0.04}s` }}
                className="flex items-center gap-2 text-white/60 text-[13px] px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] hover:text-white hover:-translate-y-0.5 cursor-pointer transition-all duration-200 select-none whitespace-nowrap animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: chipColors[i] }} />
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-[2]"
          style={{ background: "linear-gradient(to bottom, transparent, #F6F6FB)" }} />
      </section>

      {/* ── TOOLS GRID ─────────────────────────────── */}
      <section className="bg-[#F6F6FB] pt-16 pb-24 px-6">
        <div className="text-center mb-10">
          <p className="text-[#5448EE] text-[11px] font-semibold tracking-[0.12em] uppercase mb-3">9 HERRAMIENTAS INCLUIDAS</p>
          <h2 className="text-[36px] sm:text-[42px] font-semibold text-[#1a1a2e] tracking-[-0.03em] mb-3">
            Todo lo que necesita tu negocio
          </h2>
          <p className="text-[#1a1a2e]/50 text-[16px] max-w-md mx-auto leading-relaxed">
            Cada herramienta está lista para usar desde el primer día. Sin configuraciones complejas.
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[13.5px] font-medium transition-all duration-150 ${
                activeCategory === cat
                  ? "bg-[#5448EE] text-white shadow-sm"
                  : "bg-white border border-[#E4E3F2] text-[#1a1a2e]/65 hover:border-[#C4C3E0] hover:text-[#1a1a2e]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div ref={gridRef} className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {filteredTools.map((tool, i) => (
            <div
              key={tool.id}
              className="bg-white border border-[#E4E3F2] rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-[#C4C3E0] cursor-pointer group flex flex-col"
              style={{
                opacity: cardsVisible ? 1 : 0,
                transform: cardsVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.35s ease, transform 0.35s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                transitionDelay: cardsVisible ? `${i * 50}ms` : "0ms",
              }}
            >
              <div className="icon-pop w-11 h-11 rounded-xl flex items-center justify-center mb-4 flex-shrink-0 transition-shadow duration-300 group-hover:shadow-[0_8px_20px_-6px_rgba(84,72,238,0.5)]"
                style={{ background: "linear-gradient(135deg, #EEF0FF, #E0E2FF)", color: "#5448EE" }}>
                <tool.Icon />
              </div>
              <h3 className="text-[#1a1a2e] font-semibold text-[14px] leading-snug mb-2 group-hover:text-[#5448EE] transition-colors">{tool.name}</h3>
              <p className="text-[#1a1a2e]/45 text-[12px] leading-relaxed flex-1 mb-4">{tool.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#5448EE] bg-[#5448EE]/10 px-2.5 py-1 rounded-full">
                  {tool.category}
                </span>
                <span className="text-[11px] text-[#1a1a2e]/40 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Incluido
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────── */}
      <section className="bg-white py-24 px-6">
        <div className="text-center mb-14">
          <p className="text-[#5448EE] text-[11px] font-semibold tracking-[0.12em] uppercase mb-3">PRECIOS</p>
          <h2 className="text-[36px] sm:text-[42px] font-semibold text-[#1a1a2e] tracking-[-0.03em] mb-3">
            Simple y transparente
          </h2>
          <p className="text-[#1a1a2e]/50 text-[16px] max-w-sm mx-auto leading-relaxed">
            Elegí el plan que mejor se adapte. Todas las herramientas incluidas en ambos.
          </p>
        </div>

        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Mensual */}
          <div className="border border-[#E4E3F2] rounded-2xl p-7">
            <p className="text-[#1a1a2e]/35 text-[11px] font-semibold tracking-[0.1em] uppercase mb-5">MENSUAL</p>
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className="text-[54px] font-semibold text-[#1a1a2e] leading-none tracking-[-0.03em]">--</span>
            </div>
            <p className="text-[#1a1a2e]/40 text-[13px] mb-7">por mes · facturado mensualmente</p>
            <ul className="space-y-3 mb-8">
              {monthlyFeatures.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-[13.5px] text-[#1a1a2e]/70">
                  <span className="w-4 h-4 rounded-full bg-[#5448EE]/10 flex items-center justify-center flex-shrink-0">
                    <IconCheck />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <a href="https://app.zimple.tools/register" className="block w-full py-3 rounded-xl border border-[#E4E3F2] text-[#1a1a2e] font-semibold text-[14px] text-center hover:border-[#5448EE] hover:text-[#5448EE] transition-all duration-150">
              Empezar con Mensual
            </a>
          </div>

          {/* Anual */}
          <div className="border-2 border-[#5448EE] rounded-2xl p-7 relative">
            <div className="absolute -top-[14px] left-1/2 -translate-x-1/2">
              <span className="bg-[#5448EE] text-white text-[11px] font-semibold tracking-wider px-4 py-1.5 rounded-full whitespace-nowrap">
                MÁS POPULAR
              </span>
            </div>
            <p className="text-[#1a1a2e]/35 text-[11px] font-semibold tracking-[0.1em] uppercase mb-5">ANUAL</p>
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className="text-[54px] font-semibold text-[#1a1a2e] leading-none tracking-[-0.03em]">--</span>
            </div>
            <p className="text-[#1a1a2e]/40 text-[13px] mb-7">por mes · facturado anual</p>
            <ul className="space-y-3 mb-8">
              {annualFeatures.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-[13.5px] text-[#1a1a2e]/70">
                  <span className="w-4 h-4 rounded-full bg-[#5448EE]/10 flex items-center justify-center flex-shrink-0">
                    <IconCheck />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <a href="https://app.zimple.tools/register" className="block w-full py-3 rounded-xl bg-[#5448EE] hover:bg-[#4035d4] text-white font-semibold text-[14px] text-center transition-colors duration-150">
              Empezar con Anual
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ────────────────────────────── */}
      <section className="py-20 px-6 text-center" style={{ background: "linear-gradient(135deg, #5448EE 0%, #8880F5 100%)" }}>
        <h2 className="text-[36px] sm:text-[46px] font-semibold text-white tracking-[-0.03em] mb-3">
          Empezá hoy. 14 días gratis.
        </h2>
        <p className="text-white/65 text-[16px] mb-9">
          Sin tarjeta de crédito. Sin compromisos. Cancelá cuando quieras.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a href="https://app.zimple.tools/register" className="bg-white text-[#5448EE] font-semibold text-[15px] px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-colors duration-150">
            Crear cuenta gratis
          </a>
          <button className="text-white font-semibold text-[15px] px-7 py-3.5 rounded-xl border border-white/30 hover:bg-white/10 transition-colors duration-150">
            Ver demo
          </button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="bg-[#0C0B1A] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[5px] flex items-center justify-center flex-shrink-0">
              <ZimpleIcon size={24} />
            </div>
            <span className="font-display text-white font-semibold text-[15px] tracking-[-0.025em]">Zimple Tools</span>
          </div>
          <div className="flex items-center gap-6 text-white/40 text-[13px]">
            <a href="#" className="hover:text-white/70 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white/70 transition-colors">Términos</a>
            <a href="#" className="hover:text-white/70 transition-colors">Contacto</a>
          </div>
          <p className="text-white/30 text-[13px]">© 2026 Zimple Tools. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
