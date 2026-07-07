'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import {
  asignarCarriles,
  DIAS_SEMANA,
  ESTADO_CONFIG,
  hhmm2min,
  nombreEmpleado,
  offsetFecha,
  parseLocalDate,
  type Turno,
  type TurnoConfig,
} from '@/types/turno'

const PX_POR_HORA = 60
const MIN_POR_HORA = 60

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
  const hoy = new Date().toISOString().slice(0, 10)

  const horaInicio = hhmm2min(config.horaInicio)
  const horaFin = hhmm2min(config.horaFin)
  const duracionTotalMin = horaFin - horaInicio

  const horas = useMemo(() => {
    const h = []
    for (let m = horaInicio; m <= horaFin; m += MIN_POR_HORA) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0')
      const mm = String(m % 60).padStart(2, '0')
      h.push(`${hh}:${mm}`)
    }
    return h
  }, [horaInicio, horaFin])

  function minToPx(minutos: number) {
    return ((minutos - horaInicio) / MIN_POR_HORA) * PX_POR_HORA
  }

  function turnosEnDia(fecha: string) {
    return turnos.filter((t) => t.fecha === fecha)
  }

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const anterior = offsetFecha(semana[0], -7)
              router.push(`/dashboard/turnos?fecha=${anterior}&vista=semana`)
            }}
            className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => router.push(`/dashboard/turnos?fecha=${hoy}&vista=semana`)}
            className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => {
              const siguiente = offsetFecha(semana[0], 7)
              router.push(`/dashboard/turnos?fecha=${siguiente}&vista=semana`)
            }}
            className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors"
          >
            →
          </button>
        </div>
        <p className="text-white text-[16px] font-semibold">
          {(() => {
            const d0 = parseLocalDate(semana[0])
            const d6 = parseLocalDate(semana[6])
            const m0 = d0.toLocaleDateString('es-AR', { month: 'short' })
            const m6 = d6.toLocaleDateString('es-AR', { month: 'short' })
            return `${m0} ${d0.getDate()} — ${m6} ${d6.getDate()}, ${d6.getFullYear()}`
          })()}
        </p>
        <div className="flex gap-1">
          <a href={`/dashboard/turnos?fecha=${semana[0]}&vista=dia`} className="px-3 py-1.5 text-[12px] font-medium rounded-lg text-white/40 hover:text-white/70 transition-colors">
            Día
          </a>
          <span className="px-3 py-1.5 text-[12px] font-medium rounded-lg bg-[#5448EE] text-white">
            Semana
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        {/* Header row */}
        <div className="flex-shrink-0 flex border-b border-white/[0.06]">
          <div className="w-14 flex-shrink-0 border-r border-white/[0.06] bg-white/[0.02] py-2 text-center text-[9px] text-white/25 uppercase tracking-wider">
            Hora
          </div>
          {dias.map((fecha) => {
            const date = parseLocalDate(fecha)
            const isToday = fecha === hoy
            return (
              <button
                key={fecha}
                type="button"
                onClick={() => router.push(`/dashboard/turnos?fecha=${fecha}`)}
                className="flex-1 py-2 text-center border-r border-white/[0.04] last:border-r-0 hover:bg-white/[0.02] transition-colors"
              >
                <p className={`text-[10px] uppercase tracking-wider ${isToday ? 'text-[#8880F5] font-semibold' : 'text-white/30'}`}>
                  {DIAS_SEMANA[date.getDay()].slice(0, 3)}
                </p>
                <p className={`text-[19px] font-semibold ${isToday ? 'text-[#8880F5]' : 'text-white'}`}>
                  {date.getDate()}
                </p>
              </button>
            )
          })}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex relative" style={{ minHeight: `${horas.length * PX_POR_HORA}px` }}>
            {/* Time column */}
            <div className="w-14 flex-shrink-0 border-r border-white/[0.06] bg-white/[0.02]">
              {horas.map((hora) => (
                <div key={hora} className="text-[10px] text-white/20 px-1 pt-0.5" style={{ height: `${PX_POR_HORA}px` }}>
                  {hora}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {dias.map((fecha) => {
              const ofTheDay = turnosEnDia(fecha)
              const carriles = asignarCarriles(ofTheDay)
              return (
                <div key={fecha} className="flex-1 relative border-r border-white/[0.04] last:border-r-0" style={{ minHeight: `${horas.length * PX_POR_HORA}px` }}>
                  {/* Hour lines */}
                  {horas.map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-b border-white/[0.04] pointer-events-none"
                      style={{ top: `${i * PX_POR_HORA}px`, height: `${PX_POR_HORA}px` }}
                    />
                  ))}

                  {/* Half-hour lines */}
                  {Array.from({ length: horas.length - 1 }).map((_, i) => (
                    <div
                      key={`half-${i}`}
                      className="absolute left-0 right-0 border-b border-white/[0.02] pointer-events-none"
                      style={{ top: `${(i + 0.5) * PX_POR_HORA}px` }}
                    />
                  ))}

                  {/* Clickable slots */}
                  {horas.slice(0, -1).map((hora) => {
                    const top = (hhmm2min(hora) - horaInicio) / MIN_POR_HORA * PX_POR_HORA
                    return (
                      <button
                        key={hora}
                        type="button"
                        onClick={() => router.push(`/dashboard/turnos/nuevo?fecha=${fecha}&hora=${hora}`)}
                        className="absolute left-0.5 right-0.5 opacity-0 hover:opacity-100 transition-opacity z-0"
                        style={{ top: `${top}px`, height: `${PX_POR_HORA}px` }}
                      >
                        <span className="absolute inset-0 bg-white/[0.04] rounded-md" />
                      </button>
                    )
                  })}

                  {/* Turnos */}
                  {ofTheDay.map((turno) => {
                    const inicioMin = hhmm2min(turno.horaInicio)
                    const finMin = inicioMin + turno.duracion
                    const top = ((inicioMin - horaInicio) / MIN_POR_HORA) * PX_POR_HORA
                    const height = Math.max(((finMin - horaInicio) / MIN_POR_HORA) * PX_POR_HORA - top, 18)
                    const color = turno.empleado?.color ?? turno.servicio?.color ?? '#5448EE'
                    const estaCompletado = turno.estado === 'completado'
                    const estadoCfg = ESTADO_CONFIG[turno.estado]
                    const { lane, lanes } = carriles.get(turno.id) ?? { lane: 0, lanes: 1 }
                    const widthPct = 100 / lanes

                    return (
                      <button
                        key={turno.id}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/turnos/${turno.id}`) }}
                        className={`absolute rounded-md overflow-hidden px-1 py-0.5 hover:brightness-110 hover:z-20 transition-all z-10 ${estaCompletado ? 'opacity-60' : ''}`}
                        style={{
                          top: `${top}px`,
                          minHeight: `${height}px`,
                          left: `calc(${lane * widthPct}% + 2px)`,
                          width: `calc(${widthPct}% - 4px)`,
                          backgroundColor: `${color}40`,
                          borderLeft: `3px solid ${color}`,
                        }}
                      >
                        {height > 22 ? (
                          <>
                            <p className="text-white text-[10px] font-medium truncate leading-tight flex items-center gap-1">
                              <span className={estadoCfg.color}>{estadoCfg.icon}</span>
                              {turno.horaInicio}
                            </p>
                            <p className="text-white/80 text-[10px] truncate leading-tight">{turno.clienteNombre}</p>
                            {height > 38 && (
                              <p className="text-white/50 text-[9px] truncate leading-tight">{nombreEmpleado(turno.empleado)}</p>
                            )}
                          </>
                        ) : (
                          <p className="text-white text-[10px] font-medium truncate leading-tight">{turno.clienteNombre}</p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
