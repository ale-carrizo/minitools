"use client";

import Link from "next/link";

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
function IconRecibos() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>;
}
function IconFacturador() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 9h6M9 13h6M9 17h3"/><path d="M15.5 15.5 17 17l2-2" stroke="#5448EE"/></svg>;
}
function IconReportes() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="20" y2="21"/><rect x="6" y="12" width="3" height="7"/><rect x="13" y="7" width="3" height="12"/><rect x="17.5" y="3" width="3" height="16"/></svg>;
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
  "Empezá con 1 app","Sumá otra cuando te sirva","Sin implementar todo","Módulos independientes",
  "Para cobrar","Para vender","Para ordenar turnos","Para sueldos","Para seguimiento",
];

const categories = ["Todos","Finanzas","Operaciones","Productividad","Comercio"];

const tools = [
  { id: "presupuestos", Icon: IconPresupuestos, name: "Presupuestos", desc: "Creá cotizaciones profesionales y haceles seguimiento de estado.", category: "Finanzas" },
  { id: "caja", Icon: IconCobranzas, name: "Registro de Pagos", desc: "Registrá ingresos y egresos. Lectura de comprobantes por IA.", category: "Finanzas" },
  { id: "precios", Icon: IconCalculadora, name: "Calculadora de Precios", desc: "Calculá precio de venta desde costo, IVA, margen y punto de equilibrio.", category: "Finanzas" },
  { id: "sueldos", Icon: IconSueldos, name: "Recibo de Sueldo", desc: "Generá recibos de sueldo PDF para empleados y monotributistas.", category: "Finanzas" },
  { id: "turnos", Icon: IconAgenda, name: "Gestión de Turnos", desc: "Sistema de turnos online con recordatorios automáticos.", category: "Productividad" },
  { id: "garantias", Icon: IconGarantia, name: "Garantías", desc: "Seguimiento de garantías con alertas de vencimiento e historial.", category: "Operaciones" },
  { id: "socios", Icon: IconCRM, name: "Gestión de Clientes", desc: "Cobranza recurrente, recordatorios y seguimiento de clientes.", category: "Comercio" },
  { id: "tareas", Icon: IconProyectos, name: "Tareas / Kanban", desc: "Organizá tareas en tableros kanban con hasta 8 columnas.", category: "Productividad" },
  { id: "recibos", Icon: IconRecibos, name: "Recibos", desc: "Generá comprobantes de cobro en PDF para tus clientes.", category: "Finanzas" },
  { id: "libreta", Icon: IconStock, name: "Registro de Ventas y Stock", desc: "Caja diaria simple con carga rápida de ventas y control de stock.", category: "Operaciones" },
  { id: "facturador", Icon: IconFacturador, name: "Facturador", desc: "Facturas electrónicas con CAE de ARCA, directo desde tu cuenta.", category: "Finanzas" },
  { id: "reportes", Icon: IconReportes, name: "Reportes", desc: "Ventas, presupuestos, clientes y tareas en un solo vistazo.", category: "Productividad" },
];

