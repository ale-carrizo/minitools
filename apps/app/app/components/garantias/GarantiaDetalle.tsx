import GarantiaActions from './GarantiaActions'
import GarantiaEstadoBadge from './GarantiaEstadoBadge'
import ReclamoCard from './ReclamoCard'
import ReclamoFormWrapper from './ReclamoFormWrapper'
import {
  calcularEstadoGarantia,
  diasHastaVencimiento,
  formatCurrency,
  formatDiasRestantes,
  formatFecha,
  type GarantiaProducto,
} from '@/types/garantia'

export default function GarantiaDetalle({ garantia }: { garantia: GarantiaProducto }) {
  const estado = calcularEstadoGarantia(garantia.fechaVencimiento)
  const dias = diasHastaVencimiento(garantia.fechaVencimiento)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
      <div className="space-y-5">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-[24px] font-semibold text-white">{garantia.nombre}</h2>
                <GarantiaEstadoBadge estado={estado} />
              </div>
              <p className={`mt-3 text-[15px] font-medium ${
                estado === 'vigente' ? 'text-emerald-300' :
                estado === 'por_vencer' ? 'text-yellow-300' :
                estado === 'vencida' ? 'text-red-300' : 'text-white/45'
              }`}>
                {formatDiasRestantes(dias)}
              </p>
            </div>
            {estado === 'por_vencer' ? (
              <span className="relative flex w-2 h-2 mt-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-yellow-400" />
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              ['Marca', garantia.marca ?? '—'],
              ['Modelo', garantia.modelo ?? '—'],
              ['Serie', garantia.nroSerie ?? '—'],
              ['Categoría', garantia.categoria ?? '—'],
              ['Proveedor', garantia.proveedor ?? '—'],
              ['Nro factura', garantia.nroFactura ?? '—'],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-white/[0.03] rounded-xl p-4">
                <p className="text-[11px] uppercase tracking-wider text-white/25">{label}</p>
                <p className="mt-2 text-[13px] text-white/70">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              ['Fecha compra', formatFecha(garantia.fechaCompra)],
              ['Fecha vencimiento', formatFecha(garantia.fechaVencimiento)],
              ['Meses garantía', garantia.mesesGarantia?.toString() ?? '—'],
              ['Precio compra', formatCurrency(garantia.precioCompra)],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-white/[0.03] rounded-xl p-4">
                <p className="text-[11px] uppercase tracking-wider text-white/25">{label}</p>
                <p className="mt-2 text-[13px] text-white/70">{value}</p>
              </div>
            ))}
          </div>

          {garantia.notas ? (
            <div className="mt-4 rounded-xl bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-wider text-white/25">Notas</p>
              <p className="mt-2 text-[13px] text-white/65">{garantia.notas}</p>
            </div>
          ) : null}
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-white font-semibold">Historial de reclamos</h3>
            <span className="text-[12px] text-white/35">{garantia.reclamos.length} registrados</span>
          </div>

          {garantia.reclamos.length === 0 ? (
            <p className="text-[13px] text-white/40">Sin reclamos registrados</p>
          ) : (
            <div className="space-y-3">
              {garantia.reclamos.map((reclamo) => (
                <ReclamoCard key={reclamo.id} reclamo={reclamo} productoId={garantia.id} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-4">Acciones</p>
          <div className="space-y-3">
            <GarantiaActions id={garantia.id} />
            {estado !== 'vencida' ? <ReclamoFormWrapper productoId={garantia.id} /> : null}
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-4">Resumen</p>
          <div className={`rounded-2xl border p-4 ${
            estado === 'vigente' ? 'border-emerald-500/20 bg-emerald-500/10' :
            estado === 'por_vencer' ? 'border-yellow-500/20 bg-yellow-500/10' :
            estado === 'vencida' ? 'border-red-500/20 bg-red-500/10' : 'border-white/10 bg-white/[0.04]'
          }`}>
            <div className="flex items-center gap-2">
              {estado === 'por_vencer' ? (
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex rounded-full w-2 h-2 bg-yellow-400" />
                </span>
              ) : (
                <span className={`w-2 h-2 rounded-full ${
                  estado === 'vigente' ? 'bg-emerald-400' :
                  estado === 'vencida' ? 'bg-red-400' : 'bg-white/25'
                }`} />
              )}
              <p className="text-white font-medium">{estado === 'por_vencer' ? 'Atención requerida' : 'Estado actual'}</p>
            </div>
            <p className="mt-3 text-[18px] font-semibold text-white">{formatDiasRestantes(dias)}</p>
            <p className="mt-1 text-[12px] text-white/45">Vencimiento: {formatFecha(garantia.fechaVencimiento)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
