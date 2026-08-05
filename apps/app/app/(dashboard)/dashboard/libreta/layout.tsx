import type { Metadata } from 'next'
import AppTitle from '@/app/components/AppTitle'

export const metadata: Metadata = {
  title: 'Libreta de ventas — Zimple Tools',
}

export default function LibretaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.035em] text-white">
          <AppTitle slug="libreta" fallback="Libreta de ventas" />
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Caja diaria simple con carga rápida de ventas
        </p>
      </div>
      {children}
    </div>
  )
}
