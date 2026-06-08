'use client'

import CalculadoraPrecio from '@/app/components/precios/CalculadoraPrecio'
import HistorialPanel from '@/app/components/precios/HistorialPanel'
import { useHistorial } from '@/app/components/precios/useHistorial'

export default function PreciosPage() {
  const { items, agregar, limpiar } = useHistorial()
  const precioItems = items.filter((item) => item.tipo === 'precio')

  return (
    <div className="space-y-6">
      <CalculadoraPrecio onGuardar={agregar} />
      {precioItems.length > 0 ? (
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-3">
            Historial reciente
          </h2>
          <HistorialPanel items={precioItems} onLimpiar={limpiar} />
        </div>
      ) : null}
    </div>
  )
}
