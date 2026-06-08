import EmpleadosSueldoList from '@/app/components/liquidacion/EmpleadosSueldoList'
import { getEmpleadosConSueldo } from '@/lib/actions/liquidacion'

export default async function EmpleadosPage() {
  const empleados = await getEmpleadosConSueldo()
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[16px] font-semibold text-white">Empleados y sueldos</h2>
        <p className="text-white/40 text-[13px] mt-1">
          Configurá el salario básico de cada empleado para pre-cargar las liquidaciones.
          Para agregar o quitar empleados usá{' '}
          <a href="/dashboard/asistencia" className="text-[#8880F5] hover:underline">
            Control de Asistencia
          </a>.
        </p>
      </div>
      <EmpleadosSueldoList empleados={empleados} />
    </div>
  )
}
