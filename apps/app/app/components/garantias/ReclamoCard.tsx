'use client'

import { useState, useTransition } from 'react'
import ReclamoEstadoBadge from './ReclamoEstadoBadge'
import { actualizarReclamo, eliminarReclamo } from '@/lib/actions/garantia'
import { formatFecha, type ReclamoEstado, type ReclamoGarantia } from '@/types/garantia'

export default function ReclamoCard({
  reclamo,
  productoId,
}: {
  reclamo: ReclamoGarantia
  productoId: string
}) {
  const [estado, setEstado] = useState<ReclamoEstado>(reclamo.estado)
  const [resolucion, setResolucion] = useState(reclamo.resolucion ?? '')
  const [notas, setNotas] = useState(reclamo.notas ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    startTransition(async () => {
      try {
        await actualizarReclamo(reclamo.id, { estado, resolucion, notas })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo actualizar el reclamo')
      }
    })
  }

  function handleDelete() {
    if (!window.confirm('¿Eliminar este reclamo?')) return
    setError(null)
    startTransition(async () => {
      try {
        await eliminarReclamo(reclamo.id, productoId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo eliminar el reclamo')
      }
    })
  }

  const cerrado = estado === 'resuelto' || estado === 'rechazado'

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ReclamoEstadoBadge estado={estado} />
            <span className="text-[12px] text-white/35">{formatFecha(reclamo.fecha)}</span>
          </div>
          <p className="text-[13px] text-white/75 mt-3">{reclamo.descripcion}</p>
        </div>
        <button type="button" onClick={handleDelete} className="text-[12px] text-white/25 hover:text-red-300 transition-colors">
          Eliminar
        </button>
      </div>

      {resolucion ? (
        <div className={`mt-4 border-l-2 pl-3 text-[13px] ${
          estado === 'resuelto' ? 'border-emerald-400 text-emerald-100/85' : 'border-red-400 text-red-100/85'
        }`}>
          {resolucion}
        </div>
      ) : null}

      {!cerrado ? (
        <div className="mt-4 space-y-3">
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as ReclamoEstado)}
            className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60"
          >
            <option value="abierto">Abierto</option>
            <option value="en_proceso">En proceso</option>
            <option value="resuelto">Resuelto</option>
            <option value="rechazado">Rechazado</option>
          </select>
          <textarea
            value={resolucion}
            onChange={(e) => setResolucion(e.target.value)}
            rows={3}
            placeholder="Agregar resolución"
            className="w-full resize-none bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
          />
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            placeholder="Notas internas"
            className="w-full resize-none bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
          />
          <div className="flex justify-end">
            <button type="button" disabled={isPending} onClick={handleSave} className="bg-[#5448EE] hover:bg-[#4438DE] disabled:opacity-70 text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-[12px] text-red-300">{error}</p> : null}
    </div>
  )
}
