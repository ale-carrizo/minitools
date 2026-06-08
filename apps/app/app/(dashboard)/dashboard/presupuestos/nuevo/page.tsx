import PresupuestoForm from '@/app/components/presupuesto/PresupuestoForm'
import { getClientes } from '@/lib/actions/presupuesto'

export default async function NuevoPresupuestoPage() {
  const clientes = await getClientes()
  return <PresupuestoForm clientes={clientes} />
}
