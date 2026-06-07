'use client'

import Link from 'next/link'
import { useState } from 'react'
import { anularCobro } from '@/lib/actions/caja'
import type { CajaDiaResumen } from '@/types/caja'
import { MEDIO_LABELS } from '@/types/caja'

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  comprobante_ia: { label: 'Comprobante', color: 'text-[#8880F5] bg-[#5448EE]/15' },
  extracto:       { label: 'Extracto',    color: 'text-white/60 bg-white/[0.08]' },
  mercadopago:    { label: 'MP',          color: 'text-sky-400 bg-sky-500/15' },
  manual:         { label: 'Efectivo',    color: 'text-emerald-400 bg-emerald-500/15' },
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0
  }).format(n)
}

export default function CobroList({ resumen }: { resumen: CajaDiaResumen }) {
  const { dia, cobros, total, por_source, cantidad } = resumen
  const [anulando, setAnulando] = useState<string | null>(null)
  const transferencias = por_source.comprobante_ia + por_source.extracto + por_source.mercadopago

  async function handleAnular(id: string) {
    if (!confirm('¿Anular este cobro?')) return
    setAnulando(id)
    try { await anularCobro(id) }
    catch (err: any) { alert(err.message) }
    finally { setAnulando(null) }
  }

  return (
    <div>
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total del día', value: formatMoney(total), color: 'text-emerald-400' },
          { label: 'Transferencias', value: formatMoney(transferencias), color: 'text-[#8880F5]' },
          { label: 'Efectivo', value: formatMoney(por_source.manual), color: 'text-white' },
        ].map(card => (
          <div key={card.label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[11px] text-white/40 mb-1">{card.label}</p>
            <p className={`text-lg font-semibold leading-none ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Header lista */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
          Cobros del día · {cantidad}
        </span>
        <Link
          href="/dashboard/caja/registrar"
          className="text-[12px] text-[#8880F5] font-medium hover:text-white transition-colors"
        >
          + agregar
        </Link>
      </div>

      {/* Lista */}
      {cobros.length === 0 ? (
        <div className="py-16 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <p className="text-white/30 text-sm mb-3">No hay cobros registrados hoy</p>
          <Link
            href="/dashboard/caja/registrar"
            className="text-[13px] text-[#8880F5] font-medium"
          >
            Registrar el primero →
          </Link>
        </div>
      ) : (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
          {cobros.map(cobro => {
            const src = SOURCE_CONFIG[cobro.source]
            return (
              <div key={cobro.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors group">
                {/* Ícono */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${src.color}`}>
                  {cobro.source === 'comprobante_ia' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" d="M9 12h6M9 16h4M5 20h14a2 2 0 002-2V8l-5-5H5a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  )}
                  {cobro.source === 'extracto' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" d="M3 12h18M3 6h18M3 18h18"/>
                    </svg>
                  )}
                  {cobro.source === 'mercadopago' && (
                    <span className="text-[10px] font-bold">MP</span>
                  )}
                  {cobro.source === 'manual' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">
                    {cobro.emisor_nombre ?? cobro.concepto ?? MEDIO_LABELS[cobro.medio]}
                  </p>
                  <p className="text-[11px] text-white/35 mt-0.5">
                    {cobro.hora_cobro?.slice(0, 5)}
                    {cobro.emisor_banco && ` · ${cobro.emisor_banco}`}
                    {cobro.referencia  && ` · ${cobro.referencia.slice(0, 14)}…`}
                  </p>
                </div>

                {/* Badge */}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${src.color}`}>
                  {src.label}
                </span>

                {/* Monto */}
                <p className="text-[13px] font-semibold text-white flex-shrink-0">
                  {formatMoney(cobro.monto)}
                </p>

                {/* Anular */}
                {!dia.cerrada && (
                  <button
                    onClick={() => handleAnular(cobro.id)}
                    disabled={anulando === cobro.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400 text-[10px] flex-shrink-0 disabled:opacity-30"
                    title="Anular cobro"
                  >
                    ✕
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Caja cerrada badge */}
      {dia.cerrada && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <span className="text-[12px] text-white/40">🔒</span>
          <p className="text-[12px] text-white/40">
            Caja cerrada
            {dia.cerrada_at && ` · ${new Date(dia.cerrada_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`}
            {dia.nota_cierre && ` · "${dia.nota_cierre}"`}
          </p>
        </div>
      )}
    </div>
  )
}
