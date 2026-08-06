import { getRecibos, getReciboCobroConfig } from '@/lib/actions/recibos'
import ReciboCobroConfigPanel from '@/app/components/recibos/ReciboCobroConfigPanel'
import RecibosListClient from '@/app/components/recibos/RecibosListClient'

export default async function RecibosPage() {
  const [recibos, config] = await Promise.all([getRecibos(), getReciboCobroConfig()])

  return (
    <div>
      <ReciboCobroConfigPanel config={config} />
      <RecibosListClient recibos={recibos} />
    </div>
  )
}
