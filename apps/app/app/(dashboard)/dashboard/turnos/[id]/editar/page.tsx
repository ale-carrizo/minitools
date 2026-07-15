import { notFound } from 'next/navigation'
import TurnoForm from '@/app/components/turnos/TurnoForm'
import { getConfig, getEmpleados, getServicios, getTurno } from '@/lib/actions/turno'
import { getClientesSugeridos } from '@/lib/actions/clientes-sugeridos'

export default async function EditarTurnoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [turno, servicios, empleados, config, clientesSugeridos] = await Promise.all([
    getTurno(id),
    getServicios(),
    getEmpleados(),
    getConfig(),
    getClientesSugeridos(),
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
        key={turno.id}
        turno={turno}
        servicios={servicios}
        empleados={empleados}
        config={config}
        clientesSugeridos={clientesSugeridos}
        fechaDefault={turno.fecha}
        horaDefault={turno.horaInicio}
      />
    </div>
  )
}
