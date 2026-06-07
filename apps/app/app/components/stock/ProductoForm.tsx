'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Producto } from '@/types/stock'
import { UNIDADES, CATEGORIAS_SUGERIDAS } from '@/types/stock'
import { crearProducto, editarProducto } from '@/lib/actions/stock'

interface Props {
  producto?: Producto
}

export default function ProductoForm({ producto }: Props) {
  const router  = useRouter()
  const isEdit  = !!producto
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const [form, setForm] = useState({
    nombre:      producto?.nombre      ?? '',
    sku:         producto?.sku         ?? '',
    categoria:   producto?.categoria   ?? '',
    descripcion: producto?.descripcion ?? '',
    precioCosto: producto?.precioCosto ?? 0,
    precioVenta: producto?.precioVenta ?? 0,
    stock:       producto?.stock       ?? 0,
    stockMinimo: producto?.stockMinimo ?? 0,
    unidad:      producto?.unidad      ?? 'unidad',
  })

  const set = (k: keyof typeof form, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        nombre:      form.nombre,
        sku:         form.sku         || undefined,
        categoria:   form.categoria   || undefined,
        descripcion: form.descripcion || undefined,
        precioCosto: Number(form.precioCosto),
        precioVenta: Number(form.precioVenta),
        stock:       Number(form.stock),
        stockMinimo: Number(form.stockMinimo),
        unidad:      form.unidad,
      }
      if (isEdit) {
        await editarProducto(producto!.id, payload)
        router.push(`/dashboard/stock/${producto!.id}`)
      } else {
        const p = await crearProducto(payload)
        router.push(`/dashboard/stock/${p.id}`)
      }
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar')
      setLoading(false)
    }
  }

  const field = (
    label: string,
    key: keyof typeof form,
    opts?: { type?: string; placeholder?: string; hint?: string }
  ) => (
    <div>
      <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={opts?.type ?? 'text'}
        value={form[key]}
        onChange={e => set(key, opts?.type === 'number' ? e.target.value : e.target.value)}
        placeholder={opts?.placeholder}
        step={opts?.type === 'number' ? 'any' : undefined}
        className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60 transition-colors"
      />
      {opts?.hint && <p className="text-[10px] text-white/25 mt-1">{opts.hint}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[13px] text-red-400">
          {error}
        </div>
      )}

      {/* Nombre + SKU */}
      <div className="grid grid-cols-2 gap-4">
        {field('Nombre *', 'nombre', { placeholder: 'Ej: Camiseta azul M' })}
        {field('SKU / Código', 'sku', { placeholder: 'Ej: CAM-AZM-001' })}
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">
          Categoría
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.categoria}
            onChange={e => set('categoria', e.target.value)}
            placeholder="Escribí o elegí abajo"
            list="categorias-list"
            className="flex-1 px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60 transition-colors"
          />
          <datalist id="categorias-list">
            {CATEGORIAS_SUGERIDAS.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div className="flex gap-1.5 flex-wrap mt-2">
          {CATEGORIAS_SUGERIDAS.slice(0, 6).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set('categoria', c)}
              className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                form.categoria === c
                  ? 'border-[#5448EE] bg-[#5448EE]/20 text-[#8880F5]'
                  : 'border-white/10 text-white/30 hover:border-white/20 hover:text-white/50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">
          Descripción
        </label>
        <textarea
          value={form.descripcion}
          onChange={e => set('descripcion', e.target.value)}
          placeholder="Descripción opcional del producto..."
          rows={2}
          className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60 transition-colors resize-none"
        />
      </div>

      {/* Precios */}
      <div className="grid grid-cols-2 gap-4">
        {field('Precio costo $', 'precioCosto', { type: 'number', placeholder: '0', hint: 'Cuánto te cuesta comprarlo' })}
        {field('Precio venta $', 'precioVenta', { type: 'number', placeholder: '0', hint: 'Cuánto lo vendés' })}
      </div>

      {/* Stock */}
      <div className="grid grid-cols-3 gap-4">
        {!isEdit && field('Stock actual', 'stock', { type: 'number', placeholder: '0', hint: 'Stock con el que arrancás' })}
        {field('Stock mínimo', 'stockMinimo', { type: 'number', placeholder: '0', hint: 'Alerta cuando llega a esto' })}
        <div>
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">
            Unidad
          </label>
          <select
            value={form.unidad}
            onChange={e => set('unidad', e.target.value)}
            className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white/80 focus:outline-none focus:border-[#5448EE]/60 transition-colors"
          >
            {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {isEdit && (
        <div className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[12px] text-white/40">
          Para cambiar el stock usá el botón de Movimiento en la ficha del producto (entrada / salida / ajuste).
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-5 py-2.5 text-[13px] font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !form.nombre.trim()}
          className="flex-1 px-5 py-2.5 text-[13px] font-medium bg-[#5448EE] hover:bg-[#4438DE] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
        >
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
