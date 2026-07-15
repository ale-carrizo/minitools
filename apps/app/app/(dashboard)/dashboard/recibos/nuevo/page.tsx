import { getReciboCobroConfig } from '@/lib/actions/recibos'
import { getClientesSugeridos } from '@/lib/actions/clientes-sugeridos'
import NuevoReciboClient from '@/app/components/recibos/NuevoReciboClient'

export default async function NuevoReciboPage() {
  const [config, clientesSugeridos] = await Promise.all([getReciboCobroConfig(), getClientesSugeridos()])
  return <NuevoReciboClient config={config} clientesSugeridos={clientesSugeridos} />
}
