import { getSociosConfig } from '@/lib/actions/socios'
import SociosConfigClient from '@/app/components/socios/SociosConfigClient'

export default async function SociosConfigPage() {
  const config = await getSociosConfig()
  return <SociosConfigClient configInicial={config} />
}
