import { redirect } from 'next/navigation'
import PresupuestoForm from '@/app/components/presupuesto/PresupuestoForm'
import { getClientes, getPresupuesto } from '@/lib/actions/presupuesto'

export default async function EditarPresupuestoPage({ params }: { params: { id: string } }) {
  const [presupuesto, clientes] = await Promise.all([
    getPresupuesto(params.id),
    getClientes(),
  ])

  if (!presupuesto) redirect('/dashboard/presupuestos')
  if (presupuesto.estado !== 'borrador') redirect(`/dashboard/presupuestos/${params.id}`)

  return <PresupuestoForm presupuesto={presupuesto} clientes={clientes} />
}
