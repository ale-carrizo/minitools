import PresupuestoForm from '@/app/components/presupuesto/PresupuestoForm'
import { getClientes, getPresupuestoTemplate } from '@/lib/actions/presupuesto'
import { getClientesSugeridos } from '@/lib/actions/clientes-sugeridos'

export default async function NuevoPresupuestoPage() {
  const [clientes, template, clientesSugeridos] = await Promise.all([
    getClientes(), getPresupuestoTemplate(), getClientesSugeridos(),
  ])
  return <PresupuestoForm clientes={clientes} template={template} clientesSugeridos={clientesSugeridos} />
}
