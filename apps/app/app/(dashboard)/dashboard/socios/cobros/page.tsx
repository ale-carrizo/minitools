import { getCobrosEnRango } from '@/lib/actions/socios'
import { todayAR } from '@/lib/date'
import CalendarioClient from '@/app/components/socios/CalendarioClient'

function startOfWeek(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return d.toISOString().slice(0, 10)
}
function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default async function CobrosPage() {
  const hoy = todayAR()
  const desde = startOfWeek(hoy)
  const hasta = addDays(desde, 6)
  const cobros = await getCobrosEnRango(desde, hasta)
  return <CalendarioClient cobrosIniciales={cobros} />
}
