'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PresupuestoShell({
  children,
  borradores = 0,
}: {
  children: React.ReactNode
  borradores?: number
}) {
  const pathname = usePathname()
  const tabs = [
    { label: 'Presupuestos', href: '/dashboard/presupuestos', badge: borradores },
    { label: 'Clientes', href: '/dashboard/presupuestos/clientes' },
    { label: '+ Nuevo', href: '/dashboard/presupuestos/nuevo' },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-white">Generador de Presupuestos</h1>
        <p className="mt-0.5 text-sm text-white/40">Cotizaciones con estado, clientes y PDF descargable</p>
      </div>

      <div className="mb-6 flex w-fit gap-1 rounded-xl border border-white/[0.06] bg-white/[0.04] p-1">
        {tabs.map((tab) => {
          const isActive = tab.href === '/dashboard/presupuestos'
            ? pathname === tab.href || (/^\/dashboard\/presupuestos\/[^/]+(\/editar)?$/.test(pathname))
            : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-[12px] font-medium transition-all ${
                isActive ? 'bg-[#5448EE] text-white shadow-sm' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge ? (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-white/60'}`}>
                  {tab.badge}
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
