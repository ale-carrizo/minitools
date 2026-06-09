import TemplateForm from '@/app/components/presupuesto/TemplateForm'
import { getPresupuestoTemplate } from '@/lib/actions/presupuesto'

export default async function PresupuestoTemplatePage() {
  const template = await getPresupuestoTemplate()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">Template avanzada</h2>
        <p className="mt-1 text-sm text-white/45">
          Configura tu marca, textos por defecto y servicios frecuentes para acelerar cada presupuesto.
        </p>
      </div>
      <TemplateForm template={template} />
    </div>
  )
}
