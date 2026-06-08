'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: '🛡️ Garantías', href: '/dashboard/garantias' },
  { label: 'Alertas', href: '/dashboard/garantias/alertas' },
  { label: '+ Nueva', href: '/dashboard/garantias/nuevo' },
] as const

export default function GarantiasShell({
  children,
  alertas = 0,
}: {
  children: React.ReactNode
  alertas?: number
}) {
  const pathname = usePathname()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-white tracking-[-0.03em]">Seguimiento de Garantías</h1>
        <p className="text-white/40 text-sm mt-0.5">Controlá vencimientos y reclamos de garantías</p>
      </div>

      <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl mb-8 w-fit">
        {tabs.map((tab) => {
          const isActive = tab.href === '/dashboard/garantias'
            ? pathname === '/dashboard/garantias' || /^\/dashboard\/garantias\/[^/]+(\/editar)?$/.test(pathname)
            : pathname.startsWith(tab.href)

          const label = tab.href === '/dashboard/garantias/alertas' && alertas > 0 ? '⚠️ Alertas' : tab.label

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-lg transition-all ${
                isActive ? 'bg-[#5448EE] text-white shadow-sm' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {label}
              {tab.href === '/dashboard/garantias/alertas' && alertas > 0 ? (
                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive ? 'bg-red-500/30 text-white' : 'bg-red-500/15 text-red-300'
                }`}>
                  {alertas}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
