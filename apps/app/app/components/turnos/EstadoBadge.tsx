import { ESTADO_CONFIG, type TurnoEstado } from '@/types/turno'

export default function EstadoBadge({ estado }: { estado: TurnoEstado }) {
  const config = ESTADO_CONFIG[estado]
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium border ${config.color} ${config.bg} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className="opacity-80">{config.icon}</span>
      {config.label}
    </span>
  )
}
