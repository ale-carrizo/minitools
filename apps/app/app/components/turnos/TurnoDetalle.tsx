'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { cambiarEstado, eliminarTurno } from '@/lib/actions/turno-mutate'
import { formatCurrency, formatFechaBonita, formatFecha, generarLinkWhatsApp, type Turno } from '@/types/turno'
import EstadoBadge from './EstadoBadge'

export default function TurnoDetalle({ turno }: { turno: Turno }) {
  const [isPending, startTransition] = useTransition()
  const whatsapp = generarLinkWhatsApp(turno)

  function handleEstado(next: 'confirmado' | 'cancelado' | 'completado') {
    startTransition(async () => {
      await cambiarEstado(turno.id, next)
    })
  }

  function handleDelete() {
    if (!window.confirm('¿Eliminar este turno?')) return
    startTransition(async () => {
      await eliminarTurno(turno.id)
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
      <div className="space-y-5">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-semibold text-white">{turno.clienteNombre}</h2>
              <div className="mt-3">
                <EstadoBadge estado={turno.estado} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="bg-white/[0.03] rounded-xl p-4 text-[13px] text-white/60 space-y-1">
              <p><span className="text-white/35">Teléfono:</span> {turno.clienteTel ?? '—'}</p>
              <p><span className="text-white/35">Email:</span> {turno.clienteEmail ?? '—'}</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4 text-[13px] text-white/60 space-y-1">
              <p><span className="text-white/35">Fecha:</span> {formatFechaBonita(turno.fecha)}</p>
              <p><span className="text-white/35">Horario:</span> {turno.horaInicio} - {turno.horaFin}hs</p>
              <p className="flex items-center gap-2"><span className="text-white/35">Servicio:</span> {turno.servicio ? <><span className="w-2 h-2 rounded-full" style={{ backgroundColor: turno.servicio.color }} /> {turno.servicio.nombre}</> : 'Manual'}</p>
              <p><span className="text-white/35">Precio:</span> {formatCurrency(turno.precio)}</p>
            </div>
          </div>
        </div>

        {turno.notas ? (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-3">Notas</p>
            <p className="text-[13px] text-white/60">{turno.notas}</p>
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-4">Acciones</p>
          <div className="space-y-2">
            {turno.estado === 'pendiente' ? (
              <>
                <button onClick={() => handleEstado('confirmado')} disabled={isPending} className="w-full border border-emerald-500/25 hover:border-emerald-500/45 text-emerald-300 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">✓ Confirmar</button>
                <button onClick={() => handleEstado('cancelado')} disabled={isPending} className="w-full border border-red-500/20 hover:border-red-500/35 text-red-300 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">✗ Cancelar</button>
              </>
            ) : null}
            {turno.estado === 'confirmado' ? (
              <>
                <button onClick={() => handleEstado('completado')} disabled={isPending} className="w-full border border-white/10 hover:border-white/20 text-white/70 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">✓ Completar</button>
                <button onClick={() => handleEstado('cancelado')} disabled={isPending} className="w-full border border-red-500/20 hover:border-red-500/35 text-red-300 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">✗ Cancelar</button>
              </>
            ) : null}
            {(turno.estado === 'cancelado' || turno.estado === 'completado') ? (
              <p className="text-[12px] text-white/35 rounded-xl bg-white/[0.03] px-3 py-3">Este turno ya no admite cambios rápidos de estado.</p>
            ) : null}

            <Link href={`/dashboard/turnos/${turno.id}/editar`} className="block text-center border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
              Editar turno
            </Link>

            <button onClick={handleDelete} disabled={isPending} className="w-full border border-red-500/20 hover:border-red-500/35 text-red-300 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
              Eliminar
            </button>

            {whatsapp ? (
              <a href={whatsapp} target="_blank" rel="noreferrer" className="block text-center bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
                💬 Recordatorio WhatsApp
              </a>
            ) : null}
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-4">Resumen</p>
          <div className="space-y-2 text-[13px] text-white/60">
            <p><span className="text-white/35">Duración:</span> {turno.duracion} minutos</p>
            <p><span className="text-white/35">Creado:</span> {turno.createdAt ? formatFecha(turno.createdAt.slice(0, 10)) : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
