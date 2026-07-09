'use client'

import { useEffect, useMemo, useState } from 'react'
import { calcularEquilibrio, type HistorialItem } from '@/types/precios'

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

export default function CalculadoraEquilibrio({
  onGuardar,
}: {
  onGuardar: (item: Omit<HistorialItem, 'id' | 'fecha'>) => void
}) {
  const [costosFijos, setCostosFijos] = useState(0)
  const [costoVariable, setCostoVariable] = useState(0)
  const [precioVenta, setPrecioVenta] = useState(0)
  const [etiqueta, setEtiqueta] = useState('')
  const [guardado, setGuardado] = useState(false)

  const result = useMemo(() => calcularEquilibrio({
    costosFijos,
    costoVariable,
    precioVenta,
  }), [costoVariable, costosFijos, precioVenta])

  useEffect(() => {
    if (!guardado) return
    const timeout = window.setTimeout(() => setGuardado(false), 2000)
    return () => window.clearTimeout(timeout)
  }, [guardado])

  const invalid = precioVenta <= 0 || precioVenta <= costoVariable

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 space-y-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Parámetros</p>

        <div>
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Negocio / producto</label>
          <input
            value={etiqueta}
            onChange={(e) => setEtiqueta(e.target.value)}
            placeholder="Ej: Servicio de viandas"
            className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Costos fijos mensuales ($)</label>
          <MoneyInput value={costosFijos} onChange={setCostosFijos} />
          <p className="text-[10px] text-white/25 mt-1">Alquiler, sueldos, servicios, etc. — lo que pagás aunque no vendas nada</p>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Costo variable por unidad ($)</label>
          <MoneyInput value={costoVariable} onChange={setCostoVariable} />
          <p className="text-[10px] text-white/25 mt-1">Materia prima, comisiones, empaque — lo que se suma por cada unidad</p>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Precio de venta por unidad ($)</label>
          <MoneyInput value={precioVenta} onChange={setPrecioVenta} />
          <p className="text-[10px] text-white/25 mt-1">Precio neto sin IVA al que vendés cada unidad</p>
        </div>

        {!invalid && precioVenta > 0 ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onGuardar({
                  tipo: 'equilibrio',
                  input: { costosFijos, costoVariable, precioVenta },
                  result,
                  etiqueta: etiqueta.trim() || undefined,
                })
                setGuardado(true)
              }}
              className="bg-[#5448EE] hover:bg-[#4438DE] text-white btn-solid-text rounded-xl px-4 py-2.5 text-[13px] font-medium"
            >
              Guardar en historial
            </button>
            {guardado ? <span className="text-[12px] text-emerald-400">✓ Guardado</span> : null}
          </div>
        ) : null}
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
        {precioVenta === 0 ? (
          <div className="h-full min-h-[420px] flex items-center justify-center text-center text-white/35">
            <div>
              <p className="text-4xl mb-3">⚖️</p>
              <p className="text-[15px] text-white/60">Ingresá los valores para calcular</p>
            </div>
          </div>
        ) : precioVenta <= costoVariable ? (
          <div className="h-full min-h-[420px] flex items-center justify-center text-center">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-400 text-[14px]">
              ⚠️ El precio de venta debe ser mayor al costo variable
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-2">Punto de equilibrio</p>
              <p className="text-[36px] font-semibold text-white tracking-tight">{result.unidadesEquilibrio} unidades</p>
              <p className="text-[15px] text-white/60 mt-2">= {formatCurrency(result.ingresosEquilibrio)} de ingresos</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-4">
                <p className="text-[11px] uppercase tracking-wider text-white/30 mb-1">Contribución marginal</p>
                <p className="text-[20px] font-semibold text-white">{formatCurrency(result.contribucionMarginal)} / unidad</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-4">
                <p className="text-[11px] uppercase tracking-wider text-white/30 mb-1">Margen de contribución</p>
                <p className="text-[20px] font-semibold text-white">{result.margenContribucion.toFixed(1)}%</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.05]">
                <p className="text-[13px] text-white">Proyección mensual</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-left text-white/30 uppercase tracking-wider text-[10px] border-b border-white/[0.05]">
                      <th className="px-5 py-3">Unidades</th>
                      <th className="px-5 py-3">Ingresos</th>
                      <th className="px-5 py-3">Costos</th>
                      <th className="px-5 py-3">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.proyeccion.map((row) => {
                      const isEquilibrio = row.unidades === result.unidadesEquilibrio
                      return (
                        <tr key={`${row.unidades}-${row.resultado}`} className={`border-b border-white/[0.04] ${isEquilibrio ? 'bg-white/[0.02]' : ''}`}>
                          <td className={`px-5 py-3 ${isEquilibrio ? 'border-l-[3px] border-[#5448EE]' : ''}`}>
                            <span className="text-white">{row.unidades}</span>
                            {isEquilibrio ? <span className="ml-2 text-[#8880F5]">← equilibrio</span> : null}
                          </td>
                          <td className="px-5 py-3 text-white/60">{formatCurrency(row.ingresos)}</td>
                          <td className="px-5 py-3 text-white/60">{formatCurrency(row.costos)}</td>
                          <td className={`px-5 py-3 font-medium ${row.resultado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {row.resultado > 0 ? '+' : ''}{formatCurrency(row.resultado)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
