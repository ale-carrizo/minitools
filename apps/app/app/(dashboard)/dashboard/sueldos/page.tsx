import { getReciboConfig } from '@/lib/actions/sueldos'
import SueldosClient from '@/app/components/sueldos/SueldosClient'

export default async function SueldosPage() {
  const config = await getReciboConfig()
  return <SueldosClient config={config} />
}
