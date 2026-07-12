import { notFound } from 'next/navigation'
import TemplateForm from '@/app/components/presupuesto/TemplateForm'
import { getPresupuestoTemplateById } from '@/lib/actions/presupuesto'

export default async function EditarTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const template = await getPresupuestoTemplateById(id)
  if (!template) notFound()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">Editar template</h2>
        <p className="mt-1 text-sm text-white/45">
          Configura tu marca, textos por defecto y servicios frecuentes para acelerar cada presupuesto.
        </p>
      </div>
      <TemplateForm key={template.id} template={template} />
    </div>
  )
}
