'use client'

import { useEffect, useState, useTransition } from 'react'
import { editarRegistro, registrarAusencia, registrarEntrada, registrarSalida } from '@/lib/actions/asistencia'
import { ahoraHHMM, formatHoras, type Empleado, type RegistroAsistencia } from '@/types/asistencia'
import RegistroDiaRow from './RegistroDiaRow'

export default function VistaHoy({
  empleados,
  registros,
  fecha,
}: {
  empleados: Empleado[]
  registros: RegistroAsistencia[]
  fecha: string
}) {
  const [registrosLocal, setRegistrosLocal] = useState(registros)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setRegistrosLocal(registros)
  }, [registros])

  useEffect(() => {
    if (!error) return
    const timeout = window.setTimeout(() => setError(null), 3000)
    return () => window.clearTimeout(timeout)
  }, [error])

  const presentes = registrosLocal.filter((r) => r.estado === 'presente' || r.estado === 'tardanza').length
  const ausentes = registrosLocal.filter((r) => r.estado === 'ausente').length
  const sinRegistrar = empleados.length - registrosLocal.length
  const totalHoras = registrosLocal.reduce((sum, item) => sum + (item.horasTrabajadas ?? 0), 0)

  const registrosByEmpleado = new Map(registrosLocal.map((registro) => [registro.empleadoId, registro]))
  const fechaDisplay = new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  function run(task: () => Promise<RegistroAsistencia>) {
    startTransition(async () => {
      try {
        const next = await task()
        setRegistrosLocal((prev) => {
          const others = prev.filter((item) => item.id !== next.id && !(item.empleadoId === next.empleadoId && item.fecha === next.fecha))
          return [...others, next].sort((a, b) => a.empleado!.nombre.localeCompare(b.empleado!.nombre))
        })
      } catch (err: any) {
        setError(err.message ?? 'No se pudo registrar')
      }
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-white/60 capitalize">Hoy, {fechaDisplay}</p>
        {isPending ? <span className="text-[12px] text-white/35">Actualizando...</span> : null}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Presentes', value: presentes },
          { label: 'Ausentes', value: ausentes },
          { label: 'Sin registrar', value: sinRegistrar },
          { label: 'Total horas del día', value: formatHoras(totalHoras) },
        ].map((item) => (
          <div key={item.label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[11px] text-white/40 mb-1">{item.label}</p>
            <p className="text-[22px] font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        {empleados.map((empleado) => {
          const registro = registrosByEmpleado.get(empleado.id) ?? null
          return (
            <RegistroDiaRow
              key={empleado.id}
              empleado={empleado}
              registro={registro}
              onEntrada={(empleadoId, hora) => run(() => registrarEntrada(empleadoId, fecha, hora || ahoraHHMM()))}
              onSalida={(registroId, hora) => run(() => registrarSalida(registroId, hora || ahoraHHMM()))}
              onAusencia={(empleadoId, estado) => run(() => registrarAusencia(empleadoId, fecha, estado))}
              onEditar={(registroId, data) => run(() => editarRegistro(registroId, data))}
            />
          )
        })}
      </div>
    </div>
  )
}
