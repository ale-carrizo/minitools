import { ESTADO_CONFIG, type PresupuestoEstado } from '@/types/presupuesto'

export default function EstadoBadge({ estado }: { estado: PresupuestoEstado }) {
  const config = ESTADO_CONFIG[estado]

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium ${config.bg} ${config.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
