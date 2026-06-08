'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: '📄 Recibos', href: '/dashboard/sueldos' },
  { label: '+ Nuevo recibo', href: '/dashboard/sueldos/nuevo' },
  { label: '⚙️ Configuración', href: '/dashboard/sueldos/config' },
] as const

export default function SueldosShell({
  children,
  borradores = 0,
}: {
  children: React.ReactNode
  borradores?: number
}) {
  const pathname = usePathname()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-white tracking-[-0.03em]">Recibo de Sueldo</h1>
        <p className="text-white/40 text-sm mt-0.5">Emití recibos para empleados y monotributistas en PDF</p>
      </div>

      <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl mb-8 w-fit">
        {tabs.map((tab) => {
          const isActive = tab.href === '/dashboard/sueldos'
            ? pathname === '/dashboard/sueldos' || /^\/dashboard\/sueldos\/[^/]+(\/editar)?$/.test(pathname)
            : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-lg transition-all ${
                isActive ? 'bg-[#5448EE] text-white shadow-sm' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
              {tab.href === '/dashboard/sueldos' && borradores > 0 ? (
                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? 'bg-white/20' : 'bg-white/[0.06] text-white/60'}`}>
                  {borradores}
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
