import { notFound } from 'next/navigation'
import ReciboDetalle from '@/app/components/sueldos/ReciboDetalle'
import { getConfig, getRecibo } from '@/lib/actions/recibo'

export default async function ReciboPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [recibo, config] = await Promise.all([getRecibo(id), getConfig()])
  if (!recibo) notFound()
  return <ReciboDetalle recibo={recibo} config={config} />
}
