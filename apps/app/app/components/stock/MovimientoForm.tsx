'use client'

import { useState } from 'react'
import type { Producto, MovimientoTipo } from '@/types/stock'
import { registrarMovimiento } from '@/lib/actions/stock'

interface Props {
  producto: Producto
  onDone?: () => void
}

const TIPOS: { value: MovimientoTipo; label: string; desc: string; color: string }[] = [
  { value: 'entrada', label: 'Entrada',  desc: 'Sumar al stock',            color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  { value: 'salida',  label: 'Salida',   desc: 'Restar del stock',          color: 'border-red-500/40 bg-red-500/10 text-red-400' },
  { value: 'ajuste',  label: 'Ajuste',   desc: 'Fijar a un valor exacto',   color: 'border-blue-500/40 bg-blue-500/10 text-blue-400' },
]

export default function MovimientoForm({ producto, onDone }: Props) {
  const [tipo,     setTipo]     = useState<MovimientoTipo>('entrada')
  const [cantidad, setCantidad] = useState('')
  const [motivo,   setMotivo]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [ok,       setOk]       = useState(false)

  const cant = Number(cantidad)
  const tipoInfo = TIPOS.find(t => t.value === tipo)!

  let preview = producto.stock
  if (cant > 0) {
    if (tipo === 'entrada') preview = producto.stock + cant
    else if (tipo === 'salida') preview = producto.stock - cant
    else preview = cant
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cant || cant <= 0) { setError('Ingresá una cantidad válida'); return }
    setLoading(true)
    setError(null)
    try {
      await registrarMovimiento(producto.id, tipo, cant, motivo || undefined)
      setOk(true)
      setTimeout(() => { onDone?.() }, 1200)
    } catch (err: any) {
      setError(err.message ?? 'Error al registrar')
      setLoading(false)
    }
  }

  if (ok) {
    return (
      <div className="py-8 text-center">
        <p className="text-3xl mb-2">✅</p>
        <p className="text-white/70 text-sm">Movimiento registrado</p>
        <p className="text-white/30 text-xs">Nuevo stock: {preview} {producto.unidad}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tipo */}
      <div>
        <label className="block text-[11px] font-medium text-white/40 mb-2 uppercase tracking-wider">
          Tipo de movimiento
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TIPOS.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTipo(t.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                tipo === t.value
                  ? t.color + ' ring-1 ring-inset ring-current/30'
                  : 'border-white/10 text-white/30 hover:border-white/20 hover:text-white/50'
              }`}
            >
              <p className="text-[13px] font-semibold">{t.label}</p>
              <p className="text-[10px] mt-0.5 opacity-70">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cantidad */}
      <div>
        <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">
          {tipo === 'ajuste' ? 'Nuevo stock exacto' : 'Cantidad'}
        </label>
        <input
          type="number"
          min="0"
          step="any"
          value={cantidad}
          onChange={e => setCantidad(e.target.value)}
          placeholder={tipo === 'ajuste' ? `Ej: ${producto.stock}` : '0'}
          className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60 transition-colors"
        />
        {cant > 0 && (
          <p className="text-[11px] text-white/30 mt-1.5">
            Stock actual: {producto.stock} → <span className="text-white/60 font-medium">{preview} {producto.unidad}</span>
          </p>
        )}
      </div>

      {/* Motivo */}
      <div>
        <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">
          Motivo (opcional)
        </label>
        <input
          type="text"
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          placeholder="Ej: Compra a proveedor, Venta, Ajuste inventario..."
          className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60 transition-colors"
        />
      </div>

      {error && (
        <p className="text-[12px] text-red-400 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !cantidad}
        className="w-full py-2.5 text-[13px] font-medium bg-[#5448EE] hover:bg-[#4438DE] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
      >
        {loading ? 'Registrando...' : `Confirmar ${tipoInfo.label}`}
      </button>
    </form>
  )
}
