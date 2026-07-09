import Link from 'next/link'
import VistaHoy from '@/app/components/asistencia/VistaHoy'
import { getEmpleados, getRegistrosDia } from '@/lib/actions/asistencia'
import { todayLocal } from '@/types/asistencia'

export default async function AsistenciaPage() {
  const fecha = todayLocal()
  const [empleados, registros] = await Promise.all([
    getEmpleados(),
    getRegistrosDia(fecha),
  ])

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4">
        <p className="text-[13px] font-medium text-white/80">Que podés resolver con esta app</p>
        <p className="mt-1 text-sm leading-relaxed text-white/45">
          Llevá el control diario del presentismo, registrá ausencias y consultá el historial de cada empleado para llegar con mejor información a la liquidación de sueldos.
        </p>
      </div>

      {empleados.length === 0 ? (
        <div className="py-20 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-white/50 text-sm mb-1">No hay empleados todavía</p>
          <p className="text-white/30 text-xs mb-5">Cargá tu personal para empezar a registrar horarios, ausencias y horas trabajadas.</p>
          <Link href="/dashboard/asistencia/empleados" className="inline-flex px-4 py-2 bg-[#5448EE] text-white btn-solid-text text-[13px] rounded-xl">
            + Agregar empleados
          </Link>
        </div>
      ) : (
        <VistaHoy empleados={empleados} registros={registros} fecha={fecha} />
      )}
    </div>
  )
}
