'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cerrarCaja } from '@/lib/actions/caja'
import type { CajaDiaResumen } from '@/types/caja'

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0
  }).format(n)
}

export default function CierreClient({ resumen }: { resumen: CajaDiaResumen }) {
  const router = useRouter()
  const [nota, setNota]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [confirm, setConfirm] = useState(false)

  const { dia, total, por_source, por_medio, cantidad } = resumen

  const filas = [
    { label: 'Comprobantes (IA)', icon: '📄', val: por_source.comprobante_ia },
    { label: 'Extracto bancario', icon: '📊', val: por_source.extracto },
    { label: 'Mercado Pago',      icon: '🔄', val: por_source.mercadopago },
    { label: 'Efectivo',          icon: '💵', val: por_source.manual },
  ].filter(f => f.val > 0)

  async function handleCierre() {
    setLoading(true); setError('')
    try {
      await cerrarCaja(dia.fecha, nota || undefined)
      router.push('/dashboard/caja/historial')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      {/* Aviso */}
      <div className="flex gap-2 items-start p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-5 text-[12px] text-yellow-300/80">
        <span className="flex-shrink-0 mt-0.5">⚠️</span>
        El cierre es definitivo — no se pueden agregar ni editar cobros del día una vez cerrado.
      </div>

      {/* Resumen */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <p className="text-[13px] font-semibold text-white capitalize">
            {new Date(dia.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </p>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {filas.map(f => (
            <div key={f.label} className="flex items-center justify-between px-5 py-3">
              <span className="text-[13px] text-white/50 flex items-center gap-2">
                {f.icon} {f.label}
              </span>
              <span className="text-[13px] font-medium text-white">{fmt(f.val)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-[12px] text-white/35">Cantidad de cobros</span>
            <span className="text-[12px] font-medium text-white/60">
              {cantidad} cobro{cantidad !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-baseline justify-between px-5 py-4 bg-white/[0.03] border-t border-white/[0.06]">
          <span className="text-[13px] font-medium text-white/70">Total del día</span>
          <span className="text-[26px] font-semibold text-emerald-400 tracking-[-0.02em]">{fmt(total)}</span>
        </div>
      </div>

      {/* Nota */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 mb-5">
        <label className="block text-[11px] text-white/40 mb-2">Nota del cierre (opcional)</label>
        <input
          type="text"
          value={nota}
          onChange={e => setNota(e.target.value)}
          placeholder="Ej: día tranquilo, feriado..."
          className="w-full px-3 py-2.5 text-[13px] bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-[#5448EE]/50 transition-colors"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {/* Botón con doble confirmación */}
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          disabled={cantidad === 0}
          className="w-full py-3 rounded-xl bg-white/[0.08] border border-white/[0.10] text-white text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-white/[0.12] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          🔒 Cerrar caja del día
        </button>
      ) : (
        <div className="border border-red-500/25 rounded-xl p-4 bg-red-500/10">
          <p className="text-[13px] text-red-300 font-medium mb-4 text-center">
            ¿Confirmás el cierre? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.10] bg-white/[0.04] text-[12px] text-white/60 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCierre}
              disabled={loading}
              className="flex-[2] py-2.5 rounded-xl bg-red-600 text-white btn-solid-text text-[12px] font-medium hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Cerrando…' : 'Sí, cerrar caja'}
            </button>
          </div>
        </div>
      )}

      {cantidad === 0 && (
        <p className="text-center text-[11px] text-white/30 mt-3">
          No hay cobros registrados. Agregá al menos uno antes de cerrar.
        </p>
      )}
    </div>
  )
}
