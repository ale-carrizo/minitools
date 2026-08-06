import type { Metadata } from 'next'
import Link from 'next/link'
import AppTitle from '@/app/components/AppTitle'

export const metadata: Metadata = {
  title: 'Recibos — Zimple Tools',
}

export default function RecibosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.035em] text-white">
            <AppTitle slug="recibos" fallback="Recibos" />
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Creá y gestioná comprobantes de cobro en PDF
          </p>
        </div>
        <Link
          href="/dashboard/recibos/nuevo"
          className="flex-shrink-0 px-4 py-2 text-[12px] font-medium bg-[#5448EE] hover:bg-[#4438DE] text-white btn-solid-text rounded-xl transition-colors"
        >
          + Nuevo recibo
        </Link>
      </div>
      {children}
    </div>
  )
}
