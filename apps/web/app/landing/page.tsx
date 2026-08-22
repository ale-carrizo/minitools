import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zimple Tools | Tu caja de herramientas digitales",
  description:
    "Las herramientas que necesitás para gestionar tu negocio, en un solo lugar.",
};

const accessUrl = "https://app.zimple.tools/login";

function ZimpleMark({ size = 46 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="landing-zimple-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7828ff" />
          <stop offset="52%" stopColor="#315dff" />
          <stop offset="100%" stopColor="#00c9e8" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill="url(#landing-zimple-gradient)" />
      <path d="M25 30h50L28 70h47" stroke="white" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7">
      <path d="M5 19v-5M12 19V9M19 19V4" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7">
      <rect x="4" y="3.5" width="16" height="17" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8 12 2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7">
      <path d="M7 3.5h7l3 3v14l-2.5-1.5L12 20.5 9.5 19 7 20.5v-17Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 10h4M10 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

type ToolIconName = "presupuesto" | "factura" | "clientes" | "calculadora" | "stock" | "turnos" | "reportes" | "check" | "send" | "shield" | "cloud" | "clock";

function ToolGlyph({ name }: { name: ToolIconName }) {
  const common = { stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  if (name === "presupuesto" || name === "factura") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7"><path d="M6 3.5h8l4 4v13H6z" {...common} /><path d="M14 3.5v4h4M9 12h6M9 16h4" {...common} />{name === "presupuesto" && <path d="M16.5 16.5c0 1-1 1.5-2 1.5s-2-.5-2-1.5 1-1.5 2-1.5 2 .5 2 1.5Z" {...common} />}</svg>;
  }
  if (name === "clientes") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7"><circle cx="9" cy="8" r="3" {...common} /><path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20M16 6.5a3 3 0 0 1 0 5.7M18 14.5a3.5 3.5 0 0 1 2.5 3.35V20" {...common} /></svg>;
  }
  if (name === "calculadora") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7"><rect x="5" y="2.5" width="14" height="19" rx="2" {...common} /><path d="M8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" {...common} /></svg>;
  }
  if (name === "stock") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7"><path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10" {...common} /></svg>;
  }
  if (name === "turnos") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7"><rect x="3" y="4.5" width="18" height="16" rx="2" {...common} /><path d="M8 2.5v4M16 2.5v4M3 9h18M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" {...common} /></svg>;
  }
  if (name === "reportes") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7"><path d="M4 20.5h16M7 17v-5M12 17V7M17 17V3.5" {...common} /></svg>;
  }
  if (name === "send") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6"><path d="m21 3-7.8 18-3.8-8-7.4-3.7L21 3Z" {...common} /><path d="m9.4 12.7 4.3-4.2" {...common} /></svg>;
  }
  if (name === "shield") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6"><path d="M12 21s7-3.5 7-9.5V5l-7-2.5L5 5v6.5C5 17.5 12 21 12 21Z" {...common} /><path d="m9 12 2 2 4-4" {...common} /></svg>;
  }
  if (name === "cloud") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6"><path d="M7.5 18.5h10a4 4 0 0 0 .6-7.95A6.5 6.5 0 0 0 5.7 9.1 4.7 4.7 0 0 0 7.5 18.5Z" {...common} /><path d="m12 8.5-2.5 2.5H11v3h2v-3h1.5L12 8.5Z" {...common} /></svg>;
  }
  if (name === "clock") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6"><circle cx="12" cy="12" r="8.5" {...common} /><path d="M12 7v5l3.5 2" {...common} /></svg>;
  }
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6"><path d="m5 12 4 4L19 6" {...common} /></svg>;
}

const tools = [
  { name: "Presupuestos", detail: "Cotizaciones claras, listas para compartir y seguir.", icon: "presupuesto" as const, tone: "violet" },
  { name: "Facturador", detail: "Documentos de venta desde el mismo lugar.", icon: "factura" as const, tone: "blue" },
  { name: "Clientes", detail: "Seguimiento de cada contacto y oportunidad.", icon: "clientes" as const, tone: "cyan" },
  { name: "Calculadora de precios", detail: "Definí márgenes y precios con seguridad.", icon: "calculadora" as const, tone: "blue" },
  { name: "Ventas y stock", detail: "Registrá movimientos y sabé qué te falta.", icon: "stock" as const, tone: "violet" },
  { name: "Gestión de turnos", detail: "Ordená tu agenda y el tiempo de tu equipo.", icon: "turnos" as const, tone: "blue" },
  { name: "Reportes", detail: "Mirá la información importante de un vistazo.", icon: "reportes" as const, tone: "cyan" },
];

