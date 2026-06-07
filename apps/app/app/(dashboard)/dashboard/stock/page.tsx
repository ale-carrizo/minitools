import { getProductos } from '@/lib/actions/stock'
import ProductoList from '@/app/components/stock/ProductoList'
import Link from 'next/link'

export default async function StockPage() {
  const productos = await getProductos()

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] text-white/40">{productos.length} producto{productos.length !== 1 ? 's' : ''} en inventario</p>
        <Link
          href="/dashboard/stock/nuevo"
          className="px-4 py-2 text-[12px] font-medium bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl transition-colors"
        >
          + Agregar producto
        </Link>
      </div>
      <ProductoList productos={productos} />
    </div>
  )
}
