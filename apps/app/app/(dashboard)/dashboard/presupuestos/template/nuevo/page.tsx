import TemplateForm from '@/app/components/presupuesto/TemplateForm'

export default function NuevoTemplatePage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">Nuevo template</h2>
        <p className="mt-1 text-sm text-white/45">
          Configura tu marca, textos por defecto y servicios frecuentes para acelerar cada presupuesto.
        </p>
      </div>
      <TemplateForm template={null} />
    </div>
  )
}
