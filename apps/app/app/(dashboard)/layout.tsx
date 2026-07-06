import { auth, signOut } from "@/auth";
import SugerenciasBubble from "@/app/components/SugerenciasBubble";
import DashboardNav from "@/app/components/DashboardNav";
import { ZimpleIcon } from "@/app/components/ZimpleLogo";
import ThemeToggle from "@/app/components/ThemeToggle";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen bg-[#0C0B1A] light:bg-[#F7F7FB] overflow-hidden">
      {/* Sidebar — same dark as landing navbar */}
      <aside className="w-58 flex-shrink-0 flex flex-col border-r border-white/[0.06] overflow-y-auto no-scrollbar light:bg-[#fff]" style={{ width: "232px" }}>

        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 h-[52px] border-b border-white/[0.06] flex-shrink-0">
          <ZimpleIcon size={28} />
          <span className="font-display text-white font-extrabold text-[15px] tracking-[-0.02em]">Zimple Tools</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-4">
          <DashboardNav />
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-3 py-3 space-y-0.5">
          {session.user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#8880F5] hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
              Panel Admin
            </Link>
          )}
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-6 h-6 rounded-full bg-[#5448EE] flex items-center justify-center text-[#fff] text-[10px] font-semibold flex-shrink-0">
              {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/70 truncate">{session.user.name ?? "Usuario"}</p>
              <p className="text-[10px] text-white/30 truncate">{session.user.email}</p>
            </div>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-red-400 hover:bg-white/[0.04] transition-colors text-left"
            >
              <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 100-2H4V5h5a1 1 0 100-2H3zm10.293 3.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              Cerrar sesión
            </button>
          </form>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main content area — slightly lighter than sidebar */}
      <main className="relative flex-1 overflow-y-auto grain bg-[#111028] light:bg-[#FBFBFF]">
        {/* Ambient aurora glow fixed behind content */}
        <div className="pointer-events-none fixed inset-0 z-0 opacity-60 light:opacity-30">
          <div className="absolute -top-[10%] right-[2%] h-[420px] w-[520px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(84,72,238,0.18), transparent 70%)", filter: "blur(20px)" }} />
          <div className="absolute bottom-[4%] left-[6%] h-[360px] w-[460px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(136,128,245,0.12), transparent 70%)", filter: "blur(20px)" }} />
        </div>
        <div className="relative z-[1]">
          {children}
        </div>
      </main>
      <SugerenciasBubble />
    </div>
  );
}
