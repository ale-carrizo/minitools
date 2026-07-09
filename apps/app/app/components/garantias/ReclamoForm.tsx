'use client'

import { useState, useTransition } from 'react'
import { crearReclamo } from '@/lib/actions/garantia'
import { todayString } from '@/types/garantia'

export default function ReclamoForm({
  productoId,
  onDone,
}: {
  productoId: string
  onDone?: () => void
}) {
  const [fecha, setFecha] = useState(todayString())
  const [descripcion, setDescripcion] = useState('')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!descripcion.trim()) {
      setError('Completá la descripción del problema')
      return
    }

    startTransition(async () => {
      try {
        await crearReclamo({ productoId, fecha, descripcion, notas })
        setDescripcion('')
        setNotas('')
        onDone?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo registrar el reclamo')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="space-y-2">
        <label className="text-[12px] text-white/50">Fecha del reclamo *</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
      </div>
      <div className="space-y-2">
        <label className="text-[12px] text-white/50">Descripción *</label>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} placeholder="Describí el problema..." className="w-full resize-none bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
      </div>
      <div className="space-y-2">
        <label className="text-[12px] text-white/50">Notas adicionales</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} className="w-full resize-none bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
      </div>
      {error ? <p className="text-[12px] text-red-300">{error}</p> : null}
      <div className="flex justify-end gap-2">
        {onDone ? (
          <button type="button" onClick={onDone} className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
            Cancelar
          </button>
        ) : null}
        <button type="submit" disabled={isPending} className="bg-[#5448EE] hover:bg-[#4438DE] disabled:opacity-70 text-white btn-solid-text rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
          {isPending ? 'Registrando...' : 'Registrar reclamo'}
        </button>
      </div>
    </form>
  )
}
