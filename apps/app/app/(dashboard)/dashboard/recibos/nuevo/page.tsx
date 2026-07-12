import { getReciboCobroConfig } from '@/lib/actions/recibos'
import NuevoReciboClient from '@/app/components/recibos/NuevoReciboClient'

export default async function NuevoReciboPage() {
  const config = await getReciboCobroConfig()
  return <NuevoReciboClient config={config} />
}
