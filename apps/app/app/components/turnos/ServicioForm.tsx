'use client'

import { useMemo, useState, useTransition } from 'react'
import { crearServicio, editarServicio } from '@/lib/actions/turno'
import { COLORES_SERVICIO, type TurnoServicio } from '@/types/turno'

const QUICK_DURATIONS = [15, 30, 45, 60, 90, 120]

export default function ServicioForm({
  servicio,
  onDone,
}: {
  servicio?: TurnoServicio
  onDone?: () => void
}) {
  const [nombre, setNombre] = useState(servicio?.nombre ?? '')
  const [duracionValor, setDuracionValor] = useState(servicio ? String(servicio.duracion >= 60 && servicio.duracion % 60 === 0 ? servicio.duracion / 60 : servicio.duracion) : '30')
  const [unidad, setUnidad] = useState<'minutos' | 'horas'>(servicio && servicio.duracion >= 60 && servicio.duracion % 60 === 0 ? 'horas' : 'minutos')
  const [precio, setPrecio] = useState(servicio?.precio.toString() ?? '0')
  const [color, setColor] = useState(servicio?.color ?? COLORES_SERVICIO[0])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const duracionMinutos = useMemo(() => {
    const value = Number(duracionValor)
    if (!Number.isFinite(value) || value <= 0) return 0
    return unidad === 'horas' ? value * 60 : value
  }, [duracionValor, unidad])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!nombre.trim()) {
      setError('Completá el nombre del servicio')
      return
    }

    if (duracionMinutos <= 0) {
      setError('La duración debe ser mayor a cero')
      return
    }

    startTransition(async () => {
      try {
        const payload = {
          nombre,
          duracion: duracionMinutos,
          precio: Number(precio) || 0,
          color,
        }

        if (servicio) {
          await editarServicio(servicio.id, payload)
        } else {
          await crearServicio(payload)
        }

        onDone?.()
        if (!servicio) {
          setNombre('')
          setDuracionValor('30')
          setUnidad('minutos')
          setPrecio('0')
          setColor(COLORES_SERVICIO[0])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar el servicio')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="space-y-2">
        <label className="text-[12px] text-white/50">Nombre *</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Corte de cabello, Consulta, Masaje" className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
      </div>

      <div className="space-y-2">
        <label className="text-[12px] text-white/50">Duración *</label>
        <div className="grid grid-cols-[1fr,120px] gap-3">
          <input type="number" min="1" value={duracionValor} onChange={(e) => setDuracionValor(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
          <select value={unidad} onChange={(e) => setUnidad(e.target.value as 'minutos' | 'horas')} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60">
            <option value="minutos">Minutos</option>
            <option value="horas">Horas</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_DURATIONS.map((item) => (
            <button key={item} type="button" onClick={() => { setDuracionValor(String(item)); setUnidad('minutos') }} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/55 hover:text-white/80 transition-colors">
              {item}m
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[12px] text-white/50">Precio</label>
        <input type="number" min="0" step="1" value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
      </div>

      <div className="space-y-2">
        <label className="text-[12px] text-white/50">Color</label>
        <div className="flex flex-wrap gap-3">
          {COLORES_SERVICIO.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setColor(item)}
              className={`h-8 w-8 rounded-full transition-all ${color === item ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-[#111028]' : ''}`}
              style={{ backgroundColor: item }}
            />
          ))}
        </div>
      </div>

      {error ? <p className="text-[12px] text-red-300">{error}</p> : null}

      <div className="flex justify-end gap-2">
        {onDone ? <button type="button" onClick={onDone} className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Cancelar</button> : null}
        <button type="submit" disabled={isPending} className="bg-[#5448EE] hover:bg-[#4438DE] disabled:opacity-70 text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
          {isPending ? 'Guardando...' : servicio ? 'Guardar cambios' : 'Guardar servicio'}
        </button>
      </div>
    </form>
  )
}
