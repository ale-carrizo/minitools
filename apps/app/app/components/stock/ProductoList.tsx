'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Producto } from '@/types/stock'
import { getStockEstado, STOCK_ESTADO_CONFIG } from '@/types/stock'

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

export default function ProductoList({ productos }: { productos: Producto[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [catFiltro, setCatFiltro] = useState('')

  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))] as string[]

  const filtrados = productos.filter(p => {
    const q = busqueda.toLowerCase()
    const matchQ = !q || p.nombre.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.categoria?.toLowerCase().includes(q)
    const matchC = !catFiltro || p.categoria === catFiltro
    return matchQ && matchC
  })

  if (productos.length === 0) {
    return (
      <div className="py-20 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl">
        <p className="text-4xl mb-4">📦</p>
        <p className="text-white/50 text-sm mb-1">No hay productos todavía</p>
        <p className="text-white/30 text-xs mb-5">Agregá tu primer producto para empezar</p>
        <Link
          href="/dashboard/stock/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5448EE] text-[#ffffff] text-[13px] font-medium rounded-xl hover:bg-[#4438DE] transition-colors"
        >
          + Agregar producto
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Resumen */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total productos', value: productos.length },
          { label: 'En stock',        value: productos.filter(p => p.stock > p.stockMinimo).length, color: 'text-emerald-400' },
          { label: 'Stock bajo',      value: productos.filter(p => p.stock > 0 && p.stock <= p.stockMinimo).length, color: 'text-yellow-400' },
          { label: 'Sin stock',       value: productos.filter(p => p.stock === 0).length, color: 'text-red-400' },
        ].map(c => (
          <div key={c.label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[11px] text-white/40 mb-1">{c.label}</p>
            <p className={`text-xl font-semibold ${c.color ?? 'text-white'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, SKU o categoría..."
          className="flex-1 px-3 py-2 text-[13px] bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-[#5448EE]/50 transition-colors"
        />
        {categorias.length > 0 && (
          <select
            value={catFiltro}
            onChange={e => setCatFiltro(e.target.value)}
            className="px-3 py-2 text-[13px] bg-white/[0.06] border border-white/[0.08] rounded-xl text-white/70 focus:outline-none focus:border-[#5448EE]/50 transition-colors"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.04]">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Producto', 'Categoría', 'Stock', 'Mínimo', 'Precio costo', 'Precio venta', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-white/30 text-sm">
                  No hay productos que coincidan con la búsqueda
                </td>
              </tr>
            ) : filtrados.map(p => {
              const estado = getStockEstado(p)
              const cfg    = STOCK_ESTADO_CONFIG[estado]
              return (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <div>
                        <p className="text-[13px] font-medium text-white">{p.nombre}</p>
                        {p.sku && <p className="text-[10px] text-white/30">SKU: {p.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-white/50">{p.categoria ?? '—'}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                      {p.stock} {p.unidad}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-white/40">{p.stockMinimo} {p.unidad}</td>
                  <td className="px-4 py-3.5 text-[12px] text-white/70">{fmt(p.precioCosto)}</td>
                  <td className="px-4 py-3.5 text-[12px] text-white/70">{p.precioVenta > 0 ? fmt(p.precioVenta) : '—'}</td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/dashboard/stock/${p.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-[#8880F5] hover:text-white font-medium"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
