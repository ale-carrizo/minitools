import TurnoForm from '@/app/components/turnos/TurnoForm'
import { getConfig, getServicios } from '@/lib/actions/turno'
import { todayString } from '@/types/turno'

export default async function NuevoTurnoPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; hora?: string }>
}) {
  const sp = await searchParams
  const [servicios, config] = await Promise.all([getServicios(), getConfig()])

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-[13px] text-white/30">
        <span>Agenda</span>
        <span>/</span>
        <span className="text-white/60">Nuevo turno</span>
      </div>
      <TurnoForm
        servicios={servicios}
        config={config}
        fechaDefault={sp.fecha ?? todayString()}
        horaDefault={sp.hora}
      />
    </div>
  )
}
