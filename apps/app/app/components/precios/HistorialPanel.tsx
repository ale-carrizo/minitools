'use client'

import { useState } from 'react'
import type { CalcEquilibrioResult, CalcPrecioResult, HistorialItem } from '@/types/precios'

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

function formatCurrency(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

function formatRelativeDate(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86400000)

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  return date.toLocaleDateString('es-AR')
}

export default function HistorialPanel({
  items,
  onLimpiar,
}: {
  items: HistorialItem[]
  onLimpiar: () => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 text-white/40">
        📋 Sin cálculos guardados todavía
      </div>
    )
  }

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <p className="text-[13px] text-white/70">Historial guardado</p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('¿Limpiar el historial guardado?')) onLimpiar()
          }}
          className="text-[12px] text-red-400 hover:text-red-300"
        >
          Limpiar historial
        </button>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {items.map((item) => {
          const isOpen = expanded === item.id
          const principal = item.tipo === 'precio'
            ? formatCurrency((item.result as CalcPrecioResult).precioFinal)
            : `${(item.result as CalcEquilibrioResult).unidadesEquilibrio} unidades`

          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => setExpanded((prev) => prev === item.id ? null : item.id)}
                className="w-full px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-white text-[13px] font-medium">
                      {item.tipo === 'precio' ? '💰' : '⚖️'} {item.etiqueta || 'Sin nombre'}
                    </p>
                    <p className="text-[11px] text-white/30 mt-1">{formatRelativeDate(item.fecha)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-[13px] font-medium">{principal}</p>
                    <p className="text-[11px] text-white/30">{isOpen ? 'Ocultar detalle' : 'Ver detalle'}</p>
                  </div>
                </div>
              </button>

              {isOpen ? (
                <div className="px-5 pb-5">
                  <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-4 text-[12px] text-white/60">
                    {item.tipo === 'precio' ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        <p>Precio sin IVA: <span className="text-white">{formatCurrency((item.result as CalcPrecioResult).precioSinIva)}</span></p>
                        <p>IVA: <span className="text-white">{formatCurrency((item.result as CalcPrecioResult).ivaMonto)}</span></p>
                        <p>Ganancia: <span className="text-white">{formatCurrency((item.result as CalcPrecioResult).ganancia)}</span></p>
                        <p>Markup: <span className="text-white">{(item.result as CalcPrecioResult).markupReal.toFixed(2)}%</span></p>
                        <p>Margen real: <span className="text-white">{(item.result as CalcPrecioResult).margenReal.toFixed(2)}%</span></p>
                        <p>Costo sobre precio: <span className="text-white">{(item.result as CalcPrecioResult).costoSobre.toFixed(2)}%</span></p>
                      </div>
                    ) : (
                      <div className="grid gap-2 md:grid-cols-2">
                        <p>Unidades equilibrio: <span className="text-white">{(item.result as CalcEquilibrioResult).unidadesEquilibrio}</span></p>
                        <p>Ingresos equilibrio: <span className="text-white">{formatCurrency((item.result as CalcEquilibrioResult).ingresosEquilibrio)}</span></p>
                        <p>Contribución marginal: <span className="text-white">{formatCurrency((item.result as CalcEquilibrioResult).contribucionMarginal)}</span></p>
                        <p>Margen contribución: <span className="text-white">{(item.result as CalcEquilibrioResult).margenContribucion.toFixed(2)}%</span></p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
