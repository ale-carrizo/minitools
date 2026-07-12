import Link from 'next/link'
import TemplateListClient from '@/app/components/presupuesto/TemplateListClient'
import { getPresupuestoTemplates } from '@/lib/actions/presupuesto'

export default async function PresupuestoTemplatePage() {
  const templates = await getPresupuestoTemplates()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">Templates</h2>
        <p className="mt-1 text-sm text-white/45">
          Podés crear hasta 4 templates. El que esté "En uso" es el que se aplica en nuevos presupuestos y en el PDF.
        </p>
      </div>
      {templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] px-4 py-10 text-center">
          <p className="mb-4 text-[13px] text-white/40">Todavía no creaste ningún template.</p>
          <Link href="/dashboard/presupuestos/template/nuevo" className="inline-block rounded-xl bg-[#5448EE] px-4 py-2.5 text-[13px] font-medium text-white btn-solid-text hover:bg-[#4438DE]">
            + Crear el primero
          </Link>
        </div>
      ) : (
        <TemplateListClient templates={templates} />
      )}
    </div>
  )
}
