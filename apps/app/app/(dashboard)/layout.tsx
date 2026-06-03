import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const nav = [
  {
    section: "Disponibles",
    tools: [
      { href: "/dashboard/stock", label: "Control de Stock", available: true, icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"/></svg> },
      { href: "/dashboard/presupuestos", label: "Presupuestos", available: true, icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg> },
    ],
  },
  {
    section: "En desarrollo",
    tools: [
      { href: "/dashboard/caja", label: "Caja + Pagos", available: false, icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg> },
      { href: "/dashboard/precios", label: "Calculadora de Precios", available: false, icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg> },
    ],
  },
  {
    section: "Próximamente",
    tools: [
      { href: "/dashboard/sueldos", label: "Recibo de Sueldo", available: false, icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg> },
      { href: "/dashboard/asistencia", label: "Asistencia", available: false, icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg> },
      { href: "/dashboard/turnos", label: "Turnos / Agenda", available: false, icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg> },
      { href: "/dashboard/garantias", label: "Garantías", available: false, icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg> },
      { href: "/dashboard/liquidacion", label: "Liquidación de Sueldos", available: false, icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg> },
      { href: "/dashboard/crm", label: "CRM de Clientes", available: false, icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z"/></svg> },
    ],
  },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen bg-[#F6F6FB] overflow-hidden">
      <aside className="w-60 flex-shrink-0 flex flex-col bg-white border-r border-[#e5e7eb] overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#f3f4f6]">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#5448EE]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3"/>
            </svg>
          </div>
          <span className="font-semibold text-[#1a1a2e] text-sm">Zimple Tools</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F6F6FB] hover:text-[#5448EE] transition-colors">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
            Inicio
          </Link>

          {nav.map((group) => (
            <div key={group.section}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                {group.section}
              </p>
              <ul className="space-y-0.5">
                {group.tools.map((tool) => (
                  <li key={tool.href}>
                    {tool.available ? (
                      <Link href={tool.href} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#6b7280] hover:bg-[#F6F6FB] hover:text-[#5448EE] transition-colors">
                        <span className="flex-shrink-0 opacity-70">{tool.icon}</span>
                        {tool.label}
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#d1d5db] cursor-default">
                        <span className="flex-shrink-0 opacity-40">{tool.icon}</span>
                        {tool.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-[#f3f4f6] px-3 py-3">
          {session.user.role === "ADMIN" && (
            <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#5448EE] hover:bg-[#EEF0FF] transition-colors mb-1">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>
              Panel Admin
            </Link>
          )}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-[#5448EE] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#1a1a2e] truncate">{session.user.name ?? "Usuario"}</p>
              <p className="text-[11px] text-[#9ca3af] truncate">{session.user.email}</p>
            </div>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
            <button type="submit" className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#9ca3af] hover:bg-[#F6F6FB] hover:text-red-500 transition-colors text-left">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 100-2H4V5h5a1 1 0 100-2H3zm10.293 3.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
