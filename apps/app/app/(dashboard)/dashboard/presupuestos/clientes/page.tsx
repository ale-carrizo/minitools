import ClientesManager from '@/app/components/presupuesto/ClientesManager'
import { getClientes } from '@/lib/actions/presupuesto'

export default async function ClientesPage() {
  const clientes = await getClientes()
  return <ClientesManager initialClientes={clientes} />
}
