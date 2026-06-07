import { getResumenHoy } from "@/lib/actions/caja"
import CierreClient from "@/app/components/caja/CierreClient"

export default async function CierrePage() {
  const resumen = await getResumenHoy()
  return <CierreClient resumen={resumen} />
}
