import { getSocios } from '@/lib/actions/socios'
import ClientesClient from '@/app/components/socios/ClientesClient'

export default async function SociosPage() {
  const socios = await getSocios()
  return <ClientesClient socios={socios} />
}
