import type { Metadata } from 'next'
import AppTitle from '@/app/components/AppTitle'

export const metadata: Metadata = {
  title: 'Recibos — Zimple Tools',
}

export default function RecibosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.035em] text-white">
          <AppTitle slug="recibos" fallback="Recibos" />
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Creá y gestioná comprobantes de cobro en PDF
        </p>
      </div>
      {children}
    </div>
  )
}
