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

export default function LandingPage() {
  return (
    <main className="landing-page min-h-screen overflow-hidden bg-[#030305] text-white">
      <section className="relative isolate min-h-screen px-6 pb-12 pt-8 sm:px-10 lg:px-16 lg:pb-16 lg:pt-12">
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

        <div className="mx-auto grid max-w-[1440px] items-center gap-12 pt-16 lg:min-h-[calc(100vh-100px)] lg:grid-cols-[0.94fr_1.06fr] lg:gap-2 lg:pt-6">
          <div className="relative z-10 max-w-3xl animate-[fade-up_0.75s_cubic-bezier(0.16,1,0.3,1)_both]">
            <p className="mb-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9f97ff]">Gestión simple para tu negocio</p>
            <h1 className="font-display text-[clamp(3rem,8.2vw,8.4rem)] font-bold leading-[0.84] tracking-[-0.073em] text-white">
              Tu caja de
              <span className="mt-2 block landing-gradient-text">herramientas</span>
              <span className="block landing-gradient-text">digitales.</span>
            </h1>
            <p className="mt-10 max-w-xl text-[clamp(1.35rem,2.15vw,2.25rem)] font-medium leading-[1.16] tracking-[-0.045em] text-white/90">
              Todo lo que tu negocio necesita, <span className="landing-gradient-text">en un solo lugar.</span>
            </p>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/55">
              Elegí las herramientas que te sirven hoy y sumá otras cuando tu negocio las necesite.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
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

          <div className="relative mx-auto h-[420px] w-full max-w-[660px] sm:h-[500px] lg:h-[620px] lg:max-w-none">
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
    </main>
  );
}
