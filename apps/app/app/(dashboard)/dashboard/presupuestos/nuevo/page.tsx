import PresupuestoForm from '@/app/components/presupuesto/PresupuestoForm'
import { getClientes, getPresupuestoTemplate } from '@/lib/actions/presupuesto'

export default async function NuevoPresupuestoPage() {
  const [clientes, template] = await Promise.all([getClientes(), getPresupuestoTemplate()])
  return <PresupuestoForm clientes={clientes} template={template} />
}
