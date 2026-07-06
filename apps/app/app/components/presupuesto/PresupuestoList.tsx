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
  if (!value) return '—'
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
    return presupuestos.filter((p) => p.estado === filtro)
  }, [filtro, presupuestos])

  const aceptadosMes = useMemo(() => {
    const now = new Date()
    return presupuestos
      .filter((p) => {
        if (p.estado !== 'aceptado' || p.moneda !== 'ARS') return false
        const date = new Date(`${p.fechaEmision}T00:00:00`)
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      })
      .reduce((sum, p) => sum + p.totalFinal, 0)
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
      {/* Stats */}
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

      {/* Filtros */}
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

      {/* Lista fina */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
        {filtrados.map((p, idx) => (
          <div
            key={p.id}
            className={`flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.03] ${idx !== filtrados.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
          >
            {/* Numero */}
            <span className="w-14 shrink-0 text-[11px] font-mono text-[#8880F5]">
              {formatPresupuestoNumero(p.numero)}
            </span>

            {/* Titulo + cliente */}
            <div className="flex-1 min-w-0">
              <Link href={`/dashboard/presupuestos/${p.id}`} className="text-[13px] font-medium text-white hover:text-[#b9b2ff] truncate block transition-colors">
                {p.titulo}
              </Link>
              {(p.cliente?.nombre) ? (
                <p className="text-[11px] text-white/35 truncate">
                  {p.cliente.nombre}{p.cliente.empresa ? ` · ${p.cliente.empresa}` : ''}
                </p>
              ) : null}
            </div>

            {/* Fecha */}
            <span className="hidden sm:block shrink-0 text-[12px] text-white/35">
              {formatDate(p.fechaEmision)}
            </span>

            {/* Monto */}
            <span className="shrink-0 text-[14px] font-semibold text-white tabular-nums">
              {formatCurrency(p.totalFinal, p.moneda)}
            </span>

            {/* Estado */}
            <div className="shrink-0">
              <EstadoBadge estado={p.estado} />
            </div>

            {/* Acciones */}
            <div className="shrink-0 flex items-center gap-1">
              <Link
                href={`/dashboard/presupuestos/${p.id}`}
                className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] font-medium text-white/50 hover:border-white/20 hover:text-white transition-colors"
              >
                Ver
              </Link>
              <button
                type="button"
                onClick={() => run(() => duplicarPresupuesto(p.id))}
                disabled={isPending}
                className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] font-medium text-white/50 hover:border-white/20 hover:text-white disabled:opacity-40 transition-colors"
              >
                Dup.
              </button>
              {p.estado === 'borrador' ? (
                <>
                  <Link
                    href={`/dashboard/presupuestos/${p.id}/editar`}
                    className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] font-medium text-white/50 hover:border-white/20 hover:text-white transition-colors"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => run(() => eliminarPresupuesto(p.id))}
                    disabled={isPending}
                    className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
                  >
                    ×
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
