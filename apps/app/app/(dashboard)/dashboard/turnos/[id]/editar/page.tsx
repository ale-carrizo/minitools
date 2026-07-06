import { notFound } from 'next/navigation'
import TurnoForm from '@/app/components/turnos/TurnoForm'
import { getConfig, getTurno } from '@/lib/actions/turno'

export default async function EditarTurnoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [turno, config] = await Promise.all([
    getTurno(id),
    getConfig(),
  ])
  if (!turno) notFound()

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-[13px] text-white/30">
        <span>Agenda</span>
        <span>/</span>
        <span>{turno.clienteNombre}</span>
        <span>/</span>
        <span className="text-white/60">Editar</span>
      </div>
      <TurnoForm
        turno={turno}
        config={config}
        fechaDefault={turno.fecha}
        horaDefault={turno.horaInicio}
      />
    </div>
  )
}
