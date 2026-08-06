import PresupuestoList from '@/app/components/presupuesto/PresupuestoList'
import { getPresupuestos } from '@/lib/actions/presupuesto'

export default async function PresupuestosPage() {
  const presupuestos = await getPresupuestos()

  return <PresupuestoList presupuestos={presupuestos} />
}
