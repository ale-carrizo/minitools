import Link from 'next/link'
import SociosTabs from '@/app/components/socios/SociosTabs'

export default function SociosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.035em] text-white">
            Clientes y Pagos
          </h1>
          <p className="text-white/40 text-sm mt-1">Cobranza recurrente con recordatorios por WhatsApp</p>
        </div>
        <Link
          href="/dashboard/socios/nuevo"
          className="rounded-xl bg-[#5448EE] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#4438DE] transition-colors"
        >
          + Nuevo cliente
        </Link>
      </div>

      <SociosTabs />

      {children}
    </div>
  )
}
