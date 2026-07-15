import { getProductos } from '@/lib/actions/stock'
import StockToolbar from '@/app/components/stock/StockToolbar'
import ProductoList from '@/app/components/stock/ProductoList'

export default async function InventarioPage() {
  const productos = await getProductos()

  return (
    <div>
      <StockToolbar count={productos.length} />
      <ProductoList productos={productos} />
    </div>
  )
}
