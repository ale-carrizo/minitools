'use client'

import { useState } from 'react'
import type { CajaDia } from '@/types/caja'

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0
  }).format(n)
}

function fmtFecha(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

function fmtHora(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function groupByMonth(dias: CajaDia[]) {
  const groups: Record<string, CajaDia[]> = {}
  dias.forEach(d => {
    const key = d.fecha.slice(0, 7)
    if (!groups[key]) groups[key] = []
    groups[key].push(d)
  })
  return Object.entries(groups)
}

function monthLabel(key: string) {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

export default function HistorialList({ dias }: { dias: CajaDia[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const groups   = groupByMonth(dias)
  const abiertos = dias.filter(d => !d.cerrada)
  const cerrados = dias.filter(d => d.cerrada)

  if (dias.length === 0) {
    return (
      <div className="py-20 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl">
        <p className="text-white/30 text-sm">No hay días registrados aún</p>
      </div>
    )
  }

  return (
    <div>
      {/* Resumen */}
      {cerrados.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[11px] text-white/40 mb-1">Días cerrados</p>
            <p className="text-xl font-semibold text-white">{cerrados.length}</p>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[11px] text-white/40 mb-1">Total histórico</p>
            <p className="text-xl font-semibold text-emerald-400">
              {fmt(cerrados.reduce((a, d) => a + d.total_cache, 0))}
            </p>
          </div>
        </div>
      )}

      {/* Día abierto */}
      {abiertos.map(dia => (
        <div key={dia.id} className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-2">Hoy — en curso</p>
          <div className="flex items-center gap-3 px-4 py-3.5 border border-[#5448EE]/30 bg-[#5448EE]/10 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-[#5448EE]/20 flex items-center justify-center text-sm flex-shrink-0">
              📂
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-white capitalize">{fmtFecha(dia.fecha)}</p>
              <p className="text-[11px] text-[#8880F5] mt-0.5">Caja abierta</p>
            </div>
            <p className="text-[14px] font-semibold text-emerald-400">{fmt(dia.total_cache)}</p>
          </div>
        </div>
      ))}

      {/* Grupos por mes */}
      {groups.map(([month, monthDias]) => (
        <div key={month} className="mb-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 capitalize">
              {monthLabel(month)}
            </p>
            <p className="text-[11px] text-white/40">
              {fmt(monthDias.filter(d => d.cerrada).reduce((a, d) => a + d.total_cache, 0))}
            </p>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
            {monthDias.map(dia => (
              <div key={dia.id}>
                <div
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors"
                  onClick={() => setExpanded(expanded === dia.id ? null : dia.id)}
                >
                  <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-sm flex-shrink-0">
                    {dia.cerrada ? '🔒' : '📂'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white capitalize">{fmtFecha(dia.fecha)}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      {dia.cerrada ? `Cerrada ${fmtHora(dia.cerrada_at)}` : 'Abierta'}
                    </p>
                  </div>
                  <p className="text-[13px] font-semibold text-emerald-400 flex-shrink-0">
                    {fmt(dia.total_cache)}
                  </p>
                  <svg
                    className={`w-4 h-4 text-white/20 flex-shrink-0 transition-transform ${expanded === dia.id ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6"/>
                  </svg>
                </div>

                {expanded === dia.id && (
                  <div className="px-4 py-3 bg-white/[0.02] border-t border-white/[0.04] space-y-1">
                    {dia.nota_cierre && (
                      <p className="text-[11px] text-white/40 italic">"{dia.nota_cierre}"</p>
                    )}
                    <p className="text-[11px] text-white/40">
                      Total: <span className="font-medium text-white/70">{fmt(dia.total_cache)}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
