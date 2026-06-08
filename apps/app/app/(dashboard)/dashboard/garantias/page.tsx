import { getGarantias } from '@/lib/actions/garantia'
import GarantiasList from '@/app/components/garantias/GarantiasList'

export default async function GarantiasPage() {
  const garantias = await getGarantias()
  return <GarantiasList garantias={garantias} />
}
