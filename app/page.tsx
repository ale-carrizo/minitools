"use client";

import { useEffect, useRef, useState } from "react";

const tools = [
  { emoji: "📝", name: "Contador de palabras", desc: "Cuenta palabras, caracteres y oraciones al instante", iconBg: "bg-blue-50" },
  { emoji: "🌈", name: "Conversor de colores", desc: "HEX, RGB, HSL y más en un clic", iconBg: "bg-green-50" },
  { emoji: "🔐", name: "Generador de contraseñas", desc: "Contraseñas seguras personalizables", iconBg: "bg-purple-50" },
  { emoji: "⏱️", name: "Convertidor de tiempo", desc: "Zonas horarias y conversión de unidades", iconBg: "bg-amber-50" },
  { emoji: "🔗", name: "Acortador de URLs", desc: "Crea links cortos y rastrea clics", iconBg: "bg-red-50" },
  { emoji: "📊", name: "Conversor de JSON", desc: "Formatea, valida y convierte JSON", iconBg: "bg-indigo-50" },
  { emoji: "🖼️", name: "Compresor de imágenes", desc: "Reduce el peso sin perder calidad", iconBg: "bg-pink-50" },
  { emoji: "📐", name: "Conversor de unidades", desc: "Longitud, peso, temperatura y más", iconBg: "bg-teal-50" },
];

const chips = [
  "✏️ Escritura", "🖼️ Imágenes", "⌨️ Dev",
  "🔢 Matemáticas", "⏰ Tiempo", "🎨 Colores",
  "📁 Archivos", "🔐 Seguridad",
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCardsVisible(true); },
      { threshold: 0.08 }
    );
    if (gridRef.current) observer.observe(gridRef.current);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <main>
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-between px-6 transition-all duration-300 ${
          scrolled
            ? "bg-[#0C0B1A]/90 backdrop-blur-md border-b border-white/[0.06]"
            : "bg-white/[0.06]"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[6px] bg-[#5448EE] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1.2" fill="white" />
              <rect x="8" y="1.5" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.5" />
              <rect x="1.5" y="8" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.5" />
              <rect x="8" y="8" width="4.5" height="4.5" rx="1.2" fill="white" />
            </svg>
          </div>
          <span className="text-white font-bold text-[15px] tracking-[-0.03em] font-display">
            MiniTools
          </span>
        </div>
        <button className="bg-[#5448EE] hover:bg-[#4035d4] active:bg-[#3329b8] text-white text-[13px] font-semibold px-4 py-[7px] rounded-[8px] transition-colors duration-150">
          Empezar gratis
        </button>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-[#0C0B1A] flex flex-col items-center justify-center overflow-hidden">
        {/* Breathing glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="animate-pulse-glow"
            style={{
              width: "860px",
              height: "500px",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, #5448EE 0%, #8880F5 30%, transparent 70%)",
              filter: "blur(2px)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 animate-fade-up">
          <h1 className="text-5xl sm:text-[70px] lg:text-[80px] font-bold leading-[1.05] tracking-[-0.04em] mb-5 font-display">
            <span className="text-white block">Todas las herramientas</span>
            <span className="block" style={{ color: "#8880F5" }}>en una sola suscripción</span>
          </h1>

          <p className="text-white/40 text-[17px] leading-relaxed mb-9 max-w-[340px] mx-auto">
            Una suscripción. Acceso ilimitado. Sin complicaciones.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <button className="bg-[#5448EE] hover:bg-[#4035d4] text-white font-semibold text-[15px] px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-[0_4px_30px_rgba(84,72,238,0.5)]">
              Empezar gratis
            </button>
            <button className="text-white font-medium text-[15px] px-6 py-3 rounded-xl border border-white/25 hover:border-white/50 hover:bg-white/[0.06] transition-all duration-200">
              Ver herramientas →
            </button>
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-start sm:justify-center max-w-2xl mx-auto no-scrollbar">
            {chips.map((chip) => (
              <span
                key={chip}
                className="flex-shrink-0 text-white/50 text-[13px] px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] hover:text-white/80 cursor-pointer transition-all duration-150 select-none whitespace-nowrap"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Gradient fade to tools grid */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #F6F6FB)" }}
        />
      </section>

      {/* ── TOOLS GRID ─────────────────────────────────────── */}
      <section className="bg-[#F6F6FB] pt-4 pb-24 px-6">
        <h2 className="text-[26px] font-bold text-center text-[#1a1a2e] mb-12 tracking-[-0.025em] font-display">
          Herramientas populares
        </h2>
        <div
          ref={gridRef}
          className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {tools.map((tool, i) => (
            <div
              key={tool.name}
              className={`bg-white border border-[#E4E3F2] rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-[#C4C3E0] transition-all duration-300 cursor-pointer group ${
                cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: cardsVisible ? `${i * 55}ms` : "0ms" }}
            >
              <div className={`w-10 h-10 ${tool.iconBg} rounded-lg flex items-center justify-center text-xl mb-4`}>
                {tool.emoji}
              </div>
              <h3 className="text-[#1a1a2e] font-semibold text-[13px] leading-snug mb-1.5">
                {tool.name}
              </h3>
              <p className="text-[#1a1a2e]/45 text-[11.5px] leading-relaxed mb-3.5">
                {tool.desc}
              </p>
              <span className="text-[#5448EE] text-[12px] font-semibold group-hover:underline underline-offset-2">
                Usar →
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
