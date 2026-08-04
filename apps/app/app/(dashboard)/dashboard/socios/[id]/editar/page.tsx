import { getSocio, getSociosConfig } from '@/lib/actions/socios'
import SocioForm from '@/app/components/socios/SocioForm'

interface Props { params: Promise<{ id: string }> }

export default async function EditarSocioPage({ params }: Props) {
  const { id } = await params
  const [socio, config] = await Promise.all([getSocio(id), getSociosConfig()])
  return (
    <div className="max-w-2xl">
      <p className="text-[13px] text-white/40 mb-5">Editá los datos del cliente.</p>
      <SocioForm key={id} socio={socio} camposDef={config.camposPersonalizados} />
    </div>
  )
}
