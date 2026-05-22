"use client";

import { useEffect, useRef, useState } from "react";

// Inline SVG icons — lucide-style line art
function IconFacturacion() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
function IconPresupuestos() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
}
function IconGastos() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;
}
function IconCobranzas() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
}
function IconStock() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
}
function IconProyectos() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function IconReportes() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
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
function IconDocumentos() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>;
}
function IconTienda() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
}
function IconCheck() {
  return <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="#5448EE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

const chipColors = ["#3B82F6","#14B8A6","#22C55E","#F59E0B","#EC4899","#8B5CF6","#3B82F6","#14B8A6","#22C55E","#F59E0B","#EC4899","#3B82F6"];

const chips = [
  "Facturación","Presupuestos","Control de Gastos","Cobranzas",
  "Stock e Inventario","Proyectos","Reportes","Sueldos & RRHH",
  "CRM de Clientes","Agenda & Turnos","Documentos","Tienda Online",
];

const categories = ["Todos","Finanzas","Operaciones","RRHH","Productividad","Comercio"];

const tools = [
  { id: "facturacion", Icon: IconFacturacion, name: "Facturación", desc: "Emití facturas y tickets en segundos. Listo para integrarse con AFIP.", category: "Finanzas" },
  { id: "presupuestos", Icon: IconPresupuestos, name: "Presupuestos", desc: "Creá cotizaciones profesionales y haceles seguimiento de estado.", category: "Finanzas" },
  { id: "gastos", Icon: IconGastos, name: "Control de Gastos", desc: "Registrá y categorizá los gastos de tu negocio en un solo lugar.", category: "Finanzas" },
  { id: "cobranzas", Icon: IconCobranzas, name: "Cobranzas", desc: "Recordatorios automáticos y seguimiento de pagos pendientes.", category: "Finanzas" },
  { id: "stock", Icon: IconStock, name: "Stock e Inventario", desc: "Controlá el stock en tiempo real. Alertas de bajo inventario.", category: "Operaciones" },
  { id: "proyectos", Icon: IconProyectos, name: "Proyectos", desc: "Organizá tareas y equipos. Tableros kanban y seguimiento de progreso.", category: "Productividad" },
  { id: "reportes", Icon: IconReportes, name: "Reportes", desc: "Dashboards y reportes automáticos para tomar mejores decisiones.", category: "Operaciones" },
  { id: "sueldos", Icon: IconSueldos, name: "Sueldos & RRHH", desc: "Liquidá sueldos y gestioná tu equipo en un solo lugar.", category: "RRHH" },
  { id: "crm", Icon: IconCRM, name: "CRM de Clientes", desc: "Registrá contactos, historial y seguimiento de oportunidades.", category: "Comercio" },
  { id: "agenda", Icon: IconAgenda, name: "Agenda & Turnos", desc: "Sistema de turnos online con recordatorios automáticos.", category: "Productividad" },
  { id: "documentos", Icon: IconDocumentos, name: "Documentos", desc: "Creá, firmá y almacená documentos importantes de tu empresa.", category: "Productividad" },
  { id: "tienda", Icon: IconTienda, name: "Tienda Online", desc: "Tu catálogo online con pagos integrados y gestión de pedidos.", category: "Comercio" },
];

const monthlyFeatures = ["Acceso a las 12 herramientas","Actualizaciones automáticas","Soporte por email","Cancelá en cualquier momento"];
const annualFeatures = ["Todo lo del plan Mensual","Soporte prioritario 24/7","Acceso anticipado a nuevas tools","Ahorrás $48 al año"];

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
          <div className="w-7 h-7 rounded-[6px] bg-[#5448EE] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1.2" fill="white" />
              <rect x="8" y="1.5" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.5" />
              <rect x="1.5" y="8" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.5" />
              <rect x="8" y="8" width="4.5" height="4.5" rx="1.2" fill="white" />
            </svg>
          </div>
          <span className="text-white font-semibold text-[15px] tracking-[-0.03em]">MiniTools</span>
        </div>
        <button className="bg-[#5448EE] hover:bg-[#4035d4] text-white text-[13px] font-semibold px-4 py-[7px] rounded-[8px] transition-colors duration-150">
          Empezar gratis
        </button>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="relative min-h-screen bg-[#0C0B1A] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-pulse-glow" style={{
            width: "860px", height: "500px", borderRadius: "50%",
            background: "radial-gradient(ellipse at center, #5448EE 0%, #8880F5 30%, transparent 70%)",
            filter: "blur(2px)",
          }} />
        </div>

        <div className="relative z-10 text-center px-6 animate-fade-up">
          <h1 className="text-5xl sm:text-[70px] lg:text-[80px] font-semibold leading-[1.05] tracking-[-0.04em] mb-5">
            <span className="text-white block">Todas las herramientas</span>
            <span className="block" style={{ color: "#8880F5" }}>en una sola suscripción</span>
          </h1>
          <p className="text-white/40 text-[17px] leading-relaxed mb-8 max-w-[340px] mx-auto">
            Una suscripción. Acceso ilimitado. Sin complicaciones.
          </p>

          <div className="flex items-center justify-center gap-3 mb-3">
            <button className="bg-[#5448EE] hover:bg-[#4035d4] text-white font-semibold text-[15px] px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-[0_4px_30px_rgba(84,72,238,0.5)]">
              Empezar gratis — 14 días
            </button>
            <button className="text-white font-medium text-[15px] px-6 py-3 rounded-xl border border-white/25 hover:border-white/50 hover:bg-white/[0.06] transition-all duration-200">
              Ver herramientas
            </button>
          </div>
          <p className="text-white/30 text-[13px] mb-10">
            No requiere tarjeta de crédito · Cancelá cuando quieras
          </p>

          {/* Module chips with colored dots */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {chips.map((chip, i) => (
              <span key={chip} className="flex items-center gap-2 text-white/60 text-[13px] px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.13] hover:text-white/80 cursor-pointer transition-all duration-150 select-none whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: chipColors[i] }} />
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #F6F6FB)" }} />
      </section>

      {/* ── TOOLS GRID ─────────────────────────────── */}
      <section className="bg-[#F6F6FB] pt-16 pb-24 px-6">
        <div className="text-center mb-10">
          <p className="text-[#5448EE] text-[11px] font-semibold tracking-[0.12em] uppercase mb-3">12 HERRAMIENTAS INCLUIDAS</p>
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
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 flex-shrink-0">
                <tool.Icon />
              </div>
              <h3 className="text-[#1a1a2e] font-semibold text-[13.5px] leading-snug mb-2">{tool.name}</h3>
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
              <span className="text-[20px] font-semibold text-[#1a1a2e] self-start mt-2">$</span>
              <span className="text-[54px] font-semibold text-[#1a1a2e] leading-none tracking-[-0.03em]">12</span>
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
            <button className="w-full py-3 rounded-xl border border-[#E4E3F2] text-[#1a1a2e] font-semibold text-[14px] hover:border-[#5448EE] hover:text-[#5448EE] transition-all duration-150">
              Empezar con Mensual
            </button>
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
              <span className="text-[20px] font-semibold text-[#1a1a2e] self-start mt-2">$</span>
              <span className="text-[54px] font-semibold text-[#1a1a2e] leading-none tracking-[-0.03em]">8</span>
              <span className="ml-2 self-center text-[12px] font-semibold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">-33%</span>
            </div>
            <p className="text-[#1a1a2e]/40 text-[13px] mb-7">por mes · facturado $96/año</p>
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
            <button className="w-full py-3 rounded-xl bg-[#5448EE] hover:bg-[#4035d4] text-white font-semibold text-[14px] transition-colors duration-150">
              Empezar con Anual
            </button>
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
          <button className="bg-white text-[#5448EE] font-semibold text-[15px] px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-colors duration-150">
            Crear cuenta gratis
          </button>
          <button className="text-white font-semibold text-[15px] px-7 py-3.5 rounded-xl border border-white/30 hover:bg-white/10 transition-colors duration-150">
            Ver demo
          </button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="bg-[#0C0B1A] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[5px] bg-[#5448EE] flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1.2" fill="white" />
                <rect x="8" y="1.5" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.5" />
                <rect x="1.5" y="8" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.5" />
                <rect x="8" y="8" width="4.5" height="4.5" rx="1.2" fill="white" />
              </svg>
            </div>
            <span className="text-white font-semibold text-[14px] tracking-[-0.025em]">MiniTools</span>
          </div>
          <div className="flex items-center gap-6 text-white/40 text-[13px]">
            <a href="#" className="hover:text-white/70 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white/70 transition-colors">Términos</a>
            <a href="#" className="hover:text-white/70 transition-colors">Contacto</a>
          </div>
          <p className="text-white/30 text-[13px]">© 2026 MiniTools. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
