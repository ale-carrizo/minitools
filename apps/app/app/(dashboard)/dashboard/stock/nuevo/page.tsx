import Link from 'next/link'
import ProductoForm from '@/app/components/stock/ProductoForm'

export default function NuevoProductoPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-[13px] text-white/30">
        <Link href="/dashboard/stock/inventario" className="hover:text-white/60 transition-colors">Inventario</Link>
        <span>/</span>
        <span className="text-white/60">Nuevo producto</span>
      </div>
      <ProductoForm />
    </div>
  )
}
