import ServiciosList from '@/app/components/turnos/ServiciosList'
import { getServicios } from '@/lib/actions/turno'

export default async function ServiciosPage() {
  const servicios = await getServicios()
  return <ServiciosList servicios={servicios} />
}
