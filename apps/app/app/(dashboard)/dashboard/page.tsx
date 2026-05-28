import { auth } from "@/auth";

const tools = [
  {
    label: "Facturación",
    href: "/dashboard/facturacion",
    color: "#5448EE",
    bg: "#EEF0FF",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    desc: "Emití facturas y controlá tus ingresos",
    category: "Finanzas",
  },
  {
    label: "Presupuestos",
    href: "/dashboard/presupuestos",
    color: "#5448EE",
    bg: "#EEF0FF",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path
          fillRule="evenodd"
          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
          clipRule="evenodd"
        />
      </svg>
    ),
    desc: "Creá y enviá presupuestos profesionales",
    category: "Finanzas",
  },
  {
    label: "Control de Gastos",
    href: "/dashboard/gastos",
    color: "#059669",
    bg: "#ECFDF5",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
          clipRule="evenodd"
        />
      </svg>
    ),
    desc: "Registrá y categorizá cada gasto",
    category: "Finanzas",
  },
  {
    label: "Cobranzas",
    href: "/dashboard/cobranzas",
    color: "#D97706",
    bg: "#FFFBEB",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    desc: "Seguí pagos pendientes y deudores",
    category: "Finanzas",
  },
  {
    label: "Stock e Inventario",
    href: "/dashboard/stock",
    color: "#7C3AED",
    bg: "#F5F3FF",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
        <path
          fillRule="evenodd"
          d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    desc: "Controlá tu stock en tiempo real",
    category: "Operaciones",
  },
  {
    label: "Proyectos",
    href: "/dashboard/proyectos",
    color: "#0EA5E9",
    bg: "#F0F9FF",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      </svg>
    ),
    desc: "Gestioná tareas y proyectos del equipo",
    category: "Operaciones",
  },
  {
    label: "Sueldos & RRHH",
    href: "/dashboard/sueldos",
    color: "#EC4899",
    bg: "#FDF2F8",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
    desc: "Liquidá sueldos y gestioná tu equipo",
    category: "RRHH",
  },
  {
    label: "Reportes",
    href: "/dashboard/reportes",
    color: "#5448EE",
    bg: "#EEF0FF",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
    desc: "Analizá el desempeño de tu negocio",
    category: "Productividad",
  },
  {
    label: "Agenda & Turnos",
    href: "/dashboard/agenda",
    color: "#059669",
    bg: "#ECFDF5",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
          clipRule="evenodd"
        />
      </svg>
    ),
    desc: "Gestioná turnos y tu agenda diaria",
    category: "Productividad",
  },
  {
    label: "Documentos",
    href: "/dashboard/documentos",
    color: "#6B7280",
    bg: "#F9FAFB",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
          clipRule="evenodd"
        />
      </svg>
    ),
    desc: "Almacená y organizá tus documentos",
    category: "Productividad",
  },
  {
    label: "CRM de Clientes",
    href: "/dashboard/crm",
    color: "#D97706",
    bg: "#FFFBEB",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
      </svg>
    ),
    desc: "Gestioná clientes y oportunidades",
    category: "Comercio",
  },
  {
    label: "Tienda Online",
    href: "/dashboard/tienda",
    color: "#7C3AED",
    bg: "#F5F3FF",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
    ),
    desc: "Vendé online con tu tienda propia",
    category: "Comercio",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Usuario";

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1a2e]">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-[#6b7280] mt-1 text-sm">
          Estas son todas tus herramientas disponibles.
        </p>
      </div>

      {/* Coming soon banner */}
      <div className="flex items-center gap-3 bg-[#EEF0FF] border border-[#c7c5f8] rounded-2xl px-5 py-4 mb-8">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#5448EE] flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="white"
          >
            <path
              fillRule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-[#3730a3]">
            Estamos construyendo tus herramientas
          </p>
          <p className="text-xs text-[#6366f1] mt-0.5">
            Todas las herramientas estarán disponibles muy pronto. ¡Gracias por
            ser de los primeros!
          </p>
        </div>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.href}
            className="group bg-white rounded-2xl border border-[#e5e7eb] p-5 hover:border-[#c7c5f8] hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: tool.bg, color: tool.color }}
            >
              {tool.icon}
            </div>
            <h3 className="font-medium text-[#1a1a2e] text-sm mb-1">
              {tool.label}
            </h3>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              {tool.desc}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: tool.bg,
                  color: tool.color,
                }}
              >
                {tool.category}
              </span>
              <span className="text-[10px] text-[#9ca3af] group-hover:text-[#5448EE] transition-colors">
                Próximamente →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
