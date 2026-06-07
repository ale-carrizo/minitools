import { getResumenHoy } from "@/lib/actions/caja"
import CobroList from "@/app/components/caja/CobroList"

export default async function CajaPage() {
  const resumen = await getResumenHoy()
  return <CobroList resumen={resumen} />
}
