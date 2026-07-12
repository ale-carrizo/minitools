'use client'

import type { Producto } from '@/types/stock'

export interface VentaItem {
  productoId: string
  cantidad: number
  precio: string
}

export function nuevoVentaItem(): VentaItem {
  return { productoId: '', cantidad: 1, precio: '' }
}

export function buildVentaItemsPayload(items: VentaItem[]) {
  return items
    .map((item) => ({
      producto_id: item.productoId,
      cantidad: Number(item.cantidad),
      precio: item.precio ? Number(item.precio) : undefined,
    }))
    .filter((item) => item.producto_id && item.cantidad > 0)
}

interface Props {
  productos: Producto[]
  items: VentaItem[]
  onChange: (items: VentaItem[]) => void
}

export default function VentaItemsPicker({ productos, items, onChange }: Props) {
  function setItem(index: number, patch: Partial<VentaItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function addItem() {
    onChange([...items, nuevoVentaItem()])
  }

  function removeItem(index: number) {
    onChange(items.length === 1 ? [nuevoVentaItem()] : items.filter((_, i) => i !== index))
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Productos vendidos</p>
        <button type="button" onClick={addItem} className="rounded-xl bg-[#5448EE] px-3 py-1.5 text-[11px] font-medium text-white btn-solid-text hover:bg-[#4438DE]">
          + Agregar
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => {
          const producto = productos.find((p) => p.id === item.productoId)
          return (
            <div key={index} className="grid gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 md:grid-cols-[1.5fr_0.65fr_0.8fr_auto]">
              <div>
                <label className="mb-1 block text-[10px] text-white/35">Producto</label>
                <select
                  value={item.productoId}
                  onChange={(e) => setItem(index, { productoId: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white focus:border-[#5448EE]/60 focus:outline-none"
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} · stock {p.stock}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-white/35">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={item.cantidad}
                  onChange={(e) => setItem(index, { cantidad: Number(e.target.value || 1) })}
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white focus:border-[#5448EE]/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-white/35">Precio ref.</label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={item.precio}
                  onChange={(e) => setItem(index, { precio: e.target.value })}
                  placeholder={producto ? String(producto.precioVenta) : 'Opcional'}
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => removeItem(index)} className="rounded-xl border border-red-500/20 px-3 py-2 text-[11px] font-medium text-red-400">
                  Quitar
                </button>
              </div>
              {producto ? (
                <p className="md:col-span-4 text-[10px] text-white/35">
                  Disponible: {producto.stock} {producto.unidad}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
