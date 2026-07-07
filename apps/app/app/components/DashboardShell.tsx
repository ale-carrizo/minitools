'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import SugerenciasBubble from '@/app/components/SugerenciasBubble'
import DashboardNav from '@/app/components/DashboardNav'
import { ZimpleIcon } from '@/app/components/ZimpleLogo'
import ThemeToggle from '@/app/components/ThemeToggle'

export default function DashboardShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; role?: string | null }
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut({ redirectTo: '/login' })
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#0C0B1A] light:bg-[#F7F7FB] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[232px] flex-shrink-0 flex flex-col border-r border-white/[0.06] overflow-y-auto no-scrollbar bg-[#0C0B1A] light:bg-[#fff] transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-[52px] border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <ZimpleIcon size={28} />
            <span className="font-display text-white font-extrabold text-[15px] tracking-[-0.02em]">Zimple Tools</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-4">
          <DashboardNav onNavigate={() => setSidebarOpen(false)} />
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-3 py-3 space-y-0.5">
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setSidebarOpen(false)}
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
              {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/70 truncate">{user.name ?? 'Usuario'}</p>
              <p className="text-[10px] text-white/30 truncate">{user.email}</p>
            </div>
          </div>
          <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-red-400 hover:bg-white/[0.04] transition-colors text-left disabled:opacity-50"
            >
              <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 100-2H4V5h5a1 1 0 100-2H3zm10.293 3.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              {signingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </button>
          <ThemeToggle />
        </div>
      </aside>

      {/* Hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 w-9 h-9 rounded-lg bg-[#0C0B1A]/80 backdrop-blur-sm border border-white/[0.10] flex items-center justify-center text-white/70 hover:text-white transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
        </svg>
      </button>

      {/* Main content */}
      <main className="relative flex-1 overflow-y-auto grain bg-[#111028] light:bg-[#FBFBFF]">
        <div className="pointer-events-none fixed inset-0 z-0 opacity-60 light:opacity-30">
          <div className="absolute -top-[10%] right-[2%] h-[420px] w-[520px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(84,72,238,0.18), transparent 70%)', filter: 'blur(20px)' }} />
          <div className="absolute bottom-[4%] left-[6%] h-[360px] w-[460px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(136,128,245,0.12), transparent 70%)', filter: 'blur(20px)' }} />
        </div>
        <div className="relative z-[1]">
          {children}
        </div>
      </main>
      <SugerenciasBubble />
    </div>
  )
}
