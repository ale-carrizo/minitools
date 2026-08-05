import type { Metadata } from 'next'
import AppTitle from '@/app/components/AppTitle'

export const metadata: Metadata = {
  title: 'Reportes — Zimple Tools',
}

export default function ReportesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.035em] text-white">
          <AppTitle slug="reportes" fallback="Reportes" />
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Un vistazo a ventas, presupuestos, clientes y tareas de todo Zimple
        </p>
      </div>
      {children}
    </div>
  )
}
