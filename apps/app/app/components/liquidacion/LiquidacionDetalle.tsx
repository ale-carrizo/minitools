'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { cerrarLiquidacion, eliminarItem, eliminarLiquidacion, reabrirLiquidacion } from '@/lib/actions/liquidacion'
import { calcularResumen, ESTADO_CONFIG, formatCurrency, formatPeriodo, type EmpleadoMin, type Liquidacion, type LiquidacionItem } from '@/types/liquidacion'
import ItemForm from './ItemForm'

export default function LiquidacionDetalle({
  liquidacion,
  empleados,
}: {
  liquidacion: Liquidacion
  empleados: EmpleadoMin[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<LiquidacionItem | undefined>()
  const [isPending, startTransition] = useTransition()
  const resumen = useMemo(() => calcularResumen(liquidacion.items), [liquidacion.items])
  const estado = ESTADO_CONFIG[liquidacion.estado]

  function handleDeleteItem(itemId: string) {
    startTransition(async () => {
      await eliminarItem(itemId, liquidacion.id)
    })
  }

  function handleDeleteLiquidacion() {
    if (!window.confirm('¿Eliminar esta liquidación?')) return
    startTransition(async () => {
      await eliminarLiquidacion(liquidacion.id)
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[24px] font-semibold text-white">{formatPeriodo(liquidacion.periodo)}</p>
              <span className={`mt-3 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${estado.color} ${estado.bg} ${estado.border}`}>{estado.label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {liquidacion.estado === 'borrador' ? (
                <>
                  <button onClick={() => { setEditingItem(undefined); setShowForm((prev) => !prev) }} className="bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
                    + Agregar empleado
                  </button>
                  {liquidacion.items.length > 0 ? (
                    <button onClick={() => startTransition(async () => { await cerrarLiquidacion(liquidacion.id) })} className="border border-emerald-500/25 hover:border-emerald-500/45 text-emerald-300 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
                      Cerrar liquidación
                    </button>
                  ) : null}
                </>
              ) : (
                <button onClick={() => startTransition(async () => { await reabrirLiquidacion(liquidacion.id) })} className="border border-yellow-500/25 hover:border-yellow-500/45 text-yellow-300 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
                  Reabrir
                </button>
              )}
              <a href={`/api/liquidaciones/${liquidacion.id}/pdf`} className="border border-white/10 hover:border-white/20 text-white/70 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
                Descargar PDF
              </a>
            </div>
          </div>
        </div>

        {showForm ? (
          <ItemForm
            liquidacionId={liquidacion.id}
            empleados={empleados}
            item={editingItem}
            artPorcentaje={2.5}
            onDone={() => { setShowForm(false); setEditingItem(undefined) }}
          />
        ) : null}

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/[0.03]">
              <tr className="text-[11px] uppercase tracking-wider text-white/30">
                <th className="px-4 py-3">Empleado</th>
                <th className="px-4 py-3">Bruto</th>
                <th className="px-4 py-3">Aportes</th>
                <th className="px-4 py-3">Neto</th>
                <th className="px-4 py-3">Contrib. Emp</th>
                <th className="px-4 py-3">Costo Total</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {liquidacion.items.map((item) => (
                <tr key={item.id} className="border-t border-white/[0.06] text-[13px] text-white/65">
                  <td className="px-4 py-3">{item.empleadoNombre}</td>
                  <td className="px-4 py-3">{formatCurrency(item.totalBruto)}</td>
                  <td className="px-4 py-3">{formatCurrency(item.totalDeduccs)}</td>
                  <td className="px-4 py-3 text-emerald-300">{formatCurrency(item.netoAPagar)}</td>
                  <td className="px-4 py-3">{formatCurrency(item.totalContribEmp)}</td>
                  <td className="px-4 py-3">{formatCurrency(item.costoTotalEmp)}</td>
                  <td className="px-4 py-3">
                    {liquidacion.estado === 'borrador' ? (
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(item); setShowForm(true) }} className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Editar</button>
                        <button onClick={() => handleDeleteItem(item.id)} disabled={isPending} className="border border-red-500/20 hover:border-red-500/35 text-red-300 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Eliminar</button>
                      </div>
                    ) : '—'}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-white/[0.06] bg-white/[0.04] text-[13px] font-semibold text-white">
                <td className="px-4 py-3">TOTAL</td>
                <td className="px-4 py-3">{formatCurrency(resumen.totalBruto)}</td>
                <td className="px-4 py-3">{formatCurrency(resumen.totalDeduccs)}</td>
                <td className="px-4 py-3 text-emerald-300">{formatCurrency(resumen.totalNeto)}</td>
                <td className="px-4 py-3">{formatCurrency(resumen.totalContribEmp)}</td>
                <td className="px-4 py-3">{formatCurrency(resumen.totalCostoEmp)}</td>
                <td className="px-4 py-3">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-4">Resumen del período</p>
          <div className="space-y-3">
            <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-[12px] text-white/35">Empleados</p><p className="text-white text-[22px] font-semibold mt-1">{resumen.cantEmpleados}</p></div>
            <div className="rounded-xl bg-[#5448EE]/10 p-4"><p className="text-[12px] text-white/35">Total Neto</p><p className="text-[#8880F5] text-[22px] font-semibold mt-1">{formatCurrency(resumen.totalNeto)}</p></div>
            <div className="rounded-xl bg-yellow-500/10 p-4"><p className="text-[12px] text-white/35">Aportes empleados</p><p className="text-yellow-300 text-[22px] font-semibold mt-1">{formatCurrency(resumen.totalDeduccs)}</p></div>
            <div className="rounded-xl bg-orange-500/10 p-4"><p className="text-[12px] text-white/35">Contribuciones patronales</p><p className="text-orange-300 text-[22px] font-semibold mt-1">{formatCurrency(resumen.totalContribEmp)}</p></div>
          </div>
          <div className="mt-4 border-t border-white/[0.08] pt-4">
            <p className="text-[12px] text-white/35">Costo total del período</p>
            <p className="text-white text-[28px] font-semibold mt-1">{formatCurrency(resumen.totalCostoEmp)}</p>
            <p className="text-[11px] text-white/30 mt-1">= sueldos brutos + contribuciones patronales</p>
          </div>
        </div>

        {liquidacion.notas ? (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-3">Notas</p>
            <p className="text-[13px] text-white/60">{liquidacion.notas}</p>
          </div>
        ) : null}

        {liquidacion.estado === 'borrador' ? (
          <div className="bg-white/[0.04] border border-red-500/15 rounded-2xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-4">Acciones destructivas</p>
            <button onClick={handleDeleteLiquidacion} disabled={isPending} className="w-full border border-red-500/20 hover:border-red-500/35 text-red-300 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
              🗑 Eliminar liquidación
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