const pricingPlans = [
  {
    name: "Una herramienta",
    price: "$6.000",
    description: "Para un caso puntual.",
    detail: "Si solo necesitás cubrir una tarea específica.",
    features: ["Elegí 1 herramienta", "Actualizaciones incluidas", "Soporte por email"],
    cta: "Elegir opción puntual",
  },
  {
    name: "Starter",
    price: "$12.000",
    saving: "Ahorrás 33%",
    description: "Hasta 3 herramientas",
    detail: "Lo esencial para empezar a ordenar tu negocio.",
    features: ["Elegí hasta 3 herramientas", "Cambiá herramientas cuando lo necesites", "Actualizaciones incluidas"],
    cta: "Elegir Starter",
  },
  {
    name: "Pro",
    price: "$23.000",
    saving: "Ahorrás 37%",
    description: "Hasta 6 herramientas",
    detail: "Más herramientas para más tareas del día a día.",
    features: ["Elegí hasta 6 herramientas", "Cambiá herramientas cuando lo necesites", "Soporte prioritario"],
    cta: "Elegir Pro",
    featured: true,
  },
  {
    name: "Full",
    price: "$30.000",
    saving: "Ahorrás 44%",
    description: "Todas las herramientas",
    detail: "Toda la caja Zimple, hoy y mañana.",
    features: ["Acceso a las 12 herramientas", "Nuevas herramientas incluidas", "Soporte prioritario"],
    cta: "Elegir Full",
  },
];

