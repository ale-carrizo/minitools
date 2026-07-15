import { redirect } from 'next/navigation'
import PresupuestoForm from '@/app/components/presupuesto/PresupuestoForm'
import { getClientes, getPresupuesto, getPresupuestoTemplate } from '@/lib/actions/presupuesto'
import { getClientesSugeridos } from '@/lib/actions/clientes-sugeridos'

export default async function EditarPresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [presupuesto, clientes, template, clientesSugeridos] = await Promise.all([
    getPresupuesto(id),
    getClientes(),
    getPresupuestoTemplate(),
    getClientesSugeridos(),
  ])

  if (!presupuesto) redirect('/dashboard/presupuestos')
  if (presupuesto.estado !== 'borrador') redirect(`/dashboard/presupuestos/${id}`)

  return <PresupuestoForm key={presupuesto.id} presupuesto={presupuesto} clientes={clientes} template={template} clientesSugeridos={clientesSugeridos} />
}
