'use client'

import CalculadoraEquilibrio from '@/app/components/precios/CalculadoraEquilibrio'
import HistorialPanel from '@/app/components/precios/HistorialPanel'
import { useHistorial } from '@/app/components/precios/useHistorial'

export default function EquilibrioPage() {
  const { items, agregar, limpiar } = useHistorial()
  const equilibrioItems = items.filter((item) => item.tipo === 'equilibrio')

  return (
    <div className="space-y-6">
      <CalculadoraEquilibrio onGuardar={agregar} />
      {equilibrioItems.length > 0 ? (
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-3">
            Historial reciente
          </h2>
          <HistorialPanel items={equilibrioItems} onLimpiar={limpiar} />
        </div>
      ) : null}
    </div>
  )
}
