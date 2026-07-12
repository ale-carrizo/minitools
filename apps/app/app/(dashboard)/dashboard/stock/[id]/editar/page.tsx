import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProducto } from '@/lib/actions/stock'
import ProductoForm from '@/app/components/stock/ProductoForm'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const producto = await getProducto(id)
  if (!producto) notFound()

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-[13px] text-white/30">
        <Link href="/dashboard/stock" className="hover:text-white/60 transition-colors">Inventario</Link>
        <span>/</span>
        <Link href={`/dashboard/stock/${producto.id}`} className="hover:text-white/60 transition-colors">{producto.nombre}</Link>
        <span>/</span>
        <span className="text-white/60">Editar</span>
      </div>
      <ProductoForm key={producto.id} producto={producto} />
    </div>
  )
}
