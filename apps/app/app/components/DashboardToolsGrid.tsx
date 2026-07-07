'use client'

import Link from 'next/link'
import { APPS } from '@/lib/apps-config'
import { useAppNames } from '@/hooks/useAppNames'

const iconBySlug: Record<string, React.ReactNode> = {
  stock: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"/></svg>,
  presupuestos: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>,
  caja: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>,
  precios: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>,
  sueldos: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg>,
  turnos: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>,
  garantias: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>,
  socios: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z"/></svg>,
  tareas: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z"/></svg>,
  recibos: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v2H7V5zm0 4h6v2H7V9zm0 4h3v2H7v-2z"/></svg>,
}

const statusConfig = {
  available: { label: "Disponible", dot: "bg-[#5448EE]", badge: "text-[#8880F5] bg-[#5448EE]/15 font-semibold" },
  soon:      { label: "En desarrollo", dot: "bg-white/30", badge: "text-white/50 bg-white/[0.08]" },
  planned:   { label: "Próximamente", dot: "bg-white/15", badge: "text-white/35 bg-white/[0.05]" },
}

// Herramientas visibles en el dashboard, derivadas de APPS (única fuente de verdad,
// compartida con DashboardNav y RenameAppsModal — no filtrar por una lista aparte,
// eso fue lo que causó que "recibos" desapareciera de esta grilla la vez pasada).
const toolsDef = APPS
  .map((app, idx) => ({
    num: String(idx + 1).padStart(2, '0'),
    slug: app.slug,
    href: `/dashboard/${app.slug}`,
    status: "available" as const,
    icon: iconBySlug[app.slug],
    desc: app.desc,
  }))

export default function DashboardToolsGrid() {
  const { getLabel } = useAppNames()

  return (
    <>
      <div className="relative flex items-center gap-4 rounded-2xl px-5 py-4 mb-8 overflow-hidden border border-[#5448EE]/25 animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_0.08s_both]"
        style={{ background: "linear-gradient(110deg, rgba(84,72,238,0.18), rgba(136,128,245,0.06) 55%, transparent)" }}>
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(136,128,245,0.30), transparent 70%)", filter: "blur(8px)" }} />
        <div className="relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_4px_16px_-4px_rgba(84,72,238,0.7)] animate-[float_7s_ease-in-out_infinite]"
          style={{ background: "linear-gradient(135deg, #6E63FF, #5448EE 60%, #4035d4)" }}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="white">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
          </svg>
        </div>
        <div className="relative flex-1">
          <p className="text-sm font-medium text-white/85">{toolsDef.length} herramientas disponibles</p>
          <p className="text-xs text-white/40 mt-0.5">{toolsDef.map(t => getLabel(t.slug)).join(', ')}.</p>
        </div>
        <div className="relative flex items-center gap-1.5">
          {toolsDef.map((t) => (
            <div key={t.num} className={`w-1.5 h-1.5 rounded-full ${statusConfig[t.status].dot}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {toolsDef.map((tool, idx) => {
          const st = statusConfig[tool.status]
          const isAvailable = tool.status === "available"

          const card = (
            <div
              style={{ "--i": idx + 2 } as React.CSSProperties}
              className={`group relative overflow-hidden border rounded-2xl p-5 h-full flex flex-col animate-[fade-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:calc(var(--i)*45ms)] ${
                isAvailable
                  ? "card-glow bg-[#1A1830] light:bg-[#fff] border-white/[0.12] cursor-pointer"
                  : "bg-[#141322] light:bg-[#F1F1F6] border-white/[0.07]"
              }`}>
              {isAvailable && (
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "radial-gradient(circle, rgba(84,72,238,0.35), transparent 70%)", filter: "blur(6px)" }} />
              )}
              <div className="relative flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isAvailable
                    ? "icon-pop text-[#fff] shadow-[0_4px_14px_-4px_rgba(84,72,238,0.6)]"
                    : "bg-white/[0.05] text-white/25"
                }`}
                  style={isAvailable ? { background: "linear-gradient(135deg, #6E63FF, #5448EE 60%, #4035d4)" } : undefined}>
                  {tool.icon}
                </div>
                <span className="text-[10px] font-mono text-white/25">{tool.num}</span>
              </div>
              <h3 className={`relative font-display font-semibold text-[14px] leading-snug mb-2 ${isAvailable ? "text-white group-hover:text-[#b9b2ff] transition-colors" : "text-white/45"}`}>
                {getLabel(tool.slug)}
              </h3>
              <p className={`relative text-[12px] leading-relaxed flex-1 ${isAvailable ? "text-white/55" : "text-white/30"}`}>
                {tool.desc}
              </p>
              <div className="relative mt-4 flex items-center justify-between">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.badge}`}>
                  {st.label}
                </span>
                {isAvailable && (
                  <span className="text-[#8880F5] opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </span>
                )}
              </div>
            </div>
          )

          return isAvailable ? (
            <Link key={tool.num} href={tool.href} className="h-full">
              {card}
            </Link>
          ) : (
            <div key={tool.num}>{card}</div>
          )
        })}
      </div>
    </>
  )
}
