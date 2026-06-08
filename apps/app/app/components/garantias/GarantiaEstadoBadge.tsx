import { GARANTIA_ESTADO_CONFIG, type GarantiaEstado } from '@/types/garantia'

export default function GarantiaEstadoBadge({ estado }: { estado: GarantiaEstado }) {
  const config = GARANTIA_ESTADO_CONFIG[estado]
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium border ${config.color} ${config.bg} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
