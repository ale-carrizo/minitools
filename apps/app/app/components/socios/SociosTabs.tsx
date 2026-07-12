'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Clientes',          href: '/dashboard/socios',        exact: true },
  { label: 'Cobros pendientes', href: '/dashboard/socios/cobros', exact: true },
]

export default function SociosTabs() {
  const pathname = usePathname()

  return (
    <div className="flex border-b border-white/[0.06] mb-6">
      {TABS.map(tab => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              active
                ? 'border-[#8880F5] text-[#8880F5]'
                : 'border-transparent text-white/35 hover:text-white/70'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
