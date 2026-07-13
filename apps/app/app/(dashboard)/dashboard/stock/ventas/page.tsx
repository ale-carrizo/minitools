import { getProductos } from '@/lib/actions/stock'
import VentasClient from '@/app/components/stock/VentasClient'

export default async function VentasPage() {
  const productos = await getProductos()
  return <VentasClient productos={productos} />
}
