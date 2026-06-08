'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: '📋 Hoy', href: '/dashboard/asistencia' },
  { label: '📅 Historial', href: '/dashboard/asistencia/historial' },
  { label: '👥 Empleados', href: '/dashboard/asistencia/empleados' },
] as const

export default function AsistenciaShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-white tracking-[-0.03em]">Control de Asistencia</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Registrá entradas, salidas y horas trabajadas del personal
        </p>
      </div>

      <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl mb-8 w-fit">
        {tabs.map((tab) => {
          const isActive = tab.href === '/dashboard/asistencia'
            ? pathname === '/dashboard/asistencia'
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
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
