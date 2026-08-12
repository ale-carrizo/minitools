'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { getCobrosEnRango, posponerCobro } from '@/lib/actions/socios'
import { todayAR } from '@/lib/date'
import { COBRO_STATUS_CONFIG, frecuenciaDetallada } from '@/types/socios'
import type { CobroProgramado, Socio } from '@/types/socios'
import { WAButton } from './WAButton'
import PagarModal from './PagarModal'

type Vista = 'dia' | 'semana' | 'mes'

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}
function fmtFecha(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
function startOfWeek(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return d.toISOString().slice(0, 10)
}
function startOfMonth(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}
function endOfMonth(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)
}
function rangoPara(vista: Vista, fecha: string): { desde: string; hasta: string } {
  if (vista === 'dia') return { desde: fecha, hasta: fecha }
  if (vista === 'mes') return { desde: startOfMonth(fecha), hasta: endOfMonth(fecha) }
  const desde = startOfWeek(fecha)
  return { desde, hasta: addDays(desde, 6) }
}

interface Props { cobrosIniciales: CobroProgramado[] }

export default function CalendarioClient({ cobrosIniciales }: Props) {
  const hoy = todayAR()
  const [vista, setVista] = useState<Vista>('semana')
  const [fecha, setFecha] = useState(hoy)
  const [cobros, setCobros] = useState(cobrosIniciales)
  const [pagarSel, setPagar] = useState<CobroProgramado | null>(null)
  const [pospSel, setPosp] = useState<CobroProgramado | null>(null)
  const [, startTrans] = useTransition()

  const { desde, hasta } = rangoPara(vista, fecha)

  function recargar(nuevaVista: Vista, nuevaFecha: string) {
    const { desde: d, hasta: h } = rangoPara(nuevaVista, nuevaFecha)
    startTrans(async () => {
      setCobros(await getCobrosEnRango(d, h))
    })
  }

  const pendientes = cobros.filter((c) => c.estado !== 'pagado' && c.estado !== 'cancelado')
  const vencidos = pendientes.filter((c) => c.estado === 'vencido')
  const totalPendiente = pendientes.reduce((a, c) => a + c.monto, 0)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">Vista</label>
            <select value={vista} onChange={(e) => { const v = e.target.value as Vista; setVista(v); recargar(v, fecha) }}
              className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60">
              <option value="dia">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">Fecha</label>
            <input type="date" value={fecha} onChange={(e) => { setFecha(e.target.value); recargar(vista, e.target.value) }}
              className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <span className="ml-auto rounded-full bg-white/[0.06] text-white/60 text-[12px] font-semibold px-3 py-1.5">
            {fmtFecha(desde)} – {fmtFecha(hasta)}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2">
            <span className="text-[11px] font-semibold text-white/40 mr-2">Pendiente</span>
            <strong className="text-[13px] text-white">{fmt(totalPendiente)}</strong>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2">
            <span className="text-[11px] font-semibold text-white/40 mr-2">Cobros</span>
            <strong className="text-[13px] text-white">{pendientes.length}</strong>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2">
            <span className="text-[11px] font-semibold text-red-400 mr-2">Vencidos</span>
            <strong className="text-[13px] text-red-300">{vencidos.length}</strong>
          </div>
        </div>
      </div>

      {pendientes.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-sm font-medium text-white/70">Sin cobros para este período</p>
          <Link href="/dashboard/socios/nuevo" className="inline-block mt-6 rounded-xl bg-[#5448EE] px-4 py-2 text-[12px] font-medium text-white btn-solid-text hover:bg-[#4438DE]">
            + Agregar cliente
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.09] overflow-x-auto">
          <table className="w-full min-w-[820px] text-[12px]">
            <thead>
              <tr className="text-white/35 text-[11px] uppercase">
                <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Fecha</th>
                <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Cliente</th>
                <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Teléfono</th>
                <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Frecuencia</th>
                <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Estado</th>
                <th className="text-right px-2.5 py-2 border-b border-white/[0.06]">Monto</th>
                <th className="text-right px-2.5 py-2 border-b border-white/[0.06]">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((cobro) => {
                const socio = cobro.socio as any as Socio
                const cfg = COBRO_STATUS_CONFIG[cobro.estado]
                return (
                  <tr key={cobro.id} className="text-white/80">
                    <td className="px-2.5 py-2.5 border-b border-white/[0.04] font-medium text-white">{fmtFecha(cobro.fechaVencimiento)}</td>
                    <td className="px-2.5 py-2.5 border-b border-white/[0.04]">{socio.nombre}</td>
                    <td className="px-2.5 py-2.5 border-b border-white/[0.04] text-white/50">{socio.telefono}</td>
                    <td className="px-2.5 py-2.5 border-b border-white/[0.04] text-white/50">{frecuenciaDetallada(socio.frecuencia, socio.diaVencimiento)}</td>
                    <td className="px-2.5 py-2.5 border-b border-white/[0.04]">
                      <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: cfg.text, background: cfg.dot + '26' }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-white/[0.04] text-right font-semibold text-white tabular-nums">{fmt(cobro.monto)}</td>
                    <td className="px-2.5 py-2.5 border-b border-white/[0.04]">
                      <div className="flex justify-end items-center gap-1.5">
                        <button onClick={() => setPagar(cobro)}
                          className="rounded-lg bg-[#5448EE] px-2.5 py-1.5 text-[11px] font-semibold text-white btn-solid-text hover:bg-[#4438DE] transition-colors whitespace-nowrap">
                          Marcar como Pagado
                        </button>
                        <WAButton socio={socio} cobro={cobro} />
                        <button onClick={() => setPosp(cobro)} title="Posponer"
                          className="w-8 h-8 rounded-lg bg-white/[0.04] text-white/40 border border-white/[0.08] flex items-center justify-center text-xs hover:text-white hover:bg-white/[0.08] transition-colors flex-shrink-0">
                          ⏱
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagarSel && (
        <PagarModal
          cobro={pagarSel}
          nombre={(pagarSel.socio as any)?.nombre ?? ''}
          onClose={() => setPagar(null)}
          onDone={() => {
            setCobros((prev) => prev.map((c) => (c.id === pagarSel.id ? { ...c, estado: 'pagado' } : c)))
            setPagar(null)
          }}
        />
      )}

      {pospSel && (
        <PosponerModal
          cobro={pospSel}
          onClose={() => setPosp(null)}
          onConfirm={async (nuevaFecha) => {
            await posponerCobro(pospSel.id, nuevaFecha)
            setPosp(null)
            recargar(vista, fecha)
          }}
        />
      )}
    </div>
  )
}

