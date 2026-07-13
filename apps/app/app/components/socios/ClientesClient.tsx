'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Socio, CobroProgramado } from '@/types/socios'
import {
  getSocioStatus, STATUS_UI_CONFIG, COBRO_STATUS_CONFIG,
  initials, MEDIOS_PAGO,
} from '@/types/socios'
import { agregarCobroPuntual, getSocio } from '@/lib/actions/socios'
import { WAButton } from './WAButton'
import PagarModal from './PagarModal'

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n)
}
function fmtFecha(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

type Modal = 'posponer' | 'cobro_puntual' | 'pagar' | null

export default function ClientesClient({ socios }: { socios: Socio[] }) {
  const [selected, setSelected]   = useState<Socio | null>(null)
  const [detalle, setDetalle]     = useState<Socio | null>(null)
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState<Modal>(null)
  const [activeCobro, setActive]  = useState<CobroProgramado | null>(null)
  const [, startTrans]            = useTransition()
  const router                    = useRouter()

  // La lista solo trae el próximo cobro pendiente de cada socio (por
  // performance); al abrir la ficha se pide el detalle completo con
  // todo el historial de cobros.
  useEffect(() => {
    if (!selected) { setDetalle(null); return }
    let cancelado = false
    getSocio(selected.id).then((full) => { if (!cancelado) setDetalle(full) })
    return () => { cancelado = true }
  }, [selected?.id])

  const filtered = socios.filter(s =>
    s.nombre.toLowerCase().includes(search.toLowerCase()) ||
    s.telefono.includes(search)
  )

  // ── Lista ─────────────────────────────────────────────────────────────────
  if (!selected) {
    return (
      <div>
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full pl-9 pr-4 py-2.5 text-[12px] rounded-xl border border-white/[0.09] bg-white/[0.05] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-white/40">{search ? 'Sin resultados' : 'Aún no tenés clientes'}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
            {filtered.map((socio, idx) => {
              const status = getSocioStatus(socio)
              const cfg    = STATUS_UI_CONFIG[status]
              const prox   = socio.proximoCobro?.fechaVencimiento
              return (
                <button
                  key={socio.id}
                  onClick={() => setSelected(socio)}
                  className={`flex items-center gap-3 w-full px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03] ${idx !== filtered.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: socio.avatarColor }}
                  >
                    {initials(socio.nombre)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-white truncate">{socio.nombre}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      {socio.concepto ?? 'Cuota'} · {fmt(socio.monto)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>
                      {cfg.label}
                    </span>
                    {prox && (
                      <span className="text-[11px]" style={{ color: cfg.text }}>
                        {new Date(prox + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="m9 18 6-6-6-6" strokeLinecap="round"/>
                  </svg>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── Ficha ──────────────────────────────────────────────────────────────────
  const ficha  = detalle ?? selected
  const status = getSocioStatus(ficha)
  const cfg    = STATUS_UI_CONFIG[status]
  const cobros = ficha.cobros ?? []

  function refrescarDetalle() {
    getSocio(ficha.id).then(setDetalle)
  }

  return (
    <div>
      <button
        onClick={() => setSelected(null)}
        className="flex items-center gap-1.5 text-[12px] font-medium text-[#8880F5] mb-5 hover:text-white transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Todos los clientes
      </button>

      {/* Datos */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 mb-3">
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06] mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
            style={{ background: ficha.avatarColor }}
          >
            {initials(ficha.nombre)}
          </div>
          <div className="flex-1">
            <p className="text-[16px] font-bold text-white">{ficha.nombre}</p>
            <p className="text-[11px] text-white/35 mt-0.5">
              +{ficha.telefono} · desde {new Date(ficha.createdAt).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
            </p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>
            {cfg.label}
          </span>
        </div>
        {[
          ['Tipo de cobro', ficha.concepto ?? 'Cuota'],
          ['Monto', fmt(ficha.monto)],
          ['Frecuencia', ficha.frecuencia === 'mensual'
            ? `Mensual · día ${ficha.diaVencimiento}`
            : ficha.frecuencia],
          ficha.proximoCobro ? ['Próximo cobro', fmtFecha(ficha.proximoCobro.fechaVencimiento)] : null,
          ficha.deudaTotal > 0 ? ['Deuda acumulada', fmt(ficha.deudaTotal)] : null,
          ficha.notas ? ['Notas', ficha.notas] : null,
        ].filter((r): r is [string, string] => r !== null).map(([label, val]) => (
          <div key={String(label)} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
            <span className="text-[11px] text-white/35">{label}</span>
            <span className={`text-[12px] font-medium ${label === 'Deuda acumulada' ? 'text-red-400' : 'text-white'}`}>{val}</span>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {ficha.proximoCobro && (
          <button
            onClick={() => { setActive(ficha.proximoCobro!); setModal('pagar') }}
            className="flex flex-col gap-1 p-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-left transition-colors"
          >
            <span className="text-[18px]">✅</span>
            <span className="text-[11px] font-semibold text-white">Registrar pago</span>
            <span className="text-[10px] text-white/35">Marcar como pagado</span>
          </button>
        )}
        {ficha.proximoCobro && (
          <a
            href={`https://wa.me/${ficha.telefono}?text=${encodeURIComponent(
              ficha.mensajeTemplate
                .replace(/{nombre}/g, ficha.nombre)
                .replace(/{monto}/g, ficha.proximoCobro.monto.toLocaleString('es-AR'))
                .replace(/{fecha}/g, new Date(ficha.proximoCobro.fechaVencimiento + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }))
                .replace(/{concepto}/g, ficha.proximoCobro.concepto ?? ficha.concepto ?? 'cuota')
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-1 p-3 rounded-2xl border border-[#25D366]/20 bg-[#25D366]/5 hover:bg-[#25D366]/10 text-left transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-[11px] font-semibold text-white">Avisar por WhatsApp</span>
            <span className="text-[10px] text-white/35">Mensaje pre-armado</span>
          </a>
        )}
        <button
          onClick={() => setModal('cobro_puntual')}
          className="flex flex-col gap-1 p-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-left transition-colors"
        >
          <span className="text-[18px]">📋</span>
          <span className="text-[11px] font-semibold text-white">Cobro puntual</span>
          <span className="text-[10px] text-white/35">Monto y fecha libre</span>
        </button>
        <button
          onClick={() => router.push(`/dashboard/socios/${ficha.id}/editar`)}
          className="flex flex-col gap-1 p-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-left transition-colors"
        >
          <span className="text-[18px]">✏️</span>
          <span className="text-[11px] font-semibold text-white">Editar cliente</span>
          <span className="text-[10px] text-white/35">Datos y configuración</span>
        </button>
      </div>

      {/* Historial */}
      <p className="text-[11px] font-semibold text-white/25 uppercase tracking-wider mb-2">Historial de pagos</p>
      <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
        {cobros.length === 0 ? (
          <div className="py-8 text-center text-[12px] text-white/30">Sin historial</div>
        ) : cobros.map((cobro, idx) => {
          const sc = COBRO_STATUS_CONFIG[cobro.estado]
          return (
            <div key={cobro.id} className={`flex items-center gap-3 px-4 py-3 ${idx !== cobros.length - 1 ? 'border-b border-white/[0.06]' : ''}`}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sc.dot }} />
              <div className="flex-1">
                <p className="text-[12px] text-white">{cobro.concepto ?? 'Cuota'}</p>
                <p className="text-[10px] text-white/35 mt-0.5">
                  {cobro.estado === 'pagado'
                    ? `Pagó · ${fmtFecha(cobro.fechaPago!)}${cobro.medioPago ? ` · ${cobro.medioPago}` : ''}`
                    : `${sc.label} · ${fmtFecha(cobro.fechaVencimiento)}`}
                </p>
              </div>
              <span className="text-[12px] font-semibold tabular-nums" style={{ color: sc.dot }}>{fmt(cobro.monto)}</span>
            </div>
          )
        })}
      </div>

      {/* Modal: registrar pago */}
      {modal === 'pagar' && activeCobro && (
        <PagarModal
          cobro={activeCobro}
          nombre={ficha.nombre}
          onClose={() => { setModal(null); setActive(null) }}
          onDone={() => { setModal(null); setActive(null); refrescarDetalle(); router.refresh() }}
        />
      )}

      {/* Modal: cobro puntual */}
      {modal === 'cobro_puntual' && (
        <CobroPuntualModal
          socio={ficha}
          onClose={() => setModal(null)}
          onConfirm={async (monto, fecha, concepto) => {
            await agregarCobroPuntual({ socioId: ficha.id, monto, fechaVencimiento: fecha, concepto })
            setModal(null)
            refrescarDetalle()
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

// ── Modal cobro puntual ───────────────────────────────────────────────────────
function CobroPuntualModal({ socio, onClose, onConfirm }: {
  socio: Socio; onClose: () => void; onConfirm: (m: number, f: string, c?: string) => Promise<void>
}) {
  const [monto,    setMonto]    = useState('')
  const [fecha,    setFecha]    = useState('')
  const [concepto, setConcepto] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl border border-white/[0.10] light:border-black/[0.10] bg-[#1A1830] light:bg-[#ffffff] p-5 w-full max-w-xs shadow-xl">
        <h3 className="text-[14px] font-semibold text-white mb-1">Cobro puntual</h3>
        <p className="text-[11px] text-white/40 mb-4">{socio.nombre}</p>
        <label className="block text-[11px] text-white/40 mb-1.5">Monto *</label>
        <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0"
          className="w-full px-3 py-2.5 rounded-xl border border-white/[0.09] bg-white/[0.05] text-[12px] text-white mb-3 focus:outline-none focus:border-[#5448EE]/60" />
        <label className="block text-[11px] text-white/40 mb-1.5">Fecha de vencimiento *</label>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-white/[0.09] bg-white/[0.05] text-[12px] text-white mb-3 focus:outline-none focus:border-[#5448EE]/60" />
        <label className="block text-[11px] text-white/40 mb-1.5">Descripción</label>
        <input type="text" value={concepto} onChange={e => setConcepto(e.target.value)} placeholder="Ej: Honorarios caso X"
          className="w-full px-3 py-2.5 rounded-xl border border-white/[0.09] bg-white/[0.05] text-[12px] text-white mb-3 focus:outline-none focus:border-[#5448EE]/60" />
        {error && <p className="text-[11px] text-red-400 mb-2">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-[12px] text-white/50 border border-white/10 rounded-xl hover:text-white transition-colors">Cancelar</button>
          <button
            disabled={loading}
            onClick={async () => {
              if (!monto || !fecha) { setError('Completá monto y fecha'); return }
              setLoading(true)
              await onConfirm(parseFloat(monto), fecha, concepto || undefined)
            }}
            className="flex-[2] py-2.5 text-[12px] font-medium text-white btn-solid-text bg-[#5448EE] rounded-xl hover:bg-[#4438DE] disabled:opacity-50"
          >
            {loading ? 'Guardando…' : 'Agregar cobro'}
          </button>
        </div>
      </div>
    </div>
  )
}
