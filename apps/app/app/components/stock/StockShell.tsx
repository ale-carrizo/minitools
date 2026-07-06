'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  children:    React.ReactNode
  alertas?:    number
}

export default function StockShell({ children, alertas = 0 }: Props) {
  const pathname = usePathname()

  const tabs = [
    { label: 'Inventario', href: '/dashboard/stock' },
    { label: alertas > 0 ? `Alertas  ${alertas}` : 'Alertas', href: '/dashboard/stock/alertas' },
    { label: '+ Producto', href: '/dashboard/stock/nuevo' },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-white tracking-[-0.03em]">Control de Stock</h1>
        <p className="text-white/40 text-sm mt-0.5">Inventario y alertas de stock mínimo</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl mb-6 w-fit">
        {tabs.map(t => {
          const isActive = t.href === '/dashboard/stock'
            ? pathname === '/dashboard/stock'
            : pathname.startsWith(t.href)
          const isAlerta = t.href.includes('alertas') && alertas > 0
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#5448EE] text-[#ffffff] shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t.href.includes('alertas') && alertas > 0
                ? <>Alertas <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-red-500/80 text-white'}`}>{alertas}</span></>
                : t.label
              }
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
