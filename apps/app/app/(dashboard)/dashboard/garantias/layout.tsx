import { getAlertas } from '@/lib/actions/garantia'
import GarantiasShell from '@/app/components/garantias/GarantiasShell'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const alertas = await getAlertas()
  return <GarantiasShell alertas={alertas.length}>{children}</GarantiasShell>
}
