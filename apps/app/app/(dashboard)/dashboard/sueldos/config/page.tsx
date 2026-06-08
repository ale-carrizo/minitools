import ConfigForm from '@/app/components/sueldos/ConfigForm'
import { getConfig } from '@/lib/actions/recibo'

export default async function ConfigPage() {
  const config = await getConfig()
  return (
    <div className="max-w-xl">
      <h2 className="text-[16px] font-semibold text-white mb-1">Datos del empleador</h2>
      <p className="text-white/40 text-[13px] mb-6">Aparecen en el encabezado de todos los recibos.</p>
      <ConfigForm config={config} />
    </div>
  )
}
