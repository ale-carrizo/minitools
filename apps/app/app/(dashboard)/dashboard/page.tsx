import { auth } from "@/auth";
import Link from "next/link";
import StorageWidget from "@/app/components/StorageWidget";

const tools = [
  { num: "01", label: "Control de Stock", href: "/dashboard/stock", status: "available" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"/></svg>, desc: "Inventario con alertas automáticas de stock mínimo" },
  { num: "02", label: "Generador de Presupuestos", href: "/dashboard/presupuestos", status: "available" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>, desc: "Presupuestos en PDF con logo y seguimiento de estados" },
  { num: "03", label: "Control de Caja + Pagos", href: "/dashboard/caja", status: "available" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>, desc: "Ingresos y egresos del día con lectura de comprobantes por IA" },
  { num: "04", label: "Calculadora de Precios", href: "/dashboard/precios", status: "available" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>, desc: "Precio de venta desde costo, IVA, margen y punto de equilibrio" },
  { num: "05", label: "Recibo de Sueldo", href: "/dashboard/sueldos", status: "available" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg>, desc: "Recibos de sueldo PDF para empleados y monotributistas" },
  { num: "06", label: "Control de Asistencia", href: "/dashboard/asistencia", status: "available" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>, desc: "Presentismo diario con entradas, salidas, ausencias e historial por empleado" },
  { num: "07", label: "Gestión de Turnos", href: "/dashboard/turnos", status: "available" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>, desc: "Agenda online con recordatorios por WhatsApp" },
  { num: "08", label: "Seguimiento de Garantías", href: "/dashboard/garantias", status: "available" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>, desc: "Garantías con alertas de vencimiento e historial de reclamos" },
  { num: "09", label: "Clientes y Pagos", href: "/dashboard/socios", status: "available" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z"/></svg>, desc: "Cobranza recurrente con recordatorios de pago por WhatsApp" },
  { num: "10", label: "Tareas / Kanban", href: "/dashboard/tareas", status: "available" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z"/></svg>, desc: "Tableros Kanban configurables con hasta 8 columnas" },
];

const statusConfig = {
  available: { label: "Disponible", dot: "bg-[#5448EE]", badge: "text-[#8880F5] bg-[#5448EE]/15 font-semibold" },
  soon:      { label: "En desarrollo", dot: "bg-white/30", badge: "text-white/50 bg-white/[0.08]" },
  planned:   { label: "Próximamente", dot: "bg-white/15", badge: "text-white/35 bg-white/[0.05]" },
};

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Usuario";
  const hour = parseInt(
    new Date().toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "numeric",
      hour12: false,
    }),
    10
  );
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <h1 className="font-display text-[30px] font-semibold tracking-[-0.035em]">
          <span className="text-white">{greeting}, </span>
          <span className="text-gradient">{firstName}</span>
          <span className="text-white"> 👋</span>
        </h1>
        <p className="text-white/40 text-sm mt-1.5">
          Tus herramientas de negocio — MVP v1.0
        </p>
      </div>

      {/* Progress banner */}
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
          <p className="text-sm font-medium text-white/85">10 herramientas disponibles</p>
          <p className="text-xs text-white/40 mt-0.5">Stock, Presupuestos, Caja, Precios, Sueldos, Asistencia, Garantías, Turnos, Clientes y Kanban.</p>
        </div>
        <div className="relative flex items-center gap-1.5">
          {tools.map((t) => (
            <div key={t.num} className={`w-1.5 h-1.5 rounded-full ${statusConfig[t.status].dot}`} />
          ))}
        </div>
      </div>

      <StorageWidget />

      {/* Tools grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {tools.map((tool, idx) => {
          const st = statusConfig[tool.status];
          const isAvailable = tool.status === "available";

          const card = (
            <div
              style={{ "--i": idx + 2 } as React.CSSProperties}
              className={`group relative overflow-hidden border rounded-2xl p-5 h-full flex flex-col animate-[fade-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:calc(var(--i)*45ms)] ${
                isAvailable
                  ? "card-glow bg-[#1A1830] border-white/[0.12] cursor-pointer"
                  : "bg-[#141322] border-white/[0.07]"
              }`}>
              {isAvailable && (
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "radial-gradient(circle, rgba(84,72,238,0.35), transparent 70%)", filter: "blur(6px)" }} />
              )}
              <div className="relative flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isAvailable
                    ? "icon-pop text-white shadow-[0_4px_14px_-4px_rgba(84,72,238,0.6)]"
                    : "bg-white/[0.05] text-white/25"
                }`}
                  style={isAvailable ? { background: "linear-gradient(135deg, #6E63FF, #5448EE 60%, #4035d4)" } : undefined}>
                  {tool.icon}
                </div>
                <span className="text-[10px] font-mono text-white/25">{tool.num}</span>
              </div>
              <h3 className={`relative font-display font-semibold text-[14px] leading-snug mb-2 ${isAvailable ? "text-white group-hover:text-[#b9b2ff] transition-colors" : "text-white/45"}`}>
                {tool.label}
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
          );

          return isAvailable ? (
            <Link key={tool.num} href={tool.href} className="h-full">
              {card}
            </Link>
          ) : (
            <div key={tool.num}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
