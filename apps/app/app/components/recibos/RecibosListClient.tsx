'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/types/recibos'
import type { ReciboCobro } from '@/types/recibos'

export default function RecibosListClient({ recibos }: { recibos: ReciboCobro[] }) {
  const [busqueda, setBusqueda] = useState('')

  const mesActual = useMemo(() => new Date().toISOString().slice(0, 7), [])
  const recibosDelMes = useMemo(() => recibos.filter((r) => r.fecha.startsWith(mesActual)), [recibos, mesActual])
  const totalMes = useMemo(() => recibosDelMes.reduce((sum, r) => sum + r.monto, 0), [recibosDelMes])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return recibos
    return recibos.filter((r) =>
      `${r.receptorNombre ?? ''} ${r.concepto} #${String(r.numero).padStart(4, '0')}`.toLowerCase().includes(q))
  }, [recibos, busqueda])

  if (recibos.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-12 text-center">
        <p className="text-3xl mb-3">🧾</p>
        <p className="text-[15px] text-white/60 mb-1">No hay recibos todavía</p>
        <p className="text-[13px] text-white/30">Creá tu primer recibo de cobro</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
          <p className="text-[11px] text-white/40">Total recibos</p>
          <p className="mt-1 text-2xl font-semibold text-white">{recibos.length}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
          <p className="text-[11px] text-white/40">Recibos este mes</p>
          <p className="mt-1 text-2xl font-semibold text-white">{recibosDelMes.length}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
          <p className="text-[11px] text-white/40">Cobrado este mes</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">{formatCurrency(totalMes)}</p>
        </div>
      </div>

      {/* Búsqueda */}
      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por cliente, concepto o número"
        className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
      />

      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.04]">
        <div className="min-w-[500px]">
          <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-4 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/25 border-b border-white/[0.06]">
            <span>N°</span>
            <span>Recibido de</span>
            <span>Concepto</span>
            <span className="text-right">Monto</span>
            <span />
          </div>
          {filtrados.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-white/30">Sin resultados para la búsqueda</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {filtrados.map((r) => (
                <div key={r.id} className="grid grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-4 px-5 py-4 text-[13px] hover:bg-white/[0.02]">
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
          )}
        </div>
      </div>
    </div>
  )
}
