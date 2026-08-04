import SocioForm from '@/app/components/socios/SocioForm'
import { getSociosConfig } from '@/lib/actions/socios'

export default async function NuevoSocioPage() {
  const config = await getSociosConfig()
  return (
    <div className="max-w-2xl">
      <p className="text-[13px] text-white/40 mb-5">Completá los datos del cliente y su configuración de cobro.</p>
      <SocioForm camposDef={config.camposPersonalizados} />
    </div>
  )
}
