import HistorialEmpleado from '@/app/components/asistencia/HistorialEmpleado'
import { getEmpleados } from '@/lib/actions/asistencia'

export default async function HistorialPage() {
  const empleados = await getEmpleados()
  return <HistorialEmpleado empleados={empleados} />
}
