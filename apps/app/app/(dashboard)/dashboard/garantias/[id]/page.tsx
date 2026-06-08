import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGarantia } from '@/lib/actions/garantia'
import GarantiaDetalle from '@/app/components/garantias/GarantiaDetalle'

export default async function GarantiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const garantia = await getGarantia(id)
  if (!garantia) notFound()

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-[13px] text-white/30">
        <Link href="/dashboard/garantias" className="hover:text-white/60">Garantías</Link>
        <span>/</span>
        <span className="text-white/60">{garantia.nombre}</span>
      </div>
      <GarantiaDetalle garantia={garantia} />
    </div>
  )
}
