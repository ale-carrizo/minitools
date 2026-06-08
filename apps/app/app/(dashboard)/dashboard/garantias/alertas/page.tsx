import { getAlertas } from '@/lib/actions/garantia'
import AlertasList from '@/app/components/garantias/AlertasList'

export default async function AlertasPage() {
  const alertas = await getAlertas()
  return <AlertasList garantias={alertas} />
}
