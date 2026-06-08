'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { crearLiquidacion } from '@/lib/actions/liquidacion'
import { ESTADO_CONFIG, formatPeriodo, periodoActual, periodoAnterior, type Liquidacion } from '@/types/liquidacion'

function buildPeriodOptions() {
  const current = periodoActual()
  const options = [current]
  let cursor = current
  for (let i = 0; i < 11; i += 1) {
    cursor = periodoAnterior(cursor)
    options.push(cursor)
  }
  const [y, m] = current.split('-').map(Number)
  const next = new Date(y, m, 1)
  options.unshift(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`)
  return Array.from(new Set(options))
}

export default function LiquidacionesList({
  liquidaciones,
}: {
  liquidaciones: Array<Liquidacion & { _count: { items: number } }>
}) {
  const [showNew, setShowNew] = useState(false)
  const [periodo, setPeriodo] = useState(periodoActual())
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const options = useMemo(() => buildPeriodOptions(), [])

  function handleCreate() {
    setError(null)
    startTransition(async () => {
      try {
        await crearLiquidacion(periodo)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo crear la liquidación')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-semibold text-[16px]">Períodos</h2>
          <p className="text-white/35 text-[13px] mt-1">Armá una liquidación por cada mes trabajado.</p>
        </div>
        <button onClick={() => setShowNew((prev) => !prev)} className="bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
          + Nueva liquidación
        </button>
      </div>

      {showNew ? (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 space-y-3 max-w-md">
          <label className="text-[12px] text-white/50">Período</label>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60">
            {options.map((option) => <option key={option} value={option}>{formatPeriodo(option)}</option>)}
          </select>
          {error ? <p className="text-[12px] text-red-300">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNew(false)} className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Cancelar</button>
            <button onClick={handleCreate} disabled={isPending} className="bg-[#5448EE] hover:bg-[#4438DE] disabled:opacity-70 text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Crear</button>
          </div>
        </div>
      ) : null}

      {liquidaciones.length === 0 ? (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-10 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-white font-medium">No hay liquidaciones creadas</p>
          <p className="text-white/35 text-sm mt-1">Comenzá registrando el primer período</p>
        </div>
      ) : (
        <div className="space-y-3">
          {liquidaciones.map((liquidacion) => {
            const estado = ESTADO_CONFIG[liquidacion.estado]
            return (
              <Link key={liquidacion.id} href={`/dashboard/liquidacion/${liquidacion.id}`} className="block bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white text-[20px] font-semibold">{formatPeriodo(liquidacion.periodo)}</p>
                    <p className="text-[13px] text-white/40 mt-2">{liquidacion._count.items} empleados</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${estado.color} ${estado.bg} ${estado.border}`}>
                    {estado.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
