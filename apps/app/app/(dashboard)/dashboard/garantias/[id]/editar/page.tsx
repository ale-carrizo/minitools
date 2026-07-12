import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGarantia } from '@/lib/actions/garantia'
import GarantiaForm from '@/app/components/garantias/GarantiaForm'

export default async function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const garantia = await getGarantia(id)
  if (!garantia) notFound()

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-[13px] text-white/30">
        <Link href="/dashboard/garantias" className="hover:text-white/60">Garantías</Link>
        <span>/</span>
        <Link href={`/dashboard/garantias/${garantia.id}`} className="hover:text-white/60">{garantia.nombre}</Link>
        <span>/</span>
        <span className="text-white/60">Editar</span>
      </div>
      <GarantiaForm key={garantia.id} garantia={garantia} />
    </div>
  )
}
