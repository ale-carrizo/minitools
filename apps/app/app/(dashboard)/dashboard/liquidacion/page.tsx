import LiquidacionesList from '@/app/components/liquidacion/LiquidacionesList'
import { getLiquidaciones } from '@/lib/actions/liquidacion'

export default async function LiquidacionPage() {
  const liquidaciones = await getLiquidaciones()
  return <LiquidacionesList liquidaciones={liquidaciones} />
}