function ModuleCard({
  title,
  accent,
  children,
  className,
}: {
  title: string;
  accent: "violet" | "blue" | "cyan";
  children: React.ReactNode;
  className: string;
}) {
  const accents = {
    violet: "from-[#7024ff] to-[#a545ff] text-white shadow-[0_0_30px_rgba(119,39,255,0.38)]",
    blue: "from-[#1673ff] to-[#20aaff] text-white shadow-[0_0_30px_rgba(20,113,255,0.35)]",
    cyan: "from-[#00b7d7] to-[#10d9ed] text-white shadow-[0_0_30px_rgba(0,194,226,0.33)]",
  };

  return (
    <article className={`absolute rounded-[26px] border border-white/20 bg-[#14162c]/80 p-5 backdrop-blur-md ${className}`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accents[accent]}`}>
          {children}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[18px] font-semibold tracking-[-0.03em] text-white">{title}</h2>
          <div className="mt-3 h-1.5 w-full rounded-full bg-[#303654]" />
          <div className="mt-2 h-1.5 w-3/5 rounded-full bg-[#303654]" />
        </div>
      </div>
    </article>
  );
}

export default function LandingPage({ includePricingAndFooter = false }: { includePricingAndFooter?: boolean }) {
  return (
    <main className="landing-page min-h-screen overflow-hidden bg-[#030305] text-white">
      <section className="relative isolate overflow-hidden px-6 pb-10 pt-6 sm:px-10 lg:px-16 lg:pb-14 lg:pt-8">
        <div className="landing-grid absolute inset-0 -z-20 opacity-30" />
        <div className="absolute -right-48 top-[-14rem] -z-10 h-[52rem] w-[52rem] rounded-full bg-[#4418d4]/40 blur-[120px]" />
        <div className="absolute right-[4%] top-[22%] -z-10 h-80 w-80 rounded-full bg-[#0879ef]/25 blur-[105px]" />
        <div className="absolute -bottom-72 left-[12%] -z-10 h-96 w-96 rounded-full bg-[#4b14dc]/25 blur-[120px]" />

        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <Link href="/" aria-label="Ir al inicio de Zimple Tools" className="flex items-center gap-3">
            <ZimpleMark />
            <span className="leading-none">
              <strong className="block font-display text-[22px] font-bold tracking-[-0.055em] text-white">Zimple</strong>
              <span className="mt-1 block text-[8px] font-semibold tracking-[0.38em] text-white/70">TOOLS</span>
            </span>
          </Link>
          <a
            href={accessUrl}
            className="rounded-xl border border-white/20 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition hover:border-white/45 hover:bg-white/[0.12]"
          >
            Acceder
          </a>
        </div>

        <div className="mx-auto grid max-w-[1440px] items-center gap-12 pt-10 lg:grid-cols-[0.94fr_1.06fr] lg:gap-2 lg:pt-6">
          <div className="relative z-10 max-w-3xl animate-[fade-up_0.75s_cubic-bezier(0.16,1,0.3,1)_both]">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9f97ff]">Gestión simple para tu negocio</p>
            <h1 className="font-display text-[clamp(2.4rem,6.56vw,6.72rem)] font-bold leading-[1.04] tracking-[-0.073em] text-white">
              Tu caja de
              <span className="mt-2 block landing-gradient-text">herramientas</span>
              <span className="block landing-gradient-text">digitales.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[clamp(1.35rem,2.15vw,2.25rem)] font-medium leading-[1.16] tracking-[-0.045em] text-white/90">
              Todo lo que tu negocio necesita, <span className="landing-gradient-text">en un solo lugar.</span>
            </p>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/55">
              Elegí las herramientas que te sirven hoy y sumá otras cuando tu negocio las necesite.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a
                href={accessUrl}
                className="landing-cta rounded-2xl px-7 py-4 text-[15px] font-bold text-white"
              >
                Accedé a Zimple
                <span className="ml-2 text-lg leading-none">→</span>
              </a>
              <span className="text-sm text-white/45">Empezá con lo que necesitás.</span>
            </div>
          </div>

          <div className="relative mx-auto h-[380px] w-full max-w-[660px] sm:h-[440px] lg:h-[520px] lg:max-w-none">
            <div className="absolute right-[-20%] top-[8%] h-[82%] w-[85%] rounded-full bg-gradient-to-br from-[#5b20ef]/50 via-[#095dd9]/35 to-transparent blur-3xl" />
            <svg className="absolute left-[4%] top-[6%] h-[86%] w-[96%] opacity-70" viewBox="0 0 630 560" fill="none" aria-hidden="true">
              <path d="M-10 455C137 462 132 276 276 305c100 20 72-164 276-140" stroke="url(#landing-line)" strokeWidth="1.2" />
              <path d="M98 565c28-119 151-84 194-147 48-71-3-168 168-185" stroke="url(#landing-line)" strokeWidth="1.2" opacity=".5" />
              <defs>
                <linearGradient id="landing-line" x1="0" y1="0" x2="630" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#731fff" stopOpacity="0" />
                  <stop offset=".5" stopColor="#8b36ff" />
                  <stop offset="1" stopColor="#00c8ed" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <ModuleCard title="Analíticas" accent="violet" className="landing-card-one right-[3%] top-[3%] w-[78%] sm:w-[66%]">
              <AnalyticsIcon />
            </ModuleCard>
            <ModuleCard title="Tareas" accent="blue" className="landing-card-two right-[0%] top-[35%] w-[74%] sm:w-[62%]">
              <CheckIcon />
            </ModuleCard>
            <article className="landing-card-three absolute bottom-[4%] left-[3%] w-[88%] rounded-[28px] border border-[#37bff1]/35 bg-[#0b1c30]/90 p-5 shadow-[0_18px_55px_rgba(0,87,145,0.25)] backdrop-blur-md sm:w-[82%]">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00b7d7] to-[#11dcec] text-white shadow-[0_0_30px_rgba(0,194,226,0.34)]">
                  <ReceiptIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-[18px] font-semibold tracking-[-0.03em] text-white">Presupuestos</h2>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-[#254561]" />
                  <div className="mt-2 h-1.5 w-2/5 rounded-full bg-[#254561]" />
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
                <span className="text-sm font-medium text-white/55">Gestión profesional</span>
                <span className="rounded-lg bg-[#00c9a2]/15 px-2.5 py-1 text-sm font-semibold text-[#27dfbd]">Listo</span>
              </div>
            </article>
            <div className="absolute right-[0%] top-[60%] flex h-24 w-24 items-center justify-center rounded-[23px] border-2 border-dashed border-white/30 bg-[#2232cc]/20 text-5xl font-light text-[#20c7f1] shadow-[0_0_45px_rgba(50,79,255,0.35)] sm:right-[1%]">+</div>
            <div className="absolute right-[-3%] top-[-4%] grid grid-cols-7 gap-3 opacity-45">
              {Array.from({ length: 28 }).map((_, index) => <span key={index} className="h-1 w-1 rounded-full bg-[#b4adff]" />)}
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-6 h-12 w-40 opacity-35 [background-image:radial-gradient(circle,_#8c85ff_1.5px,_transparent_1.5px)] [background-size:16px_16px] sm:left-10" />
      </section>

      <section className="relative overflow-hidden border-y border-white/[0.07] bg-[#07080d] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(68,35,210,0.25),transparent_67%)]" />
        <div className="relative mx-auto max-w-[1200px]">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9f97ff]">Módulos para el día a día</p>
              <h2 className="mt-5 font-display text-[clamp(2.7rem,5vw,5.2rem)] font-bold leading-[0.91] tracking-[-0.065em] text-white">
                Todo lo que podés hacer <span className="landing-gradient-text">con Zimple.</span>
              </h2>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/55">
                No necesitás adoptar un sistema gigante. Activá la herramienta que hoy te hace falta y construí tu propio espacio de gestión, a tu ritmo.
              </p>
            </div>
            <div className="landing-stat-card w-full max-w-sm rounded-3xl border border-[#7c5cff]/35 p-5 lg:mb-1">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7228ff] to-[#09bde6] text-white"><AnalyticsIcon /></div>
                <div>
                  <p className="text-sm font-semibold text-white">Tu negocio, más claro</p>
                  <p className="text-xs text-white/45">Información útil para decidir.</p>
                </div>
              </div>
              <div className="mt-5 flex h-10 items-end gap-1.5">
                {[36, 54, 42, 78, 62, 92, 72].map((height, index) => <span key={index} className="flex-1 rounded-t bg-gradient-to-t from-[#4e35eb] to-[#10c9e9] opacity-80" style={{ height: `${height}%` }} />)}
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool, index) => (
              <article key={tool.name} className={`landing-tool-card group rounded-[24px] p-5 ${index === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${tool.tone === "violet" ? "bg-gradient-to-br from-[#7628ff] to-[#9d43ff]" : tool.tone === "blue" ? "bg-gradient-to-br from-[#1a71ff] to-[#1faef9]" : "bg-gradient-to-br from-[#00accd] to-[#13d8ed]"}`}>
                  <ToolGlyph name={tool.icon} />
                </div>
                <h3 className="mt-5 font-display text-[21px] font-semibold tracking-[-0.04em] text-white">{tool.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{tool.detail}</p>
                <div className="mt-6 flex gap-1.5 opacity-50"><span className="h-1.5 w-14 rounded-full bg-[#7964ff]" /><span className="h-1.5 w-8 rounded-full bg-[#21c7e8]" /></div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-[28px] border border-white/10 bg-white/[0.035] px-6 py-6 sm:flex-row sm:items-center sm:px-8">
            <p className="max-w-2xl text-xl font-medium tracking-[-0.035em] text-white/85">Las herramientas que tu negocio necesita, <span className="landing-gradient-text">en un solo lugar.</span></p>
            <a href={accessUrl} className="shrink-0 text-sm font-bold text-[#57dafa] transition hover:text-white">Ver las herramientas <span className="ml-1">→</span></a>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/[0.07] bg-[#080a13] px-6 py-20 text-center sm:px-10 lg:px-16 lg:py-28">
        <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_center,rgba(82,44,238,0.32),transparent_70%)]" />
        <div className="relative mx-auto max-w-[1000px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9f97ff]">Hecho para avanzar</p>
          <h2 className="mt-5 font-display text-[clamp(2.6rem,5vw,5rem)] font-bold leading-[0.92] tracking-[-0.06em] text-white">Empezá simple. <span className="landing-gradient-text">Crecé cuando quieras.</span></h2>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-white/55">No hace falta usar todo desde el primer día. Empezá por resolver una tarea y sumá herramientas cuando realmente te sirvan.</p>
          <div className="mx-auto mt-12 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
            {[
              ["clock", "Rápido", "Ponete en marcha sin vueltas."],
              ["cloud", "En la nube", "Accedé desde donde estés."],
              ["shield", "Ordenado", "Todo en un mismo entorno."],
            ].map(([icon, title, detail]) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07] text-[#59d8f5]"><ToolGlyph name={icon as ToolIconName} /></span><h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.035em] text-white">{title}</h3><p className="mt-1 text-sm leading-relaxed text-white/48">{detail}</p></div>)}
          </div>
          <a href={accessUrl} className="landing-cta mt-12 inline-block rounded-2xl px-8 py-4 text-[15px] font-bold text-white">Accedé a Zimple <span className="ml-2 text-lg">→</span></a>
        </div>
      </section>

      {includePricingAndFooter && (
        <>
          <section className="relative overflow-hidden bg-[#030305] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
            <div className="absolute left-1/2 top-0 h-[34rem] w-[70rem] -translate-x-1/2 rounded-full bg-[#5220ca]/20 blur-[130px]" />
            <div className="relative mx-auto max-w-[1260px]">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9f97ff]">Precios</p>
                <h2 className="mt-5 font-display text-[clamp(2.7rem,5vw,5.3rem)] font-bold leading-[0.92] tracking-[-0.065em] text-white">
                  Elegí cuántas herramientas <span className="landing-gradient-text">necesitás.</span>
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-white/55">
                  Entrás a Zimple para resolver una necesidad puntual y ampliás tu espacio cuando tu negocio lo pida.
                </p>
              </div>

              <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {pricingPlans.map((plan) => (
                  <article key={plan.name} className={`relative flex min-h-[480px] flex-col rounded-[28px] border p-7 ${plan.featured ? "border-[#7951ff] bg-[linear-gradient(150deg,rgba(70,33,159,0.52),rgba(10,14,31,0.95)_55%,rgba(7,15,28,0.95))] shadow-[0_18px_60px_rgba(91,55,255,0.28)]" : "border-white/10 bg-white/[0.035]"}`}>
                    {plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#782dff] to-[#11c7e8] px-4 py-1.5 text-[11px] font-bold tracking-[0.12em] text-white">MÁS POPULAR</span>}
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">{plan.name}</p>
                    <p className="mt-6 font-display text-[45px] font-bold leading-none tracking-[-0.06em] text-white">{plan.price}</p>
                    <p className="mt-2 text-sm text-white/45">por mes</p>
                    <div className="mt-5 min-h-7">{plan.saving && <span className="rounded-full bg-[#7855ff]/15 px-3 py-1.5 text-xs font-bold text-[#b6b0ff]">{plan.saving}</span>}</div>
                    <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.04em] text-white">{plan.description}</h3>
                    <p className="mt-2 min-h-11 text-sm leading-relaxed text-white/50">{plan.detail}</p>
                    <ul className="mt-7 space-y-3">
                      {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/70"><span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#714bff]/20 text-[#79e2f4]"><ToolGlyph name="check" /></span>{feature}</li>)}
                    </ul>
                    <a href={accessUrl} className={`mt-auto block rounded-xl px-4 py-3.5 text-center text-sm font-bold transition ${plan.featured ? "landing-cta text-white" : "border border-white/15 bg-white/[0.06] text-white hover:border-[#54d6f3]/55 hover:bg-white/[0.1]"}`}>{plan.cta}</a>
                  </article>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-white/42">Podés cambiar de plan cuando quieras.</p>
            </div>
          </section>

          <footer className="border-t border-white/[0.08] bg-[#05060a] px-6 py-12 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-[1260px]">
              <p className="text-center text-sm text-white/48">Empezá con una sola app. Sumá otras sólo cuando tu negocio realmente las necesite.</p>
              <div className="mt-9 flex flex-col items-center justify-between gap-6 border-t border-white/[0.07] pt-8 lg:flex-row">
                <Link href="/" aria-label="Ir al inicio de Zimple Tools" className="flex items-center gap-3">
                  <ZimpleMark size={32} />
                  <span className="font-display text-lg font-semibold tracking-[-0.04em] text-white">Zimple Tools</span>
                </Link>
                <nav aria-label="Enlaces legales" className="flex items-center gap-6 text-sm text-white/48">
                  <Link href="/privacidad" className="transition hover:text-white">Privacidad</Link>
                  <Link href="/terminos" className="transition hover:text-white">Términos</Link>
                  <a href="mailto:[EMAIL LEGAL / SOPORTE]" className="transition hover:text-white">Contacto</a>
                </nav>
                <p className="text-center text-sm text-white/32">© 2026 Zimple Tools. Todos los derechos reservados.</p>
              </div>
            </div>
          </footer>
        </>
      )}
    </main>
  );
}
