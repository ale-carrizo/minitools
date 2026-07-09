'use client'

import { useState, useTransition } from 'react'
import { guardarConfig } from '@/lib/actions/turno'
import { DIAS_SEMANA, type TurnoConfig } from '@/types/turno'

export default function ConfigForm({ config }: { config: TurnoConfig }) {
  const [horaInicio, setHoraInicio] = useState(config.horaInicio)
  const [horaFin, setHoraFin] = useState(config.horaFin)
  const [intervalo, setIntervalo] = useState(config.intervalo)
  const [diasHabiles, setDiasHabiles] = useState<number[]>(config.diasHabiles)
  const [isPending, startTransition] = useTransition()
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleDia(index: number) {
    setDiasHabiles((prev) => prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index].sort((a, b) => a - b))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOk(false)
    setError(null)

    if (diasHabiles.length === 0) {
      setError('Seleccioná al menos un día hábil')
      return
    }

    startTransition(async () => {
      try {
        await guardarConfig({ horaInicio, horaFin, intervalo, diasHabiles })
        setOk(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar la configuración')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-[12px] text-white/50">Hora de inicio</label>
          <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
        </div>
        <div className="space-y-2">
          <label className="text-[12px] text-white/50">Hora de fin</label>
          <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[12px] text-white/50">Intervalo entre slots</label>
        <select value={intervalo} onChange={(e) => setIntervalo(Number(e.target.value))} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60">
          <option value={15}>15 min</option>
          <option value={30}>30 min</option>
          <option value={60}>60 min</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-[12px] text-white/50">Días hábiles</label>
        <div className="flex flex-wrap gap-2">
          {DIAS_SEMANA.map((dia, index) => {
            const active = diasHabiles.includes(index)
            return (
              <button
                key={dia}
                type="button"
                onClick={() => toggleDia(index)}
                className={`px-3 py-2 rounded-xl text-[12px] font-medium transition-colors ${
                  active ? 'bg-[#5448EE] text-white btn-solid-text' : 'bg-white/[0.06] text-white/45 hover:text-white/75'
                }`}
              >
                {dia}
              </button>
            )
          })}
        </div>
      </div>

      {error ? <p className="text-[12px] text-red-300">{error}</p> : null}
      {ok ? <p className="text-[12px] text-emerald-300">Configuración guardada.</p> : null}

      <button type="submit" disabled={isPending} className="bg-[#5448EE] hover:bg-[#4438DE] disabled:opacity-70 text-white btn-solid-text rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
        {isPending ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </form>
  )
}
