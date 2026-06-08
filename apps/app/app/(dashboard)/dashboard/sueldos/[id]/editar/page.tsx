import { notFound, redirect } from 'next/navigation'
import ReciboForm from '@/app/components/sueldos/ReciboForm'
import { getEmpleadosParaRecibo, getRecibo } from '@/lib/actions/recibo'

export default async function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [recibo, empleados] = await Promise.all([
    getRecibo(id),
    getEmpleadosParaRecibo(),
  ])
  if (!recibo) notFound()
  if (recibo.estado !== 'borrador') redirect(`/dashboard/sueldos/${id}`)

  return (
    <div>
      <div className="mb-6 text-[13px] text-white/30">Recibos / <span className="text-white/60">{recibo.empNombre}</span> / <span className="text-white/60">Editar</span></div>
      <ReciboForm recibo={recibo} empleados={empleados} defaultPeriodo={recibo.periodo} />
    </div>
  )
}
