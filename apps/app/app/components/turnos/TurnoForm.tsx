'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearTurno, editarTurno } from '@/lib/actions/turno'
import {
  formatCurrency,
  generarSlots,
  sumarMinutos,
  type Turno,
  type TurnoConfig,
  type TurnoServicio,
} from '@/types/turno'

export default function TurnoForm({
  turno,
  servicios,
  fechaDefault,
  horaDefault,
  config,
}: {
  turno?: Turno
  servicios: TurnoServicio[]
  fechaDefault: string
  horaDefault?: string
  config: TurnoConfig
}) {
  const router = useRouter()
  const [servicioId, setServicioId] = useState(turno?.servicioId ?? '')
  const [clienteNombre, setClienteNombre] = useState(turno?.clienteNombre ?? '')
  const [clienteTel, setClienteTel] = useState(turno?.clienteTel ?? '')
  const [clienteEmail, setClienteEmail] = useState(turno?.clienteEmail ?? '')
  const [fecha, setFecha] = useState(turno?.fecha ?? fechaDefault)
  const [horaInicio, setHoraInicio] = useState(turno?.horaInicio ?? horaDefault ?? '')
  const [duracion, setDuracion] = useState(turno?.duracion ?? 30)
  const [precio, setPrecio] = useState(turno?.precio ?? 0)
  const [notas, setNotas] = useState(turno?.notas ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const slots = useMemo(() => generarSlots(config.horaInicio, config.horaFin, config.intervalo), [config])
  const servicioSeleccionado = useMemo(() => servicios.find((servicio) => servicio.id === servicioId) ?? null, [servicioId, servicios])
  const horaFin = horaInicio ? sumarMinutos(horaInicio, duracion) : ''

  useEffect(() => {
    if (!servicioSeleccionado) return
    setDuracion(servicioSeleccionado.duracion)
    setPrecio(servicioSeleccionado.precio)
  }, [servicioSeleccionado])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!clienteNombre.trim()) {
      setError('Completá el nombre del cliente')
      return
    }
    if (!horaInicio) {
      setError('Seleccioná una hora de inicio')
      return
    }

    startTransition(async () => {
      try {
        const payload = {
          servicioId,
          clienteNombre,
          clienteTel,
          clienteEmail,
          fecha,
          horaInicio,
          duracion,
          precio,
          notas,
        }

        if (turno) {
          await editarTurno(turno.id, payload)
        } else {
          await crearTurno(payload)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar el turno')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto md:mx-0 space-y-5">
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 md:p-5 space-y-4">
        <div>
          <h2 className="text-white font-semibold text-[15px]">Servicio</h2>
          <p className="text-white/35 text-[12px] mt-1">Seleccioná un servicio predefinido o cargá una duración personalizada.</p>
        </div>
        {servicios.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {servicios.map((servicio) => {
              const active = servicio.id === servicioId
              return (
                <button
                  key={servicio.id}
                  type="button"
                  onClick={() => setServicioId(servicio.id)}
                  className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                    active ? 'text-white' : 'border-white/10 bg-white/[0.03] text-white/55 hover:text-white/80'
                  }`}
                  style={active ? { backgroundColor: `${servicio.color}33`, borderColor: servicio.color, color: 'white' } : undefined}
                >
                  <span className="block text-[12px] font-medium">{servicio.nombre}</span>
                  <span className="block text-[11px] opacity-70">{servicio.duracion} min · {servicio.precio > 0 ? formatCurrency(servicio.precio) : 'Gratis'}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-[13px] text-white/40">Todavía no hay servicios creados.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Servicio vinculado</label>
            <select value={servicioId} onChange={(e) => setServicioId(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60">
              <option value="">Sin servicio predefinido</option>
              {servicios.map((servicio) => <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Duración personalizada</label>
            <input type="number" min="15" step="15" value={duracion} onChange={(e) => setDuracion(Number(e.target.value))} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
          </div>
        </div>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 md:p-5 space-y-4">
        <div>
          <h2 className="text-white font-semibold text-[15px]">Fecha y hora</h2>
          <p className="text-white/35 text-[12px] mt-1">Los horarios se generan según tu configuración actual.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Fecha *</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Hora de inicio *</label>
            <select value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60">
              <option value="">Seleccionar horario</option>
              {slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select>
          </div>
        </div>
        {horaInicio ? <p className="text-[12px] text-[#8880F5]">Turno de {horaInicio} a {horaFin} ({duracion} min)</p> : null}
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 md:p-5 space-y-4">
        <div>
          <h2 className="text-white font-semibold text-[15px]">Cliente</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-[12px] text-white/50">Nombre *</label>
            <input value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} placeholder="Nombre del cliente" className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Teléfono</label>
            <input value={clienteTel} onChange={(e) => setClienteTel(e.target.value)} placeholder="+54 9 11 1234-5678" className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
            <p className="text-[11px] text-white/30">Para recordatorios, usá formato: 5491112345678</p>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Email</label>
            <input type="email" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
          </div>
        </div>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 md:p-5 space-y-4">
        <div>
          <h2 className="text-white font-semibold text-[15px]">Precio y notas</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Precio</label>
            <input type="number" min="0" step="1" value={precio} onChange={(e) => setPrecio(Number(e.target.value))} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-[12px] text-white/50">Notas</label>
            <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={4} className="w-full resize-none bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
          </div>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">{error}</div> : null}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isPending} className="bg-[#5448EE] hover:bg-[#4438DE] disabled:opacity-70 text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
          {isPending ? 'Guardando...' : turno ? 'Guardar cambios' : 'Guardar turno'}
        </button>
      </div>
    </form>
  )
}
