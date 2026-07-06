'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import {
  DIAS_SEMANA,
  formatCurrency,
  formatFechaBonita,
  hhmm2min,
  offsetFecha,
  type Turno,
  type TurnoConfig,
} from '@/types/turno'

const PX_POR_HORA = 80
const MIN_POR_HORA = 60

export default function AgendaDia({
  fecha,
  turnos,
  config,
  vista,
}: {
  fecha: string
  turnos: Turno[]
  config: TurnoConfig
  vista: 'dia' | 'semana'
}) {
  const router = useRouter()
  const dayOfWeek = new Date(`${fecha}T00:00:00`).getDay()
  const esHabil = config.diasHabiles.includes(dayOfWeek)

  const horaInicio = hhmm2min(config.horaInicio)
  const horaFin = hhmm2min(config.horaFin)
  const duracionTotalMin = horaFin - horaInicio
  const timelineHeight = (duracionTotalMin / MIN_POR_HORA) * PX_POR_HORA

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
    return ((minutos - horaInicio) / duracionTotalMin) * timelineHeight
  }

  function goTo(nextFecha: string) {
    router.push(`/dashboard/turnos?fecha=${nextFecha}&vista=${vista}`)
  }

  return (
    <div className="space-y-4">
      {/* Navigation bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => goTo(offsetFecha(fecha, -1))} className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
            ←
          </button>
          <button onClick={() => goTo(new Date().toISOString().slice(0, 10))} className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
            Hoy
          </button>
          <button onClick={() => goTo(offsetFecha(fecha, 1))} className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
            →
          </button>
        </div>
        <p className="text-white text-[16px] font-semibold">{formatFechaBonita(fecha)}</p>
        <div className="flex gap-1">
          <Link
            href={`/dashboard/turnos?fecha=${fecha}&vista=dia`}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors ${vista === 'dia' ? 'bg-[#5448EE] text-white' : 'text-white/40 hover:text-white/70'}`}
          >
            Día
          </Link>
          <Link
            href={`/dashboard/turnos?fecha=${fecha}&vista=semana`}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors ${vista === 'semana' ? 'bg-[#5448EE] text-white' : 'text-white/40 hover:text-white/70'}`}
          >
            Semana
          </Link>
        </div>
      </div>

      {!esHabil ? (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-[13px] text-yellow-200">
          Este día no está configurado como día hábil
        </div>
      ) : null}

      {/* Timeline */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 260px)' }}>
        {/* Header */}
        <div className="flex-shrink-0 grid grid-cols-[56px,1fr] border-b border-white/[0.06]">
          <div className="border-r border-white/[0.06] bg-white/[0.02]" />
          <div className="px-3 py-2 text-[11px] text-white/30 font-medium">
            {DIAS_SEMANA[dayOfWeek]}, {fecha.split('-').reverse().join('/')}
            <span className="ml-2 text-white/20">{turnos.length} turno{turnos.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[56px,1fr]" style={{ minHeight: `${timelineHeight}px` }}>
            {/* Time column */}
            <div className="border-r border-white/[0.06] bg-white/[0.02]">
              {horas.map((hora) => (
                <div key={hora} className="text-[10px] text-white/20 px-1.5 pt-0.5" style={{ height: `${PX_POR_HORA}px` }}>
                  {hora}
                </div>
              ))}
            </div>

            {/* Appointments area */}
            <div className="relative" style={{ height: `${timelineHeight}px` }}>
              {/* Hour grid lines */}
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
              {horas.slice(0, -1).map((hora, i) => (
                <button
                  key={hora}
                  type="button"
                  onClick={() => router.push(`/dashboard/turnos/nuevo?fecha=${fecha}&hora=${hora}`)}
                  className="absolute left-0 right-0 opacity-0 hover:opacity-100 transition-opacity"
                  style={{
                    top: `${i * PX_POR_HORA}px`,
                    height: `${PX_POR_HORA}px`,
                  }}
                >
                  <span className="absolute inset-0 bg-white/[0.04] rounded-lg mx-1 my-0.5" />
                </button>
              ))}

              {/* Turnos */}
              {turnos.map((turno) => {
                const inicioMin = hhmm2min(turno.horaInicio)
                const finMin = inicioMin + turno.duracion
                const topPx = minToPx(inicioMin)
                const heightPx = Math.max(minToPx(finMin) - topPx, 20)
                const color = turno.servicio?.color ?? '#5448EE'

                return (
                  <Link
                    key={turno.id}
                    href={`/dashboard/turnos/${turno.id}`}
                    className="absolute left-1 right-1 rounded-lg overflow-hidden px-2 py-1 hover:brightness-110 transition-all z-10"
                    style={{
                      top: `${topPx}px`,
                      minHeight: `${heightPx}px`,
                      backgroundColor: `${color}30`,
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    <p className="text-white text-[11px] font-medium truncate leading-tight">
                      {turno.horaInicio} · {turno.clienteNombre}
                    </p>
                    {heightPx > 32 && (
                      <p className="text-white/70 text-[10px] truncate leading-tight">
                        {turno.servicio?.nombre ?? 'Turno'} · {formatCurrency(turno.precio)}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick list */}
      {turnos.length > 0 && (
        <div className="space-y-1.5">
          {turnos.map((turno) => (
            <Link
              key={turno.id}
              href={`/dashboard/turnos/${turno.id}`}
              className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 hover:bg-white/[0.05] transition-colors"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: turno.servicio?.color ?? '#5448EE' }}
              />
              <span className="text-white/50 text-[11px] font-mono w-14">{turno.horaInicio}</span>
              <span className="text-white text-[13px] font-medium">{turno.clienteNombre}</span>
              <span className="text-white/30 text-[12px] truncate ml-auto">{turno.servicio?.nombre ?? ''}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
