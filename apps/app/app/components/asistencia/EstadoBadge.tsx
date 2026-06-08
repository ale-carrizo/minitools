import { ESTADO_CONFIG, type AsistenciaEstado } from '@/types/asistencia'

export default function EstadoBadge({ estado }: { estado: AsistenciaEstado }) {
  const cfg = ESTADO_CONFIG[estado]

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
