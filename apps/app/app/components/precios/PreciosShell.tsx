'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AppTitle from '@/app/components/AppTitle'

const tabs = [
  { label: '💰 Precio de venta', href: '/dashboard/precios' },
  { label: '⚖️ Punto de equilibrio', href: '/dashboard/precios/equilibrio' },
  { label: '📊 Comparador', href: '/dashboard/precios/comparador' },
] as const

export default function PreciosShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="px-4 py-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-white tracking-[-0.03em]">
          <AppTitle slug="precios" fallback="Calculadora de Precios" />
        </h1>
        <p className="text-white/40 text-sm mt-0.5">
          Calculá precios de venta, margen, IVA y punto de equilibrio
        </p>
      </div>

      <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl mb-8 w-fit">
        {tabs.map((t) => {
          const isActive = t.href === '/dashboard/precios'
            ? pathname === '/dashboard/precios'
            : pathname.startsWith(t.href)

          return (
            <Link
              key={t.href}
              href={t.href}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-lg transition-all whitespace-nowrap ${
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
