import Link from 'next/link'
import { notFound } from 'next/navigation'
import LiquidacionDetalle from '@/app/components/liquidacion/LiquidacionDetalle'
import { getEmpleadosConSueldo, getLiquidacion } from '@/lib/actions/liquidacion'
import { formatPeriodo } from '@/types/liquidacion'

export default async function LiquidacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [liquidacion, empleados] = await Promise.all([
    getLiquidacion(id),
    getEmpleadosConSueldo(),
  ])
  if (!liquidacion) notFound()

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-[13px] text-white/30">
        <Link href="/dashboard/liquidacion" className="hover:text-white/60">Liquidaciones</Link>
        <span>/</span>
        <span className="text-white/60">{formatPeriodo(liquidacion.periodo)}</span>
      </div>
      <LiquidacionDetalle liquidacion={liquidacion} empleados={empleados} />
    </div>
  )
}
