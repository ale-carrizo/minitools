import { getReportesConfig, getReportesResumen } from '@/lib/actions/reportes'
import { todayAR } from '@/lib/date'
import ReportesClient from '@/app/components/reportes/ReportesClient'

function startOfMonth(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}
function endOfMonth(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)
}

export default async function ReportesPage() {
  const hoy = todayAR()
  const desde = startOfMonth(hoy)
  const hasta = endOfMonth(hoy)
  const [config, resumen] = await Promise.all([
    getReportesConfig(),
    getReportesResumen(desde, hasta),
  ])

  return <ReportesClient configInicial={config} resumenInicial={resumen} />
}
