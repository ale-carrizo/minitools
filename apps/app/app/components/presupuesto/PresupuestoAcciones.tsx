'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { cambiarEstado, duplicarPresupuesto, eliminarPresupuesto } from '@/lib/actions/presupuesto'
import { generarLinkWhatsAppPresupuesto, type Presupuesto } from '@/types/presupuesto'

export default function PresupuestoAcciones({ presupuesto }: { presupuesto: Presupuesto }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const actions: Array<
    | { label: string; kind: 'primary' | 'success' | 'danger' | 'secondary'; onClick: () => Promise<unknown> }
    | { label: string; kind: 'ghost' | 'secondary'; href: string }
  > = []

  if (presupuesto.estado === 'borrador') {
    actions.push(
      { label: 'Marcar como enviado', kind: 'primary', onClick: () => cambiarEstado(presupuesto.id, 'enviado') },
      { label: 'Editar', kind: 'secondary', href: `/dashboard/presupuestos/${presupuesto.id}/editar` },
      { label: 'Eliminar', kind: 'danger', onClick: () => eliminarPresupuesto(presupuesto.id).then(() => router.push('/dashboard/presupuestos')) },
    )
  }

  if (presupuesto.estado === 'enviado' || presupuesto.estado === 'vencido') {
    actions.push(
      { label: 'Marcar como aceptado', kind: 'success', onClick: () => cambiarEstado(presupuesto.id, 'aceptado') },
      { label: 'Marcar como rechazado', kind: 'danger', onClick: () => cambiarEstado(presupuesto.id, 'rechazado') },
    )
  }

  if (presupuesto.estado === 'aceptado' || presupuesto.estado === 'rechazado') {
    actions.push(
      { label: 'Duplicar', kind: 'secondary', onClick: () => duplicarPresupuesto(presupuesto.id) },
    )
  }

  actions.push({ label: 'Descargar PDF', kind: 'ghost', href: `/api/presupuestos/${presupuesto.id}/pdf` })
  const whatsappLink = generarLinkWhatsAppPresupuesto(presupuesto)
  if (whatsappLink) {
    actions.push({ label: 'Enviar por WhatsApp', kind: 'ghost', href: whatsappLink })
  }

  function run(action: () => Promise<unknown>) {
    setError(null)
    startTransition(async () => {
      try {
        await action()
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'No se pudo completar la accion')
      }
    })
  }

  return (
    <div className="space-y-3">
      {actions.map((action) => {
        const className = action.kind === 'primary'
          ? 'bg-blue-500/90 hover:bg-blue-500 text-white'
          : action.kind === 'success'
            ? 'bg-emerald-500/90 hover:bg-emerald-500 text-white'
            : action.kind === 'danger'
              ? 'bg-red-500/90 hover:bg-red-500 text-white'
              : action.kind === 'ghost'
                ? 'border border-white/10 text-white/70 hover:border-white/20 hover:text-white'
                : 'border border-white/10 text-white/70 hover:border-white/20 hover:text-white'

        if ('href' in action) {
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`block rounded-xl px-4 py-2.5 text-center text-[13px] font-medium transition-colors ${className}`}
            >
              {action.label}
            </Link>
          )
        }

        return (
          <button
            key={action.label}
            type="button"
            onClick={() => run(action.onClick)}
            disabled={isPending}
            className={`w-full rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          >
            {action.label}
          </button>
        )
      })}

      {error ? <p className="text-[12px] text-red-400">{error}</p> : null}
    </div>
  )
}
