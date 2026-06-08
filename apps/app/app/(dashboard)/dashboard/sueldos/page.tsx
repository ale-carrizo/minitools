import { getConfig, getRecibos } from '@/lib/actions/recibo'
import RecibosList from '@/app/components/sueldos/RecibosList'

export default async function SueldosPage() {
  const [recibos, config] = await Promise.all([getRecibos(), getConfig()])
  return <RecibosList recibos={recibos} config={config} />
}
