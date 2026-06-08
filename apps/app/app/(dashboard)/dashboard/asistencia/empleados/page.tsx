import EmpleadosList from '@/app/components/asistencia/EmpleadosList'
import { getEmpleados } from '@/lib/actions/asistencia'

export default async function EmpleadosPage() {
  const empleados = await getEmpleados()
  return <EmpleadosList empleados={empleados} />
}
