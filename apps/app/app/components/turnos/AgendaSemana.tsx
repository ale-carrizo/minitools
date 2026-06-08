'use client'

import { useRouter } from 'next/navigation'
import { DIAS_SEMANA, parseLocalDate, type Turno, type TurnoConfig } from '@/types/turno'

export default function AgendaSemana({
  semana,
  turnos,
  config,
}: {
  semana: string[]
  turnos: Turno[]
  config: TurnoConfig
}) {
  const router = useRouter()
  const dias = semana.filter((fecha) => config.diasHabiles.includes(parseLocalDate(fecha).getDay()))

  return (
    <div className="grid gap-4 md:grid-cols-5 xl:grid-cols-7">
      {dias.map((fecha) => {
        const date = parseLocalDate(fecha)
        const items = turnos.filter((turno) => turno.fecha === fecha)
        const isToday = fecha === new Date().toISOString().slice(0, 10)

        return (
          <button
            key={fecha}
            type="button"
            onClick={() => router.push(`/dashboard/turnos?fecha=${fecha}`)}
            className={`text-left bg-white/[0.04] border rounded-2xl p-4 transition-colors ${
              isToday ? 'border-[#5448EE]/50' : 'border-white/[0.08] hover:bg-white/[0.02]'
            }`}
          >
            <div className="mb-3">
              <p className={`text-[13px] font-medium ${isToday ? 'text-[#8880F5]' : 'text-white'}`}>{DIAS_SEMANA[date.getDay()]} {date.getDate()}</p>
            </div>
            <div className="space-y-2">
              {items.map((turno) => (
                <div key={turno.id} className="rounded-xl px-2.5 py-2 text-white text-[11px]" style={{ backgroundColor: `${turno.servicio?.color ?? '#5448EE'}33` }}>
                  <p className="font-medium truncate">{turno.horaInicio} · {turno.clienteNombre}</p>
                </div>
              ))}
              {items.length === 0 ? <p className="text-[11px] text-white/25">Sin turnos</p> : null}
            </div>
          </button>
        )
      })}
    </div>
  )
}
