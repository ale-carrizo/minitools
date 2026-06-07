import { getHistorial } from "@/lib/actions/caja"
import HistorialList from "@/app/components/caja/HistorialList"

export default async function HistorialPage() {
  const dias = await getHistorial()
  return <HistorialList dias={dias} />
}
