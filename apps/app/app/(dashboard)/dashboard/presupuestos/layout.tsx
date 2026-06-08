import PresupuestoShell from '@/app/components/presupuesto/PresupuestoShell'
import { getPresupuestos } from '@/lib/actions/presupuesto'

export default async function PresupuestosLayout({ children }: { children: React.ReactNode }) {
  const presupuestos = await getPresupuestos()
  const borradores = presupuestos.filter((presupuesto) => presupuesto.estado === 'borrador').length

  return <PresupuestoShell borradores={borradores}>{children}</PresupuestoShell>
}
