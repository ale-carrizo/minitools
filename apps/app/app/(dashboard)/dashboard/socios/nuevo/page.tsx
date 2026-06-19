import SocioForm from '@/app/components/socios/SocioForm'

export default function NuevoSocioPage() {
  return (
    <div className="max-w-2xl">
      <p className="text-[13px] text-white/40 mb-5">Completá los datos del cliente y su configuración de cobro.</p>
      <SocioForm />
    </div>
  )
}
