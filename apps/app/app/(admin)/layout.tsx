import { auth, signOut } from "@/auth";
import { ZimpleIcon } from "@/app/components/ZimpleLogo";
import { redirect } from "next/navigation";
import Link from "next/link";

const adminNav = [
  { href: "/admin", label: "Resumen", icon: <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg> },
  { href: "/admin/users", label: "Usuarios", icon: <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg> },
  { href: "/admin/subscriptions", label: "Suscripciones", icon: <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg> },
  { href: "/admin/billing", label: "Facturación", icon: <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  // El panel de admin está diseñado como superficie oscura fija. En modo
  // claro --color-white se invierte a oscuro y todo el texto `text-white`/
  // lavados `bg-white/[x]` se vuelve invisible. Forzamos el token a blanco
  // literal dentro del admin y marcamos data-theme="dark" para que los
  // overrides globales de tema claro no apliquen aquí.
  return (
    <div
      className="flex h-screen bg-[#0C0B1A] overflow-hidden"
      data-theme="dark"
      style={{ ["--color-white" as string]: "#ffffff" }}
    >
      {/* Sidebar */}
      <aside className="flex-shrink-0 flex flex-col border-r border-white/[0.06] overflow-y-auto no-scrollbar" style={{ width: "200px" }}>
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 h-[52px] border-b border-white/[0.06] flex-shrink-0">
          <ZimpleIcon size={24} />
          <div className="min-w-0">
            <p className="text-white text-[12px] font-semibold leading-none tracking-[-0.02em]">Zimple Tools</p>
            <p className="text-white/30 text-[10px] mt-0.5">Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-2.5 py-3 space-y-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
            </svg>
            Volver al App
          </Link>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-red-400 hover:bg-white/[0.04] transition-colors text-left"
            >
              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 100-2H4V5h5a1 1 0 100-2H3zm10.293 3.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto" style={{ background: "#111028" }}>
        {children}
      </main>
    </div>
  );
}
