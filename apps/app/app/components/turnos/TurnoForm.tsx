'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearTurno, editarTurno } from '@/lib/actions/turno'
import {
  formatCurrency,
  generarSlots,
  sumarMinutos,
  type EmpleadoTurno,
  type Turno,
  type TurnoConfig,
  type TurnoServicio,
} from '@/types/turno'
import EmpleadoRapidoModal from './EmpleadoRapidoModal'
import ClienteCombobox from '@/app/components/shared/ClienteCombobox'
import type { ClienteSugerido } from '@/lib/actions/clientes-sugeridos'

export default function TurnoForm({
  turno,
  servicios,
  empleados,
  fechaDefault,
  horaDefault,
  config,
  clientesSugeridos = [],
}: {
  turno?: Turno
  servicios: TurnoServicio[]
  empleados: EmpleadoTurno[]
  fechaDefault: string
  horaDefault?: string
  config: TurnoConfig
  clientesSugeridos?: ClienteSugerido[]
}) {
  const router = useRouter()
  const [servicioId, setServicioId] = useState(turno?.servicioId ?? '')
  const [empleadoId, setEmpleadoId] = useState(turno?.empleadoId ?? '')
  const [clienteNombre, setClienteNombre] = useState(turno?.clienteNombre ?? '')
  const [clienteTel, setClienteTel] = useState(turno?.clienteTel ?? '')
  const [clienteEmail, setClienteEmail] = useState(turno?.clienteEmail ?? '')
  const [fecha, setFecha] = useState(turno?.fecha ?? fechaDefault)
  const [horaInicio, setHoraInicio] = useState(turno?.horaInicio ?? horaDefault ?? '')
  const [duracion, setDuracion] = useState(turno?.duracion ?? 30)
  const [precio, setPrecio] = useState(turno?.precio ?? 0)
  const [pedirSenia, setPedirSenia] = useState((turno?.senia ?? 0) > 0)
  const [senia, setSenia] = useState(turno?.senia ?? 0)
  const [seniaPagada, setSeniaPagada] = useState(turno?.seniaPagada ?? false)
  const [notas, setNotas] = useState(turno?.notas ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [localEmpleados, setLocalEmpleados] = useState(empleados)
  const [showEmpleadoModal, setShowEmpleadoModal] = useState(false)

  const slots = useMemo(() => generarSlots(config.horaInicio, config.horaFin, config.intervalo), [config])
  const servicioSeleccionado = useMemo(() => servicios.find((s) => s.id === servicioId) ?? null, [servicioId, servicios])
  const horaFin = horaInicio ? sumarMinutos(horaInicio, duracion) : ''

  useEffect(() => {
    if (!servicioSeleccionado) return
    setDuracion(servicioSeleccionado.duracion)
    setPrecio(servicioSeleccionado.precio)
  }, [servicioSeleccionado])

  function normalizarWhatsApp(tel: string): string {
    const digits = tel.replace(/\D/g, '')
    if (!digits) return ''
    if (digits.startsWith('549')) return digits
    if (digits.startsWith('54')) return digits
    if (digits.startsWith('9')) return `54${digits}`
    return `549${digits}`
  }

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
    if (clienteTel.trim()) {
      const digits = clienteTel.replace(/\D/g, '')
      if (digits.length < 10) {
        setError('El teléfono debe tener al menos 10 dígitos para enviar recordatorios')
        return
      }
    }

    startTransition(async () => {
      try {
        const payload = {
          servicioId,
          empleadoId,
          clienteNombre,
          clienteTel: normalizarWhatsApp(clienteTel),
          clienteEmail,
          fecha,
          horaInicio,
          duracion,
          precio,
          senia: pedirSenia ? senia : 0,
          seniaPagada,
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
    <>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto md:mx-0 space-y-5">
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 md:p-5 space-y-4">
        <div>
          <h2 className="text-white font-semibold text-[15px]">Servicio y empleado</h2>
          <p className="text-white/35 text-[12px] mt-1">Asigná un servicio y un empleado para controlar disponibilidad.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Servicio</label>
            <select value={servicioId} onChange={(e) => setServicioId(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60">
              <option value="">Sin servicio</option>
              {servicios.map((servicio) => <option key={servicio.id} value={servicio.id}>{servicio.nombre} · {servicio.duracion} min · {servicio.precio > 0 ? formatCurrency(servicio.precio) : 'Gratis'}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Empleado</label>
            <div className="flex gap-2">
              <select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)} className="flex-1 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60">
                <option value="">Sin asignar</option>
                {localEmpleados.map((empleado) => <option key={empleado.id} value={empleado.id}>{[empleado.nombre, empleado.apellido].filter(Boolean).join(' ')}</option>)}
              </select>
              <button
                type="button"
                onClick={() => setShowEmpleadoModal(true)}
                className="shrink-0 w-10 h-10 rounded-xl border border-white/[0.09] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-colors"
                title="Agregar empleado"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 md:p-5 space-y-4">
        <div>
          <h2 className="text-white font-semibold text-[15px]">Fecha y hora</h2>
          <p className="text-white/35 text-[12px] mt-1">Los horarios se generan según tu configuración actual. Dos turnos del mismo empleado no pueden superponerse.</p>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Duración (min)</label>
            <input
              type="number" min="15" step="15"
              value={duracion === 0 ? '' : duracion}
              onChange={(e) => setDuracion(e.target.value === '' ? 0 : Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Precio</label>
            <input
              type="number" min="0" step="1"
              value={precio === 0 ? '' : precio}
              onChange={(e) => setPrecio(e.target.value === '' ? 0 : Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[12px] text-white/50">
            <input
              type="checkbox"
              checked={pedirSenia}
              onChange={(e) => { setPedirSenia(e.target.checked); if (!e.target.checked) setSenia(0) }}
              className="h-4 w-4 rounded border-white/20 bg-white/[0.05] accent-[#5448EE]"
            />
            ¿Pedir seña?
          </label>
        </div>
        {pedirSenia && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Seña solicitada</label>
            <input
              type="number" min="0" step="1"
              value={senia === 0 ? '' : senia}
              onChange={(e) => setSenia(e.target.value === '' ? 0 : Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
            />
          </div>
          {turno ? (
            <div className="space-y-2">
              <label className="text-[12px] text-white/50">Estado de la seña</label>
              <select value={String(seniaPagada)} onChange={(e) => setSeniaPagada(e.target.value === 'true')} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60">
                <option value="false">Pendiente</option>
                <option value="true">Pagada</option>
              </select>
            </div>
          ) : null}
        </div>
        )}
        {horaInicio ? <p className="text-[12px] text-[#8880F5]">Turno de {horaInicio} a {horaFin} ({duracion} min)</p> : null}
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 md:p-5 space-y-4">
        <div>
          <h2 className="text-white font-semibold text-[15px]">Cliente</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-[12px] text-white/50">Nombre *</label>
            <ClienteCombobox
              sugerencias={clientesSugeridos}
              value={clienteNombre}
              onChange={setClienteNombre}
              onSeleccionar={(c) => { if (c.telefono) setClienteTel(normalizarWhatsApp(c.telefono)) }}
              placeholder="Nombre del cliente"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Teléfono</label>
            <input
              value={clienteTel}
              onChange={(e) => setClienteTel(e.target.value)}
              onBlur={(e) => setClienteTel(normalizarWhatsApp(e.target.value))}
              placeholder="351 301 6944"
              className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
            />
            <p className="text-[11px] text-white/30">Se normaliza automáticamente a formato WhatsApp (549...)</p>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Email</label>
            <input type="email" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
          </div>
        </div>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 md:p-5 space-y-4">
        <div>
          <h2 className="text-white font-semibold text-[15px]">Notas</h2>
        </div>
        <div className="space-y-2">
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} className="w-full resize-none bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">{error}</div> : null}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isPending} className="bg-[#5448EE] hover:bg-[#4438DE] disabled:opacity-70 text-white btn-solid-text rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
          {isPending ? 'Guardando...' : turno ? 'Guardar cambios' : 'Guardar turno'}
        </button>
      </div>
    </form>

      <EmpleadoRapidoModal
        open={showEmpleadoModal}
        onClose={() => setShowEmpleadoModal(false)}
        onCreated={(nuevo) => {
          setLocalEmpleados((prev) => [...prev, nuevo])
          setEmpleadoId(nuevo.id)
        }}
        empleadosActuales={localEmpleados.map((e) => e.nombre)}
      />
    </>
  )
}
