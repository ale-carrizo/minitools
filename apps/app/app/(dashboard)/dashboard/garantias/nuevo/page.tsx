import GarantiaForm from '@/app/components/garantias/GarantiaForm'

export default function NuevoPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-[13px] text-white/30">
        <span>Garantías</span>
        <span>/</span>
        <span className="text-white/60">Nueva garantía</span>
      </div>
      <GarantiaForm />
    </div>
  )
}
