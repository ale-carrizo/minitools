'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { duplicarPresupuesto, eliminarPresupuesto } from '@/lib/actions/presupuesto'
import {
  formatCurrency,
  formatPresupuestoNumero,
  type Presupuesto,
  type PresupuestoEstado,
} from '@/types/presupuesto'
import EstadoBadge from './EstadoBadge'

const FILTROS: Array<{ label: string; value: 'todos' | PresupuestoEstado }> = [
  { label: 'Todos', value: 'todos' },
  { label: 'Borrador', value: 'borrador' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'Aceptado', value: 'aceptado' },
  { label: 'Rechazado', value: 'rechazado' },
]

function formatDate(value: string | null) {
  if (!value) return 'Sin vencimiento'
  return new Date(`${value}T00:00:00`).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function PresupuestoList({ presupuestos }: { presupuestos: Presupuesto[] }) {
  const router = useRouter()
  const [filtro, setFiltro] = useState<'todos' | PresupuestoEstado>('todos')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtrados = useMemo(() => {
    if (filtro === 'todos') return presupuestos
    return presupuestos.filter((presupuesto) => presupuesto.estado === filtro)
  }, [filtro, presupuestos])

  const aceptadosMes = useMemo(() => {
    const now = new Date()
    return presupuestos
      .filter((presupuesto) => {
        if (presupuesto.estado !== 'aceptado' || presupuesto.moneda !== 'ARS') return false
        const date = new Date(`${presupuesto.fechaEmision}T00:00:00`)
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      })
      .reduce((sum, presupuesto) => sum + presupuesto.totalFinal, 0)
  }, [presupuestos])

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

  if (presupuestos.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] py-20 text-center">
        <p className="mb-2 text-lg text-white/60">Todavia no hay presupuestos</p>
        <p className="mb-5 text-sm text-white/30">Crea el primero para empezar a cotizar y descargar PDFs.</p>
        <Link href="/dashboard/presupuestos/nuevo" className="rounded-xl bg-[#5448EE] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#4438DE]">
          + Crear presupuesto
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
          <p className="text-[11px] text-white/40">Total presupuestos</p>
          <p className="mt-1 text-2xl font-semibold text-white">{presupuestos.length}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
          <p className="text-[11px] text-white/40">Borradores activos</p>
          <p className="mt-1 text-2xl font-semibold text-white">{presupuestos.filter((p) => p.estado === 'borrador').length}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
          <p className="text-[11px] text-white/40">Aceptados del mes (ARS)</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">{formatCurrency(aceptadosMes, 'ARS')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFiltro(item.value)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
              filtro === item.value ? 'bg-[#5448EE] text-white' : 'bg-white/[0.04] text-white/40 hover:text-white/70'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-[12px] text-red-400">{error}</p> : null}

      <div className="grid gap-4">
        {filtrados.map((presupuesto) => (
          <div key={presupuesto.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[12px] font-medium text-[#8880F5]">{formatPresupuestoNumero(presupuesto.numero)}</span>
                  <h3 className="text-[18px] font-semibold text-white">{presupuesto.titulo}</h3>
                  <EstadoBadge estado={presupuesto.estado} />
                </div>
                <p className="text-[13px] text-white/50">
                  {presupuesto.cliente?.nombre ?? 'Sin cliente'}
                  {presupuesto.cliente?.empresa ? ` · ${presupuesto.cliente.empresa}` : ''}
                </p>
                <div className="flex flex-wrap gap-5 text-[12px] text-white/35">
                  <span>Emision: {formatDate(presupuesto.fechaEmision)}</span>
                  <span>Vence: {formatDate(presupuesto.fechaVence)}</span>
                </div>
              </div>

              <div className="text-left lg:text-right">
                <p className="text-[12px] text-white/35">Total final</p>
                <p className="text-[22px] font-semibold text-white">{formatCurrency(presupuesto.totalFinal, presupuesto.moneda)}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/dashboard/presupuestos/${presupuesto.id}`} className="rounded-xl border border-white/10 px-3 py-2 text-[12px] font-medium text-white/70 hover:border-white/20 hover:text-white">
                Ver
              </Link>
              <button
                type="button"
                onClick={() => run(() => duplicarPresupuesto(presupuesto.id))}
                disabled={isPending}
                className="rounded-xl border border-white/10 px-3 py-2 text-[12px] font-medium text-white/70 hover:border-white/20 hover:text-white disabled:opacity-50"
              >
                Duplicar
              </button>
              {presupuesto.estado === 'borrador' ? (
                <>
                  <Link href={`/dashboard/presupuestos/${presupuesto.id}/editar`} className="rounded-xl border border-white/10 px-3 py-2 text-[12px] font-medium text-white/70 hover:border-white/20 hover:text-white">
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => run(() => eliminarPresupuesto(presupuesto.id))}
                    disabled={isPending}
                    className="rounded-xl bg-red-500/90 px-3 py-2 text-[12px] font-medium text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
