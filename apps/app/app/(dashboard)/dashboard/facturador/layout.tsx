import type { Metadata } from 'next'
import AppTitle from '@/app/components/AppTitle'

export const metadata: Metadata = {
  title: 'Facturador — Zimple Tools',
}

export default function FacturadorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.035em] text-white">
          <AppTitle slug="facturador" fallback="Facturador" />
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Facturas electrónicas C con CAE de ARCA, directo desde tu cuenta
        </p>
      </div>
      {children}
    </div>
  )
}
