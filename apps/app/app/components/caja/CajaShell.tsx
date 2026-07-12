'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AppTitle from '@/app/components/AppTitle'

const TABS = [
  { id: 'hoy',       label: 'Hoy',         href: '/dashboard/caja' },
  { id: 'registrar', label: '+ Registrar', href: '/dashboard/caja/registrar' },
  { id: 'cierre',    label: 'Cierre',      href: '/dashboard/caja/cierre' },
  { id: 'historial', label: 'Historial',   href: '/dashboard/caja/historial' },
]

export default function CajaShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="px-4 py-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-white tracking-[-0.03em]"><AppTitle slug="caja" fallback="Registro de pagos" /></h1>
        <p className="text-white/40 text-sm mt-0.5 capitalize">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl mb-6 w-fit">
        {TABS.map(t => {
          const isActive = t.id === 'hoy'
            ? pathname === '/dashboard/caja'
            : pathname.startsWith(t.href)
          return (
            <Link
              key={t.id}
              href={t.href}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-[#5448EE] text-white btn-solid-text shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t.label}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
