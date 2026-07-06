import Link from 'next/link'
import { getRecibos } from '@/lib/actions/recibos'
import { formatCurrency } from '@/types/recibos'

export default async function RecibosPage() {
  const recibos = await getRecibos()

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] text-white/40">{recibos.length} recibo{recibos.length !== 1 ? 's' : ''}</p>
        <Link
          href="/dashboard/recibos/nuevo"
          className="px-4 py-2 text-[12px] font-medium bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl transition-colors"
        >
          + Nuevo recibo
        </Link>
      </div>

      {recibos.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-12 text-center">
          <p className="text-3xl mb-3">🧾</p>
          <p className="text-[15px] text-white/60 mb-1">No hay recibos todavía</p>
          <p className="text-[13px] text-white/30">Creá tu primer recibo de cobro</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden">
          <div className="grid grid-cols-[auto,1fr,1fr,auto,auto] items-center gap-4 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/25 border-b border-white/[0.06]">
            <span>N°</span>
            <span>Recibido de</span>
            <span>Concepto</span>
            <span className="text-right">Monto</span>
            <span />
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recibos.map((r) => (
              <div key={r.id} className="grid grid-cols-[auto,1fr,1fr,auto,auto] items-center gap-4 px-5 py-4 text-[13px] hover:bg-white/[0.02]">
                <span className="text-white/50 font-mono text-[12px]">#{String(r.numero).padStart(4, '0')}</span>
                <div>
                  <p className="font-medium text-white">{r.receptorNombre || '—'}</p>
                  <p className="text-[11px] text-white/30">{r.fecha}</p>
                </div>
                <span className="text-white/45 truncate">{r.concepto}</span>
                <span className="text-right font-medium text-white">{formatCurrency(r.monto)}</span>
                <Link
                  href={`/dashboard/recibos/${r.id}`}
                  className="text-[12px] text-[#8880F5] hover:text-white transition-colors whitespace-nowrap"
                >
                  Ver
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
