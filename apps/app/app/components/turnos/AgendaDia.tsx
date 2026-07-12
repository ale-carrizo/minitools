'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useTransition } from 'react'
import { cambiarEstado, marcarRecordatorioEnviado } from '@/lib/actions/turno'
import { todayAR } from '@/lib/date'
import {
  asignarCarriles,
  DIAS_SEMANA,
  ESTADO_CONFIG,
  formatCurrency,
  formatFechaBonita,
  generarLinkWhatsApp,
  hhmm2min,
  nombreEmpleado,
  offsetFecha,
  type Turno,
  type TurnoConfig,
} from '@/types/turno'

const PX_POR_HORA = 56
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
  const [isPending, startTransition] = useTransition()
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

  const carriles = useMemo(() => asignarCarriles(turnos), [turnos])

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    // Al abrir el día, scrollear directo al primer turno (o a la hora actual si es
    // hoy y no hay turnos antes) en vez de arrancar siempre desde el principio del
    // horario comercial — evita que un turno a las 11 quede fuera de vista si el
    // día empieza a las 8.
    const primerTurnoMin = turnos.length > 0
      ? Math.min(...turnos.map((t) => hhmm2min(t.horaInicio)))
      : null
    const esHoy = fecha === todayAR()
    const ahoraMin = esHoy ? new Date().getHours() * 60 + new Date().getMinutes() : null
    const objetivoMin = primerTurnoMin ?? ahoraMin
    if (objetivoMin === null) return
    const top = Math.max(minToPx(objetivoMin) - PX_POR_HORA, 0)
    scrollRef.current.scrollTop = top
  }, [fecha, turnos])

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
          <button onClick={() => goTo(todayAR())} className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
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
            className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors ${vista === 'dia' ? 'bg-[#5448EE] text-white btn-solid-text' : 'text-white/40 hover:text-white/70'}`}
          >
            Día
          </Link>
          <Link
            href={`/dashboard/turnos?fecha=${fecha}&vista=semana`}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors ${vista === 'semana' ? 'bg-[#5448EE] text-white btn-solid-text' : 'text-white/40 hover:text-white/70'}`}
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
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {/* Header */}
        <div className="flex-shrink-0 grid grid-cols-[56px_1fr] border-b border-white/[0.06]">
          <div className="border-r border-white/[0.06] bg-white/[0.02]" />
          <div className="px-3 py-2 text-[11px] text-white/30 font-medium">
            {DIAS_SEMANA[dayOfWeek]}, {fecha.split('-').reverse().join('/')}
            <span className="ml-2 text-white/20">{turnos.length} turno{turnos.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[56px_1fr]" style={{ minHeight: `${timelineHeight}px` }}>
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
                const color = turno.empleado?.color ?? turno.servicio?.color ?? '#5448EE'
                const estaCompletado = turno.estado === 'completado'
                const estadoCfg = ESTADO_CONFIG[turno.estado]
                const { lane, lanes } = carriles.get(turno.id) ?? { lane: 0, lanes: 1 }
                const widthPct = 100 / lanes
                const linkWhatsApp = generarLinkWhatsApp(turno)
                const showActions = heightPx > 56 && (turno.estado === 'pendiente' || turno.estado === 'confirmado')

                return (
                  <div
                    key={turno.id}
                    className={`absolute rounded-lg overflow-hidden shadow-md hover:brightness-110 hover:z-20 transition-all z-10 ${estaCompletado ? 'opacity-60' : ''}`}
                    style={{
                      top: `${topPx}px`,
                      minHeight: `${heightPx}px`,
                      left: `calc(${lane * widthPct}% + 4px)`,
                      width: `calc(${widthPct}% - 8px)`,
                      backgroundColor: `${color}4D`,
                      border: `1px solid ${color}80`,
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    <Link href={`/dashboard/turnos/${turno.id}`} className="block px-2 py-1">
                      <p className="text-white text-[11px] font-medium truncate leading-tight flex items-center gap-1.5">
                        <span className={`text-[10px] ${estadoCfg.color}`}>{estadoCfg.icon}</span>
                        {turno.horaInicio} · {turno.clienteNombre}
                      </p>
                      {heightPx > 32 && (
                        <p className="text-white/70 text-[10px] truncate leading-tight">
                          {turno.servicio?.nombre ?? 'Turno'} · {nombreEmpleado(turno.empleado)}
                        </p>
                      )}
                      {heightPx > 48 && turno.precio > 0 && (
                        <p className="text-white/50 text-[10px] truncate leading-tight">
                          {formatCurrency(turno.precio)}
                          {turno.senia > 0 ? ` · seña ${turno.seniaPagada ? 'pagada' : 'pendiente'}` : ''}
                        </p>
                      )}
                    </Link>
                    {showActions && (
                      <div className="flex flex-wrap items-center gap-1 px-1.5 pb-1">
                        {linkWhatsApp && (
                          <a
                            href={linkWhatsApp}
                            target="_blank"
                            rel="noreferrer"
                            title="Enviar por WhatsApp"
                            className="flex-shrink-0 rounded bg-[#25D366]/20 hover:bg-[#25D366]/35 text-[#25D366] px-1.5 py-0.5 text-[9px] font-medium transition-colors"
                          >
                            WhatsApp
                          </a>
                        )}
                        {linkWhatsApp && !turno.recordatorioEnviado && (
                          <button
                            type="button"
                            disabled={isPending}
                            title="Marcar recordatorio como enviado"
                            onClick={() => startTransition(async () => { await marcarRecordatorioEnviado(turno.id) })}
                            className="flex-shrink-0 rounded border border-white/15 hover:border-white/30 text-white/40 hover:text-white/70 px-1.5 py-0.5 text-[9px] font-medium transition-colors disabled:opacity-40"
                          >
                            ✓ enviado
                          </button>
                        )}
                        {turno.estado === 'pendiente' && (
                          <button
                            type="button"
                            disabled={isPending}
                            title="Confirmar turno"
                            onClick={() => startTransition(async () => { await cambiarEstado(turno.id, 'confirmado') })}
                            className="flex-shrink-0 rounded border border-emerald-500/25 hover:border-emerald-500/45 text-emerald-300 px-1.5 py-0.5 text-[9px] font-medium transition-colors disabled:opacity-40"
                          >
                            ✓
                          </button>
                        )}
                        {turno.estado === 'confirmado' && (
                          <button
                            type="button"
                            disabled={isPending}
                            title="Completar turno"
                            onClick={() => startTransition(async () => { await cambiarEstado(turno.id, 'completado') })}
                            className="flex-shrink-0 rounded border border-[#5448EE]/30 hover:border-[#5448EE]/50 text-[#8880F5] px-1.5 py-0.5 text-[9px] font-medium transition-colors disabled:opacity-40"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isPending}
                          title="Cancelar turno"
                          onClick={() => startTransition(async () => { await cambiarEstado(turno.id, 'cancelado') })}
                          className="flex-shrink-0 rounded border border-red-500/20 hover:border-red-500/35 text-red-300 px-1.5 py-0.5 text-[9px] font-medium transition-colors disabled:opacity-40"
                        >
                          ✗
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
