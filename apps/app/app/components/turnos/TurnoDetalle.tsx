'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { cambiarEstado, eliminarTurno, marcarRecordatorioEnviado } from '@/lib/actions/turno'
import {
  ESTADO_CONFIG,
  formatCurrency,
  formatFecha,
  formatFechaBonita,
  generarLinkWhatsApp,
  generarLinkWhatsAppSenia,
  nombreEmpleado,
  type Turno,
} from '@/types/turno'
import EstadoBadge from './EstadoBadge'

export default function TurnoDetalle({ turno }: { turno: Turno }) {
  const [isPending, startTransition] = useTransition()
  const [mostrarSenia, setMostrarSenia] = useState(false)
  const [montoSenia, setMontoSenia] = useState(turno.senia > 0 ? turno.senia : Math.round(turno.precio * 0.3))
  const [proximoRecordatorio, setProximoRecordatorio] = useState('')
  const [modoCompletar, setModoCompletar] = useState(false)

  const whatsapp = generarLinkWhatsApp(turno)
  const whatsappSenia = montoSenia > 0 ? generarLinkWhatsAppSenia(turno, montoSenia) : ''

  function handleEstado(next: 'confirmado' | 'cancelado' | 'completado') {
    if (next === 'completado') {
      setModoCompletar(true)
      return
    }
    startTransition(async () => {
      await cambiarEstado(turno.id, next)
    })
  }

  function confirmarCompletado() {
    startTransition(async () => {
      await cambiarEstado(turno.id, 'completado', proximoRecordatorio || undefined)
      setModoCompletar(false)
    })
  }

  function handleDelete() {
    if (!window.confirm('¿Eliminar este turno?')) return
    startTransition(async () => {
      await eliminarTurno(turno.id)
    })
  }

  function handleMarcarRecordatorioEnviado() {
    startTransition(async () => {
      await marcarRecordatorioEnviado(turno.id)
    })
  }

  const estadoCfg = ESTADO_CONFIG[turno.estado]

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-semibold text-white">{turno.clienteNombre}</h2>
              <div className="mt-3">
                <EstadoBadge estado={turno.estado} />
              </div>
            </div>
            {turno.senia > 0 && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${turno.seniaPagada ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'}`}>
                {turno.seniaPagada ? '✓' : '⏳'} Seña {turno.seniaPagada ? 'pagada' : 'pendiente'} {formatCurrency(turno.senia)}
              </span>
            )}
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
              <p><span className="text-white/35">Empleado:</span> {nombreEmpleado(turno.empleado)}</p>
              <p><span className="text-white/35">Precio:</span> {formatCurrency(turno.precio)}</p>
            </div>
          </div>
        </div>

        {turno.proximoRecordatorio ? (
          <div className="bg-[#5448EE]/10 border border-[#5448EE]/20 rounded-2xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8880F5] mb-1">Próximo recordatorio recomendado</p>
            <p className="text-[14px] text-white/80">{formatFechaBonita(turno.proximoRecordatorio)}</p>
          </div>
        ) : null}

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
                <button onClick={() => handleEstado('confirmado')} disabled={isPending} className="w-full border border-emerald-500/25 hover:border-emerald-500/45 text-emerald-300 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">{ESTADO_CONFIG.confirmado.icon} Confirmar</button>
                <button onClick={() => handleEstado('cancelado')} disabled={isPending} className="w-full border border-red-500/20 hover:border-red-500/35 text-red-300 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">{ESTADO_CONFIG.cancelado.icon} Cancelar</button>
              </>
            ) : null}
            {turno.estado === 'confirmado' ? (
              <>
                <button onClick={() => handleEstado('completado')} disabled={isPending} className="w-full border border-[#5448EE]/25 hover:border-[#5448EE]/45 text-[#8880F5] rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">{ESTADO_CONFIG.completado.icon} Completar</button>
                <button onClick={() => handleEstado('cancelado')} disabled={isPending} className="w-full border border-red-500/20 hover:border-red-500/35 text-red-300 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">{ESTADO_CONFIG.cancelado.icon} Cancelar</button>
              </>
            ) : null}
            {(turno.estado === 'cancelado' || turno.estado === 'completado') ? (
              <p className="text-[12px] text-white/35 rounded-xl bg-white/[0.03] px-3 py-3">Este turno ya no admite cambios rápidos de estado.</p>
            ) : null}

            {modoCompletar && (
              <div className="rounded-xl border border-[#5448EE]/20 bg-[#5448EE]/10 p-3 space-y-3">
                <p className="text-[12px] text-white/70">¿Cuándo recomendás el próximo turno?</p>
                <input
                  type="date"
                  value={proximoRecordatorio}
                  onChange={(e) => setProximoRecordatorio(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2 text-sm focus:outline-none focus:border-[#5448EE]/60"
                />
                <div className="flex gap-2">
                  <button onClick={() => setModoCompletar(false)} className="flex-1 border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Cancelar</button>
                  <button onClick={confirmarCompletado} disabled={isPending} className="flex-1 bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Guardar</button>
                </div>
              </div>
            )}

            <Link href={`/dashboard/turnos/${turno.id}/editar`} className="block text-center border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
              Editar turno
            </Link>

            <button onClick={handleDelete} disabled={isPending} className="w-full border border-red-500/20 hover:border-red-500/35 text-red-300 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
              Eliminar
            </button>

            {whatsapp ? (
              <>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors"
                >
                  💬 Recordatorio WhatsApp
                </a>
                {!turno.recordatorioEnviado && (
                  <button
                    onClick={handleMarcarRecordatorioEnviado}
                    disabled={isPending}
                    className="w-full text-center border border-white/10 hover:border-white/20 text-white/40 hover:text-white/70 rounded-xl px-4 py-2 text-[11px] font-medium transition-colors disabled:opacity-40"
                  >
                    Marcar como enviado
                  </button>
                )}
              </>
            ) : null}

            {turno.senia > 0 && !turno.seniaPagada && whatsappSenia ? (
              <a href={whatsappSenia} target="_blank" rel="noreferrer" className="block text-center border border-[#25D366]/25 hover:border-[#25D366]/45 text-[#25D366] rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
                Solicitar seña por WhatsApp
              </a>
            ) : (
              <button onClick={() => setMostrarSenia((v) => !v)} className="w-full border border-[#25D366]/25 hover:border-[#25D366]/45 text-[#25D366] rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
                Solicitar seña
              </button>
            )}

            {mostrarSenia && !turno.seniaPagada && (
              <div className="rounded-xl border border-[#25D366]/20 bg-[#25D366]/10 p-3 space-y-3">
                <p className="text-[12px] text-white/70">Monto de la seña</p>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={montoSenia}
                  onChange={(e) => setMontoSenia(Number(e.target.value))}
                  className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2 text-sm focus:outline-none focus:border-[#25D366]/60"
                />
                {whatsappSenia && (
                  <a href={whatsappSenia} target="_blank" rel="noreferrer" className="block text-center bg-[#25D366] hover:bg-[#1DA851] text-white btn-solid-text rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
                    Enviar solicitud por WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-4">Resumen</p>
          <div className="space-y-2 text-[13px] text-white/60">
            <p><span className="text-white/35">Duración:</span> {turno.duracion} minutos</p>
            <p><span className="text-white/35">Creado:</span> {turno.createdAt ? formatFecha(turno.createdAt.slice(0, 10)) : '—'}</p>
            {turno.recordatorioEnviado ? (
              <p className="text-emerald-400/80 text-[12px]">✓ Recordatorio enviado</p>
            ) : turno.clienteTel ? (
              <p className="text-white/30 text-[12px]">Recordatorio pendiente</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
