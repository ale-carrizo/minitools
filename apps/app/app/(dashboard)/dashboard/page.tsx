import { auth } from "@/auth";
import Link from "next/link";

const tools = [
  { num: "01", label: "Control de Stock", href: "/dashboard/stock", status: "available" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"/></svg>, desc: "Inventario con alertas automáticas de stock mínimo" },
  { num: "02", label: "Generador de Presupuestos", href: "/dashboard/presupuestos", status: "available" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>, desc: "Presupuestos en PDF con logo y seguimiento de estados" },
  { num: "03", label: "Control de Caja + Pagos", href: "/dashboard/caja", status: "soon" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>, desc: "Ingresos y egresos del día con lectura de comprobantes por IA" },
  { num: "04", label: "Calculadora de Precios", href: "/dashboard/precios", status: "soon" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>, desc: "Precio de venta desde costo, IVA, margen y punto de equilibrio" },
  { num: "05", label: "Recibo de Sueldo", href: "/dashboard/sueldos", status: "planned" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg>, desc: "Recibos de sueldo PDF para empleados y monotributistas" },
  { num: "06", label: "Control de Asistencia", href: "/dashboard/asistencia", status: "planned" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>, desc: "Entradas, salidas y horas trabajadas del personal" },
  { num: "07", label: "Gestión de Turnos", href: "/dashboard/turnos", status: "planned" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>, desc: "Agenda online con recordatorios por WhatsApp" },
  { num: "08", label: "Seguimiento de Garantías", href: "/dashboard/garantias", status: "planned" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>, desc: "Garantías con alertas de vencimiento e historial de reclamos" },
  { num: "09", label: "Liquidación de Sueldos", href: "/dashboard/liquidacion", status: "planned" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>, desc: "Liquidación mensual con aportes, retenciones y resumen AFIP" },
  { num: "10", label: "CRM de Clientes", href: "/dashboard/crm", status: "planned" as const, icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z"/></svg>, desc: "Base de clientes con historial, etiquetas y seguimiento" },
];

const statusConfig = {
  available: { label: "Disponible", dot: "bg-[#5448EE]", badge: "text-[#8880F5] bg-[#5448EE]/10" },
  soon:      { label: "En desarrollo", dot: "bg-white/30", badge: "text-white/40 bg-white/[0.06]" },
  planned:   { label: "Próximamente", dot: "bg-white/15", badge: "text-white/25 bg-white/[0.04]" },
};

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Usuario";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[26px] font-semibold text-white tracking-[-0.03em]">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Tus herramientas de negocio — MVP v1.0
        </p>
      </div>

      {/* Progress banner */}
      <div className="flex items-center gap-4 bg-[#5448EE]/10 border border-[#5448EE]/20 rounded-2xl px-5 py-4 mb-8">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#5448EE] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="white">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white/80">2 herramientas disponibles · 8 en camino</p>
          <p className="text-xs text-white/40 mt-0.5">Stock y Presupuestos ya están listos para usar.</p>
        </div>
        <div className="flex items-center gap-1.5">
          {tools.map((t) => (
            <div key={t.num} className={`w-1.5 h-1.5 rounded-full ${statusConfig[t.status].dot}`} />
          ))}
        </div>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {tools.map((tool) => {
          const st = statusConfig[tool.status];
          const isAvailable = tool.status === "available";

          const card = (
            <div className={`group bg-white/[0.04] border rounded-2xl p-5 transition-all duration-200 h-full flex flex-col ${
              isAvailable
                ? "border-white/[0.10] hover:border-[#5448EE]/60 hover:bg-white/[0.06] cursor-pointer"
                : "border-white/[0.06] opacity-60"
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isAvailable ? "bg-[#5448EE]/15 text-[#8880F5]" : "bg-white/[0.06] text-white/30"
                }`}>
                  {tool.icon}
                </div>
                <span className="text-[10px] font-mono text-white/20">{tool.num}</span>
              </div>
              <h3 className={`font-medium text-[13.5px] leading-snug mb-1.5 ${isAvailable ? "text-white/90" : "text-white/40"}`}>
                {tool.label}
              </h3>
              <p className="text-[12px] text-white/30 leading-relaxed flex-1">{tool.desc}</p>
              <div className="mt-4">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.badge}`}>
                  {st.label}
                </span>
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
