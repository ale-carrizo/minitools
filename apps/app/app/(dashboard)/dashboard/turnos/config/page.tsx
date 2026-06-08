import ConfigForm from '@/app/components/turnos/ConfigForm'
import { getConfig } from '@/lib/actions/turno'

export default async function ConfigPage() {
  const config = await getConfig()
  return (
    <div className="max-w-xl">
      <h2 className="text-[16px] font-semibold text-white mb-1">Horarios y disponibilidad</h2>
      <p className="text-white/40 text-[13px] mb-6">
        Configurá cuándo abrís y cada cuánto se generan los slots de turnos.
      </p>
      <ConfigForm config={config} />
    </div>
  )
}
