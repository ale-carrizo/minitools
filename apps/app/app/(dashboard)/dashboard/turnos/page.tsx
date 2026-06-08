import AgendaDia from '@/app/components/turnos/AgendaDia'
import AgendaSemana from '@/app/components/turnos/AgendaSemana'
import { getConfig, getTurnos, getTurnosSemana } from '@/lib/actions/turno'
import { semanaDeDate, todayString } from '@/types/turno'

export default async function TurnosPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; vista?: string }>
}) {
  const sp = await searchParams
  const fecha = sp.fecha ?? todayString()
  const vista = sp.vista ?? 'dia'

  const config = await getConfig()

  if (vista === 'semana') {
    const semana = semanaDeDate(fecha)
    const turnosSemana = await getTurnosSemana(semana[0], semana[6])
    return <AgendaSemana semana={semana} turnos={turnosSemana} config={config} />
  }

  const turnos = await getTurnos(fecha)
  return <AgendaDia fecha={fecha} turnos={turnos} config={config} />
}
