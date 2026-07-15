'use client'

import { useEffect, useRef, useState } from 'react'
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

function ProductoCombobox({ productos, value, onChange }: {
  productos: Producto[]
  value: string
  onChange: (productoId: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const seleccionado = productos.find((p) => p.id === value)

  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [])

  const q = query.trim().toLowerCase()
  const filtrados = q
    ? productos.filter((p) => p.nombre.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q))
    : productos

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={open ? query : (seleccionado?.nombre ?? '')}
        onChange={(e) => { setQuery(e.target.value); if (value) onChange(''); setOpen(true) }}
        onFocus={() => { setQuery(''); setOpen(true) }}
        placeholder="Buscar por nombre o SKU..."
        className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-white/[0.10] light:border-black/[0.10] bg-[#1A1830] light:bg-[#ffffff] shadow-xl">
          {filtrados.length === 0 ? (
            <p className="px-3 py-2.5 text-[12px] text-white/30">Sin resultados</p>
          ) : filtrados.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onChange(p.id); setQuery(''); setOpen(false) }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] text-white hover:bg-white/[0.06] transition-colors"
            >
              <span className="truncate">
                {p.nombre}
                {p.sku ? <span className="text-white/30"> · {p.sku}</span> : null}
              </span>
              <span className="flex-shrink-0 text-white/30 text-[11px]">stock {p.stock}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
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
                <ProductoCombobox
                  productos={productos}
                  value={item.productoId}
                  onChange={(productoId) => setItem(index, { productoId })}
                />
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
