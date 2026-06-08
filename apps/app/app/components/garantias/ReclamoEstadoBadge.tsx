import { RECLAMO_ESTADO_CONFIG, type ReclamoEstado } from '@/types/garantia'

export default function ReclamoEstadoBadge({ estado }: { estado: ReclamoEstado }) {
  const config = RECLAMO_ESTADO_CONFIG[estado]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  )
}
