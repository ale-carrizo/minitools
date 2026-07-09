'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { getRegistrosEmpleado } from '@/lib/actions/asistencia'
import { formatHoras, todayLocal, type Empleado, type RegistroAsistencia } from '@/types/asistencia'
import EstadoBadge from './EstadoBadge'

function monthStart() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default function HistorialEmpleado({ empleados }: { empleados: Empleado[] }) {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('')
  const [desde, setDesde] = useState(monthStart())
  const [hasta, setHasta] = useState(todayLocal())
  const [registros, setRegistros] = useState<RegistroAsistencia[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    load()
  }, [])

  function load() {
    startTransition(async () => {
      const data = await getRegistrosEmpleado(empleadoSeleccionado, desde, hasta)
      setRegistros(data)
    })
  }

  const resumen = useMemo(() => ({
    diasTrabajados: registros.filter((r) => r.estado === 'presente' || r.estado === 'tardanza' || r.estado === 'medio_dia').length,
    tardanzas: registros.filter((r) => r.estado === 'tardanza').length,
    ausencias: registros.filter((r) => r.estado === 'ausente').length,
    horasTotales: registros.reduce((sum, item) => sum + (item.horasTrabajadas ?? 0), 0),
  }), [registros])

  return (
    <div className="space-y-5">
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Empleado</label>
            <select
              value={empleadoSeleccionado}
              onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
            >
              <option value="">Todos los empleados</option>
              {empleados.map((empleado) => (
                <option key={empleado.id} value={empleado.id}>{empleado.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={load}
              className="bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium"
            >
              {isPending ? 'Cargando...' : 'Ver historial'}
            </button>
          </div>
        </div>
      </div>

      {registros.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: 'Días trabajados', value: resumen.diasTrabajados },
            { label: 'Tardanzas', value: resumen.tardanzas },
            { label: 'Ausencias', value: resumen.ausencias },
            { label: 'Horas totales', value: formatHoras(resumen.horasTotales) },
          ].map((item) => (
            <div key={item.label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
              <p className="text-[11px] text-white/40 mb-1">{item.label}</p>
              <p className="text-[22px] font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-white/30 uppercase tracking-wider text-[10px] border-b border-white/[0.05]">
                <th className="px-5 py-3">Fecha</th>
                {!empleadoSeleccionado ? <th className="px-5 py-3">Empleado</th> : null}
                <th className="px-5 py-3">Entrada</th>
                <th className="px-5 py-3">Salida</th>
                <th className="px-5 py-3">Horas</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Notas</th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 ? (
                <tr>
                  <td colSpan={empleadoSeleccionado ? 6 : 7} className="px-5 py-10 text-center text-white/30">
                    Sin registros en ese período
                  </td>
                </tr>
              ) : registros.map((registro) => (
                <tr key={registro.id} className="border-b border-white/[0.04]">
                  <td className="px-5 py-3 text-white/70">{new Date(`${registro.fecha}T00:00:00`).toLocaleDateString('es-AR')}</td>
                  {!empleadoSeleccionado ? <td className="px-5 py-3 text-white/70">{registro.empleado?.nombre ?? '—'}</td> : null}
                  <td className="px-5 py-3 text-white/55">{registro.horaEntrada ?? '—'}</td>
                  <td className="px-5 py-3 text-white/55">{registro.horaSalida ?? '—'}</td>
                  <td className="px-5 py-3 text-white/55">{formatHoras(registro.horasTrabajadas)}</td>
                  <td className="px-5 py-3"><EstadoBadge estado={registro.estado} /></td>
                  <td className="px-5 py-3 text-white/45">{registro.notas ?? '—'}</td>
                </tr>
              ))}
            </tbody>
            {registros.length > 0 ? (
              <tfoot>
                <tr>
                  <td colSpan={empleadoSeleccionado ? 4 : 5} className="px-5 py-3 text-right text-white/35">Total horas</td>
                  <td className="px-5 py-3 text-white font-medium">{formatHoras(resumen.horasTotales)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </div>
    </div>
  )
}
