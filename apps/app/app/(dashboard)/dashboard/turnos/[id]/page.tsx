import Link from 'next/link'
import { notFound } from 'next/navigation'
import TurnoDetalle from '@/app/components/turnos/TurnoDetalle'
import { getTurno } from '@/lib/actions/turno'

export default async function TurnoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const turno = await getTurno(id)
  if (!turno) notFound()

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-[13px] text-white/30">
        <Link href="/dashboard/turnos" className="hover:text-white/60">Agenda</Link>
        <span>/</span>
        <span className="text-white/60">{turno.clienteNombre} — {turno.horaInicio}</span>
      </div>
      <TurnoDetalle turno={turno} />
    </div>
  )
}
