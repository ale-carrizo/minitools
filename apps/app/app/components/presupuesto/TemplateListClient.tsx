'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { activarPresupuestoTemplate, eliminarPresupuestoTemplate } from '@/lib/actions/presupuesto'
import { MAX_PRESUPUESTO_TEMPLATES, type PresupuestoTemplate } from '@/types/presupuesto'

export default function TemplateListClient({ templates }: { templates: PresupuestoTemplate[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function run(id: string, action: () => Promise<unknown>) {
    setError(null)
    setPendingId(id)
    startTransition(async () => {
      try {
        await action()
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'No se pudo completar la acción')
      } finally {
        setPendingId(null)
      }
    })
  }

  const puedeAgregar = templates.length < MAX_PRESUPUESTO_TEMPLATES

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">{error}</div>
      ) : null}

      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
        {templates.length} de {MAX_PRESUPUESTO_TEMPLATES} templates
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map((t) => {
          const logoIsData = t.logoUrl && (t.logoUrl.startsWith('data:') || t.logoUrl.startsWith('http'))
          return (
            <div
              key={t.id}
              className={`rounded-2xl border p-4 transition-colors ${
                t.activo ? 'border-[#5448EE]/50 bg-[#5448EE]/[0.06]' : 'border-white/[0.08] bg-white/[0.04]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-[14px] font-semibold text-white truncate">{t.nombre}</p>
                {t.activo ? (
                  <span className="flex-shrink-0 rounded-full bg-[#5448EE]/20 px-2.5 py-1 text-[10px] font-semibold text-[#8880F5]">
                    En uso
                  </span>
                ) : null}
              </div>

              {/* Mini preview */}
              <div className="rounded-xl border border-black/10 bg-[#ffffff] p-3 mb-4">
                <div className="flex items-center gap-2.5">
                  {logoIsData ? (
                    <div className="h-8 w-8 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.logoUrl!} alt="Logo" className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.colorPrimario }} />
                  )}
                  <p className="text-[12px] font-medium text-gray-900 truncate">{t.nombreComercial || 'Sin nombre comercial'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {!t.activo && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => run(t.id, () => activarPresupuestoTemplate(t.id))}
                    className="rounded-lg border border-[#5448EE]/40 px-2.5 py-1.5 text-[11px] font-medium text-[#8880F5] hover:bg-[#5448EE]/10 disabled:opacity-40 transition-colors"
                  >
                    {isPending && pendingId === t.id ? 'Aplicando...' : 'Usar este'}
                  </button>
                )}
                <Link
                  href={`/dashboard/presupuestos/template/${t.id}`}
                  className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] font-medium text-white/60 hover:text-white hover:border-white/20 transition-colors"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(t.id, () => eliminarPresupuestoTemplate(t.id))}
                  className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {puedeAgregar ? (
        <Link
          href="/dashboard/presupuestos/template/nuevo"
          className="block w-full rounded-2xl border border-dashed border-white/[0.12] px-4 py-4 text-center text-[13px] font-medium text-white/40 hover:text-white hover:border-white/25 transition-colors"
        >
          + Nuevo template
        </Link>
      ) : (
        <p className="text-center text-[12px] text-white/25">Máximo {MAX_PRESUPUESTO_TEMPLATES} templates</p>
      )}
    </div>
  )
}
