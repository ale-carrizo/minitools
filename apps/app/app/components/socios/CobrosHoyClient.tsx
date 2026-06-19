'use client'

import { useState, useTransition } from 'react'
import { pagarCobro, posponerCobro } from '@/lib/actions/socios'
import { WAButton } from './WAButton'
import type { CobroProgramado, Socio } from '@/types/socios'
import Link from 'next/link'

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n)
}

function fmtFecha(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

interface Props {
  vencidos:        CobroProgramado[]
  estaSemana:      CobroProgramado[]
  totalVencido:    number
  totalEstaSemana: number
}

export default function CobrosHoyClient({ vencidos, estaSemana, totalVencido, totalEstaSemana }: Props) {
  const [pagados, setPagados]     = useState<Set<string>>(new Set())
  const [, startTrans]            = useTransition()
  const [pospModal, setPospModal] = useState<CobroProgramado | null>(null)

  const isEmpty = vencidos.length === 0 && estaSemana.length === 0

  function handlePagar(cobro: CobroProgramado) {
    startTrans(async () => {
      await pagarCobro(cobro.id)
      setPagados(prev => new Set(prev).add(cobro.id))
    })
  }

  if (isEmpty) {
    return (
      <div className="py-20 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-sm font-medium text-white/70">Todo al día</p>
        <p className="text-xs text-white/30 mt-1">No hay cobros pendientes ni vencidos</p>
        <Link href="/dashboard/socios/nuevo" className="inline-block mt-6 rounded-xl bg-[#5448EE] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#4438DE]">
          + Agregar cliente
        </Link>
      </div>
    )
  }

  const vencidosActivos  = vencidos.filter(c => !pagados.has(c.id))
  const semanaActivos    = estaSemana.filter(c => !pagados.has(c.id))

  return (
    <div className="space-y-5">
      {/* Banners resumen */}
      <div className="grid grid-cols-2 gap-3">
        {vencidosActivos.length > 0 && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wide mb-1">Vencidos</p>
            <p className="text-2xl font-bold text-red-300">{vencidosActivos.length}</p>
            <p className="text-[12px] text-red-400/70 mt-0.5">{fmt(vencidosActivos.reduce((a,c) => a+c.monto, 0))}</p>
          </div>
        )}
        {semanaActivos.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide mb-1">Esta semana</p>
            <p className="text-2xl font-bold text-amber-300">{semanaActivos.length}</p>
            <p className="text-[12px] text-amber-400/70 mt-0.5">{fmt(semanaActivos.reduce((a,c) => a+c.monto, 0))}</p>
          </div>
        )}
      </div>

      {/* Vencidos */}
      {vencidosActivos.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wide mb-2">⚠ Vencidos</p>
          <CobroGroup cobros={vencidosActivos} onPagar={handlePagar} onPosponer={setPospModal} showSnooze={false} />
        </div>
      )}

      {/* Esta semana */}
      {semanaActivos.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide mb-2">📅 Esta semana</p>
          <CobroGroup cobros={semanaActivos} onPagar={handlePagar} onPosponer={setPospModal} showSnooze />
        </div>
      )}

      {/* Modal posponer */}
      {pospModal && (
        <PosponerModal
          cobro={pospModal}
          onClose={() => setPospModal(null)}
          onConfirm={async (fecha) => {
            await posponerCobro(pospModal.id, fecha)
            setPospModal(null)
          }}
        />
      )}
    </div>
  )
}

// ── Lista de cobros ───────────────────────────────────────────────────────────
function CobroGroup({ cobros, onPagar, onPosponer, showSnooze }: {
  cobros:     CobroProgramado[]
  onPagar:    (c: CobroProgramado) => void
  onPosponer: (c: CobroProgramado) => void
  showSnooze: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
      {cobros.map((cobro, idx) => {
        const socio = cobro.socio as any as Socio
        const ini   = socio.nombre.split(' ').slice(0, 2).map((w: string) => w[0]).join('')
        return (
          <div key={cobro.id} className={`flex items-center gap-3 px-4 py-3.5 ${idx !== cobros.length - 1 ? 'border-b border-white/[0.06]' : ''}`}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ background: socio.avatarColor }}
            >
              {ini}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">{socio.nombre}</p>
              <p className="text-[11px] text-white/35 mt-0.5">
                {cobro.concepto ?? 'Cuota'} · vence {fmtFecha(cobro.fechaVencimiento)}
              </p>
            </div>
            <span className="text-[13px] font-semibold text-white tabular-nums flex-shrink-0">{fmt(cobro.monto)}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <WAButton socio={socio} cobro={cobro} />
              <button
                onClick={() => onPagar(cobro)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
              >
                ✓ Pagó
              </button>
              {showSnooze && (
                <button
                  onClick={() => onPosponer(cobro)}
                  title="Posponer"
                  className="w-8 h-8 rounded-lg bg-white/[0.04] text-white/40 border border-white/[0.08] flex items-center justify-center text-xs hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  ⏱
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Modal posponer ────────────────────────────────────────────────────────────
function PosponerModal({ cobro, onClose, onConfirm }: {
  cobro:     CobroProgramado
  onClose:   () => void
  onConfirm: (fecha: string) => Promise<void>
}) {
  const def = new Date(); def.setDate(def.getDate() + 7)
  const [fecha, setFecha]   = useState(def.toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl border border-white/[0.10] bg-[#1A1830] p-5 w-full max-w-xs shadow-xl">
        <h3 className="text-[14px] font-semibold text-white mb-1">Posponer cobro</h3>
        <p className="text-[11px] text-white/40 mb-4">
          {(cobro.socio as any)?.nombre} · {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(cobro.monto)}
        </p>
        <label className="block text-[11px] text-white/40 mb-1.5">Nueva fecha de vencimiento</label>
        <input
          type="date"
          value={fecha}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => setFecha(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-white/[0.09] bg-white/[0.05] text-[12px] text-white mb-4 focus:outline-none focus:border-[#5448EE]/60"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-[12px] text-white/50 border border-white/10 rounded-xl hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(fecha); setLoading(false) }}
            disabled={loading}
            className="flex-[2] py-2.5 text-[12px] font-medium text-white bg-[#5448EE] rounded-xl hover:bg-[#4438DE] disabled:opacity-50"
          >
            {loading ? 'Guardando…' : 'Posponer'}
          </button>
        </div>
      </div>
    </div>
  )
}