const oneToolFeatures = ["Elegí 1 herramienta", "Actualizaciones incluidas", "Soporte por email", "Cancelá cuando quieras"];
const starterFeatures = ["Elegí hasta 3 herramientas", "Cambiá herramientas cuando lo necesites", "Actualizaciones incluidas", "Soporte por email"];
const proFeatures = ["Elegí hasta 6 herramientas", "Cambiá herramientas cuando lo necesites", "Actualizaciones incluidas", "Soporte prioritario"];
const fullFeatures = ["Acceso a las 12 herramientas", "Nuevas herramientas incluidas automáticamente", "Actualizaciones incluidas", "Soporte prioritario", "Sin límites de herramientas"];

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
        <a href="https://app.zimple.tools/login" className="btn-brand text-white text-[13px] font-semibold px-4 py-[7px] rounded-[8px]">
          Ingresar
        </a>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="relative min-h-screen bg-[#0C0B1A] flex flex-col items-center justify-center overflow-hidden pb-24">
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
            <span className="text-white/70 text-[12.5px] font-medium">Software de gestión para kioscos, talleres, comercios y profesionales independientes</span>
          </div>

          <h1 className="font-display text-5xl sm:text-[70px] lg:text-[82px] font-semibold leading-[1.04] tracking-[-0.045em] mb-5">
            <span className="text-white block">Empezá con la herramienta</span>
            <span className="text-gradient block">de gestión que necesitás hoy</span>
          </h1>
          <p className="text-white/45 text-[17px] leading-relaxed mb-8 max-w-[420px] mx-auto">
            Stock, presupuestos, caja, turnos, sueldos y clientes: elegís la app que resuelve tu problema de hoy y sumás otras solo si te sirven.
          </p>

          <div className="flex items-center justify-center gap-3 mb-3">
            <a href="https://app.zimple.tools/login" className="btn-brand text-white font-semibold text-[15px] px-6 py-3 rounded-xl">
              Empezar con 1 app
            </a>
            <button className="group text-white font-medium text-[15px] px-6 py-3 rounded-xl border border-white/25 hover:border-white/50 hover:bg-white/[0.06] transition-all duration-200">
              Ver qué app me conviene
              <span className="inline-block ml-1.5 transition-transform duration-200 group-hover:translate-y-0.5">↓</span>
            </button>
          </div>
          <p className="text-white/30 text-[13px] mb-10">
            Sin tarjeta · sin implementar un sistema gigante · cancelá cuando quieras
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

        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-[2]"
          style={{ background: "linear-gradient(to bottom, transparent, #F6F6FB)" }} />
      </section>

      {/* ── TOOLS GRID ─────────────────────────────── */}
      <section className="bg-[#F6F6FB] pt-16 pb-24 px-6">
        <div className="text-center mb-10">
          <p className="text-[#5448EE] text-[11px] font-semibold tracking-[0.12em] uppercase mb-3">APPS QUE PODÉS ACTIVAR SEGÚN TU NECESIDAD</p>
          <h2 className="text-[36px] sm:text-[42px] font-semibold text-[#1a1a2e] tracking-[-0.03em] mb-3">
            No necesitás usar todo
          </h2>
          <p className="text-[#1a1a2e]/50 text-[16px] max-w-md mx-auto leading-relaxed">
            Podés arrancar con una sola app para cobrar, vender, organizar turnos o emitir documentos. Si después necesitás más, las sumás.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-3xl border border-[#D8D5FF] bg-white px-6 py-5 mb-10 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: "1", title: "Elegí un problema", desc: "Pensá qué querés resolver primero: cobrar, presupuestar, turnos, sueldos o seguimiento." },
              { step: "2", title: "Usá una app", desc: "Cada app funciona sola. No hace falta configurar una suite completa para empezar." },
              { step: "3", title: "Sumá después", desc: "Cuando tu negocio lo pida, activás otra app y mantenés el mismo entorno de trabajo." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-[#ECEAFB] bg-[#FAFAFF] p-4 text-left">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#5448EE]/10 text-[12px] font-bold text-[#5448EE]">
                  {item.step}
                </span>
                <h3 className="mt-3 text-[15px] font-semibold text-[#1a1a2e]">{item.title}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-[#1a1a2e]/55">{item.desc}</p>
              </div>
            ))}
          </div>
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
            <span className="text-[11px] text-[#1a1a2e]/40">Se puede usar sola</span>
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
            Elegí cuántas herramientas necesitás
          </h2>
          <p className="text-[#1a1a2e]/50 text-[16px] max-w-sm mx-auto leading-relaxed">
            Entrás a Zimple para resolver una necesidad puntual y después decidís si querés ampliar tu stack.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Una herramienta */}
          <div className="border border-[#E4E3F2] rounded-2xl p-7 flex flex-col">
            <p className="text-[#1a1a2e]/35 text-[11px] font-semibold tracking-[0.1em] uppercase mb-5">UNA HERRAMIENTA</p>
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className="text-[40px] font-semibold text-[#1a1a2e] leading-none tracking-[-0.03em]">3,99 USD</span>
            </div>
            <p className="text-[#1a1a2e]/40 text-[13px] mb-2">por mes</p>
            <p className="text-[#1a1a2e] text-[15px] font-bold mb-1">Para un caso puntual.</p>
            <p className="text-[#1a1a2e]/50 text-[13px] leading-relaxed mb-5 min-h-[36px]">Si solo necesitás cubrir una tarea específica.</p>
            <ul className="space-y-2.5 mb-6">
              {oneToolFeatures.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#1a1a2e]/70">
                  <span className="w-4 h-4 rounded-full bg-[#5448EE]/10 flex items-center justify-center flex-shrink-0">
                    <IconCheck />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <a href="https://app.zimple.tools/login" className="mt-auto block w-full py-3 rounded-xl border border-[#E4E3F2] text-[#1a1a2e] font-semibold text-[13.5px] text-center hover:border-[#5448EE] hover:text-[#5448EE] transition-all duration-150">
              Elegir opción puntual
            </a>
          </div>

          {/* Starter */}
          <div className="border border-[#E4E3F2] rounded-2xl p-7 flex flex-col">
            <p className="text-[#1a1a2e]/35 text-[11px] font-semibold tracking-[0.1em] uppercase mb-5">STARTER</p>
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className="text-[40px] font-semibold text-[#1a1a2e] leading-none tracking-[-0.03em]">7,99 USD</span>
            </div>
            <p className="text-[#1a1a2e]/40 text-[13px] mb-2">por mes</p>
            <span className="inline-flex w-fit items-center bg-[#5448EE]/10 text-[#5448EE] text-[11px] font-bold px-2.5 py-1 rounded-full mb-3">Ahorrás 33%</span>
            <p className="text-[#1a1a2e] text-[15px] font-bold mb-1">Hasta 3 herramientas</p>
            <p className="text-[#1a1a2e]/50 text-[13px] leading-relaxed mb-5 min-h-[36px]">Lo esencial para empezar a ordenar tu negocio.</p>
            <ul className="space-y-2.5 mb-6">
              {starterFeatures.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#1a1a2e]/70">
                  <span className="w-4 h-4 rounded-full bg-[#5448EE]/10 flex items-center justify-center flex-shrink-0">
                    <IconCheck />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <a href="https://app.zimple.tools/login" className="mt-auto block w-full py-3 rounded-xl border border-[#E4E3F2] text-[#1a1a2e] font-semibold text-[13.5px] text-center hover:border-[#5448EE] hover:text-[#5448EE] transition-all duration-150">
              Elegir Starter
            </a>
          </div>

          {/* Pro */}
          <div className="border-2 border-[#5448EE] rounded-2xl p-7 relative flex flex-col">
            <div className="absolute -top-[14px] left-1/2 -translate-x-1/2">
              <span className="bg-[#5448EE] text-white text-[11px] font-semibold tracking-wider px-4 py-1.5 rounded-full whitespace-nowrap">
                MÁS POPULAR
              </span>
            </div>
            <p className="text-[#1a1a2e]/35 text-[11px] font-semibold tracking-[0.1em] uppercase mb-5">PRO</p>
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className="text-[40px] font-semibold text-[#1a1a2e] leading-none tracking-[-0.03em]">14,99 USD</span>
            </div>
            <p className="text-[#1a1a2e]/40 text-[13px] mb-2">por mes</p>
            <span className="inline-flex w-fit items-center bg-[#5448EE]/10 text-[#5448EE] text-[11px] font-bold px-2.5 py-1 rounded-full mb-3">Ahorrás 37%</span>
            <p className="text-[#1a1a2e] text-[15px] font-bold mb-1">Hasta 6 herramientas</p>
            <p className="text-[#1a1a2e]/50 text-[13px] leading-relaxed mb-5 min-h-[36px]">Más herramientas para más tareas del día a día.</p>
            <ul className="space-y-2.5 mb-6">
              {proFeatures.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#1a1a2e]/70">
                  <span className="w-4 h-4 rounded-full bg-[#5448EE]/10 flex items-center justify-center flex-shrink-0">
                    <IconCheck />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <a href="https://app.zimple.tools/login" className="mt-auto block w-full py-3 rounded-xl bg-[#5448EE] hover:bg-[#4035d4] text-white font-semibold text-[13.5px] text-center transition-colors duration-150">
              Elegir Pro
            </a>
          </div>

          {/* Full */}
          <div className="border border-[#E4E3F2] rounded-2xl p-7 flex flex-col">
            <p className="text-[#1a1a2e]/35 text-[11px] font-semibold tracking-[0.1em] uppercase mb-5">FULL</p>
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className="text-[40px] font-semibold text-[#1a1a2e] leading-none tracking-[-0.03em]">19,99 USD</span>
            </div>
            <p className="text-[#1a1a2e]/40 text-[13px] mb-2">por mes</p>
            <span className="inline-flex w-fit items-center bg-[#5448EE]/10 text-[#5448EE] text-[11px] font-bold px-2.5 py-1 rounded-full mb-3">Ahorrás 44%</span>
            <p className="text-[#1a1a2e] text-[15px] font-bold mb-1">Todas las herramientas</p>
            <p className="text-[#1a1a2e]/50 text-[13px] leading-relaxed mb-5 min-h-[36px]">Toda la caja Zimple, hoy y mañana.</p>
            <ul className="space-y-2.5 mb-4">
              {fullFeatures.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#1a1a2e]/70">
                  <span className="w-4 h-4 rounded-full bg-[#5448EE]/10 flex items-center justify-center flex-shrink-0">
                    <IconCheck />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <p className="bg-[#5448EE]/10 text-[#1a1a2e]/70 text-[12px] font-semibold leading-relaxed rounded-xl px-3.5 py-3 mb-5">
              Incluye las nuevas herramientas que vayamos incorporando.
            </p>
            <a href="https://app.zimple.tools/login" className="mt-auto block w-full py-3 rounded-xl border border-[#E4E3F2] text-[#1a1a2e] font-semibold text-[13.5px] text-center hover:border-[#5448EE] hover:text-[#5448EE] transition-all duration-150">
              Elegir Full
            </a>
          </div>
        </div>
        <p className="text-center text-[#1a1a2e]/45 text-[13.5px] mt-8">Podés cambiar de plan cuando quieras.</p>
      </section>

      {/* ── CTA SECTION ────────────────────────────── */}
      <section className="py-20 px-6 text-center" style={{ background: "linear-gradient(135deg, #5448EE 0%, #8880F5 100%)" }}>
          <h2 className="text-[36px] sm:text-[46px] font-semibold text-white tracking-[-0.03em] mb-3">
            Arrancá simple. Crecé cuando quieras.
          </h2>
          <p className="text-white/65 text-[16px] mb-9">
            Empezá con una sola app, validá si te sirve y sumá otras más adelante sin fricción.
          </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a href="https://app.zimple.tools/login" className="bg-white text-[#5448EE] font-semibold text-[15px] px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-colors duration-150">
            Crear cuenta gratis
          </a>
          <button className="text-white font-semibold text-[15px] px-7 py-3.5 rounded-xl border border-white/30 hover:bg-white/10 transition-colors duration-150">
            Ver demo
          </button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="bg-[#0C0B1A] py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-5 text-center">
            <p className="text-white/50 text-[13px] leading-relaxed">
              Empezá con una sola app. Sumá otras solo cuando tu negocio realmente las necesite.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[5px] flex items-center justify-center flex-shrink-0">
              <ZimpleIcon size={24} />
            </div>
            <span className="font-display text-white font-semibold text-[15px] tracking-[-0.025em]">Zimple Tools</span>
          </div>
          <div className="flex items-center gap-6 text-white/40 text-[13px]">
            <Link href="/privacidad" className="hover:text-white/70 transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-white/70 transition-colors">Términos</Link>
            <a href="mailto:[EMAIL LEGAL / SOPORTE]" className="hover:text-white/70 transition-colors">Contacto</a>
          </div>
          <p className="text-white/30 text-[13px]">© 2026 Zimple Tools. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