function PosponerModal({ cobro, onClose, onConfirm }: {
  cobro: CobroProgramado
  onClose: () => void
  onConfirm: (fecha: string) => Promise<void>
}) {
  const def = addDays(todayAR(), 7)
  const [fecha, setFecha] = useState(def)
  const [loading, setLoading] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl border border-white/[0.10] light:border-black/[0.10] bg-[#1A1830] light:bg-[#ffffff] p-5 w-full max-w-xs shadow-xl">
        <h3 className="text-[14px] font-semibold text-white mb-1">Posponer cobro</h3>
        <p className="text-[11px] text-white/40 mb-4">
          {(cobro.socio as any)?.nombre} · {fmt(cobro.monto)}
        </p>
        <label className="block text-[11px] text-white/40 mb-1.5">Nueva fecha de vencimiento</label>
        <input type="date" value={fecha} min={todayAR()} onChange={(e) => setFecha(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-white/[0.09] bg-white/[0.05] text-[12px] text-white mb-4 focus:outline-none focus:border-[#5448EE]/60" />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-[12px] text-white/50 border border-white/10 rounded-xl hover:text-white transition-colors">
            Cancelar
          </button>
          <button onClick={async () => { setLoading(true); await onConfirm(fecha); setLoading(false) }} disabled={loading}
            className="flex-[2] py-2.5 text-[12px] font-medium text-white btn-solid-text bg-[#5448EE] rounded-xl hover:bg-[#4438DE] disabled:opacity-50">
            {loading ? 'Guardando…' : 'Posponer'}
          </button>
        </div>
      </div>
    </div>
  )
}
