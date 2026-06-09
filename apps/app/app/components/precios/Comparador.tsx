'use client'

import { useMemo, useState } from 'react'
import { IVA_OPCIONES, calcularPrecio, type Escenario } from '@/types/precios'

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

function formatCurrency(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

function MoneyInput({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-white/35">$</span>
      <input
        type="number"
        min="0"
        step="any"
        value={value === 0 ? '' : value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        placeholder="0"
        className="w-full pl-7 pr-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
      />
    </div>
  )
}

const initialEscenarios: Escenario[] = [
  { id: '1', nombre: 'Escenario A', costo: 0, margen: 20, iva: 21 },
  { id: '2', nombre: 'Escenario B', costo: 0, margen: 30, iva: 21 },
]

export default function Comparador() {
  const [escenarios, setEscenarios] = useState<Escenario[]>(initialEscenarios)

  const resultados = useMemo(() => escenarios.map((escenario) => ({
    ...escenario,
    result: calcularPrecio({
      costo: escenario.costo,
      margen: escenario.margen,
      iva: escenario.iva,
      modo: 'desde_costo',
      precioVenta: 0,
    }),
  })), [escenarios])

  const comparacion = useMemo(() => {
    if (!resultados.every((item) => item.costo > 0)) return null

    const mejorMargen = [...resultados].sort((a, b) => b.result.margenReal - a.result.margenReal)[0]
    const precioMasBajo = [...resultados].sort((a, b) => a.result.precioFinal - b.result.precioFinal)[0]
    const mayorGanancia = [...resultados].sort((a, b) => b.result.ganancia - a.result.ganancia)[0]

    return { mejorMargen, precioMasBajo, mayorGanancia }
  }, [resultados])

  const columnsClass = escenarios.length === 2
    ? 'md:grid-cols-2'
    : escenarios.length === 3
      ? 'md:grid-cols-3'
      : 'md:grid-cols-4'

  function updateEscenario(id: string, patch: Partial<Escenario>) {
    setEscenarios((prev) => prev.map((escenario) => escenario.id === id ? { ...escenario, ...patch } : escenario))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (escenarios.length >= 4) return
            setEscenarios((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                nombre: `Escenario ${String.fromCharCode(65 + prev.length)}`,
                costo: 0,
                margen: 30,
                iva: 21,
              },
            ])
          }}
          disabled={escenarios.length >= 4}
          className="bg-[#5448EE] hover:bg-[#4438DE] disabled:opacity-50 text-white rounded-xl px-4 py-2.5 text-[13px] font-medium"
        >
          + Agregar escenario
        </button>
      </div>

      <div className={`grid gap-4 ${columnsClass}`}>
        {resultados.map((escenario) => (
          <div key={escenario.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <input
                value={escenario.nombre}
                onChange={(e) => updateEscenario(escenario.id, { nombre: e.target.value })}
                placeholder="Escenario A"
                className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
              />
              <button
                type="button"
                disabled={escenarios.length <= 2}
                onClick={() => setEscenarios((prev) => prev.filter((item) => item.id !== escenario.id))}
                className="text-red-400 text-[18px] disabled:opacity-30"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Costo ($)</label>
                <MoneyInput
                  value={escenario.costo}
                  onChange={(value) => updateEscenario(escenario.id, { costo: value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Margen (%)</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  step="any"
                  value={escenario.margen}
                  onChange={(e) => updateEscenario(escenario.id, { margen: Number(e.target.value) })}
                  placeholder="30"
                  className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
                />
                <input
                  type="range"
                  min="0"
                  max="99"
                  step="0.5"
                  value={escenario.margen}
                  onChange={(e) => updateEscenario(escenario.id, { margen: Number(e.target.value) })}
                  className="mt-3 w-full accent-[#5448EE]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">IVA</label>
                <select
                  value={escenario.iva}
                  onChange={(e) => updateEscenario(escenario.id, { iva: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
                >
                  {IVA_OPCIONES.filter((option) => option.value !== -1).map((option) => (
                    <option key={option.label} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="my-5 border-t border-white/[0.06]" />

            <div className="space-y-2">
              <p className="text-[28px] font-semibold text-white tracking-tight">{formatCurrency(escenario.result.precioFinal)}</p>
              <p className="text-[15px] text-white/60">Precio sin IVA: {formatCurrency(escenario.result.precioSinIva)}</p>
              <p className={`text-[13px] ${escenario.result.ganancia > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                Ganancia: {formatCurrency(escenario.result.ganancia)}
              </p>
              <p className="text-[13px] text-white/60">Markup: {escenario.result.markupReal.toFixed(2)}%</p>
            </div>
          </div>
        ))}
      </div>

      {comparacion ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-white/30 mb-2">Mejor margen</p>
            <p className="text-white font-semibold">{comparacion.mejorMargen.nombre}</p>
            <span className="inline-block mt-2 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] text-emerald-400">
              {comparacion.mejorMargen.result.margenReal.toFixed(1)}%
            </span>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-white/30 mb-2">Precio más bajo</p>
            <p className="text-white font-semibold">{comparacion.precioMasBajo.nombre}</p>
            <span className="inline-block mt-2 rounded-full bg-blue-500/15 px-2.5 py-1 text-[11px] text-blue-400">
              {formatCurrency(comparacion.precioMasBajo.result.precioFinal)}
            </span>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-white/30 mb-2">Mayor ganancia</p>
            <p className="text-white font-semibold">{comparacion.mayorGanancia.nombre}</p>
            <span className="inline-block mt-2 rounded-full bg-[#5448EE]/15 px-2.5 py-1 text-[11px] text-[#8880F5]">
              {formatCurrency(comparacion.mayorGanancia.result.ganancia)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
