import { getSocio } from '@/lib/actions/socios'
import SocioForm from '@/app/components/socios/SocioForm'

interface Props { params: Promise<{ id: string }> }

export default async function EditarSocioPage({ params }: Props) {
  const { id } = await params
  const socio = await getSocio(id)
  return (
    <div className="max-w-2xl">
      <p className="text-[13px] text-white/40 mb-5">Editá los datos del cliente.</p>
      <SocioForm key={id} socio={socio} />
    </div>
  )
}
