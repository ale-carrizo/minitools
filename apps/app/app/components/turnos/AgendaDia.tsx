'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useTransition } from 'react'
import { cambiarEstado } from '@/lib/actions/turno'
import {
  DIAS_SEMANA,
  ESTADO_CONFIG,
  formatCurrency,
  formatFechaBonita,
  generarSlots,
  hhmm2min,
  offsetFecha,
  type Turno,
  type TurnoConfig,
} from '@/types/turno'

export const ALTURA_SLOT = 64

export default function AgendaDia({
  fecha,
  turnos,
  config,
}: {
  fecha: string
  turnos: Turno[]
  config: TurnoConfig
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const slots = useMemo(() => generarSlots(config.horaInicio, config.horaFin, config.intervalo), [config])
  const timelineHeight = slots.length * ALTURA_SLOT
  const dayOfWeek = new Date(`${fecha}T00:00:00`).getDay()
  const esHabil = config.diasHabiles.includes(dayOfWeek)

  function goTo(nextFecha: string) {
    router.push(`/dashboard/turnos?fecha=${nextFecha}`)
  }

  function quickState(id: string, estado: 'confirmado' | 'completado' | 'cancelado') {
    startTransition(async () => {
      await cambiarEstado(id, estado)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => goTo(offsetFecha(fecha, -1))} className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
            ← Ayer
          </button>
          <button onClick={() => goTo(new Date().toISOString().slice(0, 10))} className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
            Hoy
          </button>
        </div>
        <p className="text-white text-[18px] font-semibold">{formatFechaBonita(fecha)}</p>
        <button onClick={() => goTo(offsetFecha(fecha, 1))} className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
          Mañana →
        </button>
      </div>

      {!esHabil ? (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-[13px] text-yellow-200">
          📅 Este día no está configurado como día hábil
        </div>
      ) : null}

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[64px,1fr]">
          <div className="border-r border-white/[0.06] bg-white/[0.02]" />
          <div className="px-4 py-3 text-[12px] text-white/35">{DIAS_SEMANA[dayOfWeek]} · {fecha}</div>
        </div>

        <div className="grid grid-cols-[64px,1fr]">
          <div className="border-r border-white/[0.06] bg-white/[0.02]">
            {slots.map((slot) => (
              <div key={slot} className="h-16 border-b border-white/[0.04] px-3 pt-2 text-[11px] text-white/20">
                {slot.endsWith(':00') ? slot : ''}
              </div>
            ))}
          </div>

          <div className="relative" style={{ height: `${timelineHeight}px` }}>
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => router.push(`/dashboard/turnos/nuevo?fecha=${fecha}&hora=${slot}`)}
                className="absolute left-0 right-0 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                style={{
                  top: `${(hhmm2min(slot) - hhmm2min(config.horaInicio)) / config.intervalo * ALTURA_SLOT}px`,
                  height: `${ALTURA_SLOT}px`,
                }}
              />
            ))}

            {turnos.map((turno) => {
              const topPx = ((hhmm2min(turno.horaInicio) - hhmm2min(config.horaInicio)) / config.intervalo) * ALTURA_SLOT
              const heightPx = (turno.duracion / config.intervalo) * ALTURA_SLOT
              const color = turno.servicio?.color ?? '#5448EE'

              return (
                <button
                  key={turno.id}
                  type="button"
                  onClick={() => router.push(`/dashboard/turnos/${turno.id}`)}
                  className="absolute left-2 right-2 rounded-lg overflow-hidden text-left px-3 py-2 shadow-sm"
                  style={{
                    top: `${topPx}px`,
                    height: `${heightPx}px`,
                    backgroundColor: `${color}CC`,
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  {heightPx > 40 ? (
                    <>
                      <p className="text-white text-[12px] font-medium truncate">{turno.clienteNombre} — {turno.horaInicio}</p>
                      <p className="text-white/80 text-[11px] truncate mt-1">{turno.servicio?.nombre ?? 'Turno manual'}</p>
                    </>
                  ) : (
                    <p className="text-white text-[11px] font-medium truncate">{turno.clienteNombre}</p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {turnos.map((turno) => {
          const status = ESTADO_CONFIG[turno.estado]
          return (
            <div key={turno.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-white font-medium">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${status.dot}`} />
                    {turno.horaInicio} - {turno.horaFin} · {turno.clienteNombre}
                  </p>
                  <p className="text-[13px] text-white/40 mt-1">
                    {[turno.servicio?.nombre ?? 'Turno manual', formatCurrency(turno.precio)].join(' · ')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {turno.estado === 'pendiente' ? (
                    <>
                      <button onClick={() => quickState(turno.id, 'confirmado')} disabled={isPending} className="border border-emerald-500/25 hover:border-emerald-500/45 text-emerald-300 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Confirmar</button>
                      <button onClick={() => quickState(turno.id, 'cancelado')} disabled={isPending} className="border border-red-500/20 hover:border-red-500/35 text-red-300 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Cancelar</button>
                    </>
                  ) : null}
                  {turno.estado === 'confirmado' ? (
                    <>
                      <button onClick={() => quickState(turno.id, 'completado')} disabled={isPending} className="border border-white/10 hover:border-white/20 text-white/70 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Completar</button>
                      <button onClick={() => quickState(turno.id, 'cancelado')} disabled={isPending} className="border border-red-500/20 hover:border-red-500/35 text-red-300 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Cancelar</button>
                    </>
                  ) : null}
                  <Link href={`/dashboard/turnos/${turno.id}`} className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
                    Ver
                  </Link>
                </div>
              </div>
            </div>
          )
        })}

        {turnos.length === 0 ? (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-10 text-center">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-white font-medium">No hay turnos para este día</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
