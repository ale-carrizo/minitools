'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { duplicarRecibo, eliminarRecibo } from '@/lib/actions/recibo'
import { formatCurrency, formatFecha, formatPeriodo, type Recibo, type ReciboConfig } from '@/types/recibo'
import EstadoBadge from './EstadoBadge'

export default function RecibosList({
  recibos,
  config,
}: {
  recibos: Recibo[]
  config: ReciboConfig | null
}) {
  const [query, setQuery] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [estado, setEstado] = useState<'todos' | 'borrador' | 'emitido'>('todos')
  const [isPending, startTransition] = useTransition()

  const periodos = [...new Set(recibos.map((recibo) => recibo.periodo))]

  const filtered = useMemo(() => recibos.filter((recibo) => {
    const matchQuery = !query.trim() || recibo.empNombre.toLowerCase().includes(query.toLowerCase())
    const matchPeriodo = !periodo || recibo.periodo === periodo
    const matchEstado = estado === 'todos' || recibo.estado === estado
    return matchQuery && matchPeriodo && matchEstado
  }), [estado, periodo, query, recibos])

  const now = new Date()
  const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const mesRecibos = recibos.filter((recibo) => recibo.periodo === mesActual)
  const emitidos = recibos.filter((recibo) => recibo.estado === 'emitido').length
  const borradores = recibos.filter((recibo) => recibo.estado === 'borrador').length
  const netoMes = mesRecibos.reduce((sum, recibo) => sum + recibo.netoAPagar, 0)

  return (
    <div className="space-y-5">
      {!config ? (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-[13px] text-yellow-300">
          ⚠️ Configurá los datos del empleador antes de emitir recibos. <Link href="/dashboard/sueldos/config" className="underline">Ir a configuración</Link>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Total recibos del mes', value: mesRecibos.length, className: 'text-white' },
          { label: 'Neto total pagado este mes', value: formatCurrency(netoMes), className: 'text-white' },
          { label: 'Borradores pendientes', value: borradores, className: 'text-white' },
          { label: 'Emitidos', value: emitidos, className: 'text-white' },
        ].map((item) => (
          <div key={item.label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[11px] text-white/40 mb-1">{item.label}</p>
            <p className={`text-[22px] font-semibold ${item.className}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por empleado..."
          className="min-w-[240px] flex-1 px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
        />
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
        >
          <option value="">Todos los períodos</option>
          {periodos.map((item) => <option key={item} value={item}>{formatPeriodo(item)}</option>)}
        </select>
        <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl">
          {(['todos', 'borrador', 'emitido'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setEstado(value)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-lg ${
                estado === value ? 'bg-[#5448EE] text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {value === 'todos' ? 'Todos' : value === 'borrador' ? 'Borradores' : 'Emitidos'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-white/50 text-sm mb-1">No hay recibos todavía</p>
          <p className="text-white/30 text-xs mb-5">Creá el primero para empezar</p>
          <Link href="/dashboard/sueldos/nuevo" className="inline-flex bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium">
            + Crear primer recibo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((recibo) => (
            <div key={recibo.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <EstadoBadge estado={recibo.estado} />
                    <h3 className="text-[18px] font-semibold text-white">{recibo.empNombre}</h3>
                    <span className="text-[13px] text-white/35">— {recibo.empCargo ?? 'Sin cargo'}</span>
                  </div>
                  <p className="text-[13px] text-white/40">Período: {formatPeriodo(recibo.periodo)} · Pago: {formatFecha(recibo.fechaPago)}</p>
                  <div className="flex flex-wrap gap-4 text-[13px]">
                    <span className="text-emerald-400">Haberes: {formatCurrency(recibo.totalHaberes)}</span>
                    <span className="text-red-400">Deducciones: -{formatCurrency(recibo.totalDeducciones)}</span>
                    <span className="text-white font-semibold">Neto: {formatCurrency(recibo.netoAPagar)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/sueldos/${recibo.id}`} className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium">Ver</Link>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      const nuevoPeriodo = window.prompt('Nuevo período (YYYY-MM)', recibo.periodo)
                      if (!nuevoPeriodo) return
                      startTransition(async () => {
                        await duplicarRecibo(recibo.id, nuevoPeriodo)
                      })
                    }}
                    className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium disabled:opacity-50"
                  >
                    Duplicar
                  </button>
                  <a href={`/api/recibos/${recibo.id}/pdf`} target="_blank" className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium">
                    PDF
                  </a>
                  {recibo.estado === 'borrador' ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (!window.confirm(`¿Eliminar el recibo de ${recibo.empNombre}?`)) return
                        startTransition(async () => {
                          await eliminarRecibo(recibo.id)
                        })
                      }}
                      className="border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl px-3 py-2 text-[12px] font-medium disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
