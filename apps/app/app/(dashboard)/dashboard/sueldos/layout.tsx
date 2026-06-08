import { getRecibos } from '@/lib/actions/recibo'
import SueldosShell from '@/app/components/sueldos/SueldosShell'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const recibos = await getRecibos()
  const borradores = recibos.filter((recibo) => recibo.estado === 'borrador').length
  return <SueldosShell borradores={borradores}>{children}</SueldosShell>
}
