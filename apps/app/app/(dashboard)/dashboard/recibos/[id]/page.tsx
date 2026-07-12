import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRecibo, getReciboCobroConfig, eliminarRecibo } from '@/lib/actions/recibos'
import { formatCurrency, numeroALetras, generarLinkWhatsAppRecibo } from '@/types/recibos'
import { EliminarBtn } from './EliminarBtn'

function formatearFecha(fechaStr: string) {
  if (!fechaStr) return ''
  const [y, m, d] = fechaStr.split('-')
  return `${d}/${m}/${y}`
}

export default async function ReciboDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [recibo, config] = await Promise.all([getRecibo(id), getReciboCobroConfig()])
  if (!recibo) notFound()
  const whatsappLink = generarLinkWhatsAppRecibo(recibo)

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/recibos" className="text-[12px] text-[#8880F5] hover:text-white transition-colors">
          ← Volver
        </Link>
        <div className="flex gap-2">
          <EliminarBtn id={recibo.id} />
        </div>
      </div>

      {/* Vista previa del recibo */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-[#5448EE]/30">
          <div className="flex items-start gap-3">
            {config?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.logoUrl} alt="Logo" className="h-10 w-10 rounded-lg object-contain bg-white/10 flex-shrink-0" />
            )}
            <div>
              <p className="text-white font-semibold text-[18px]">{recibo.emisorNombre}</p>
              {recibo.emisorDoc && <p className="text-white/35 text-[12px] mt-0.5">CUIT: {recibo.emisorDoc}</p>}
              {recibo.emisorDireccion && <p className="text-white/35 text-[12px]">{recibo.emisorDireccion}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[#8880F5] text-[14px] font-semibold uppercase tracking-wider">Recibo de Cobro</p>
            <p className="text-white/50 text-[13px] mt-0.5 font-mono">N° {String(recibo.numero).padStart(4, '0')}</p>
          </div>
        </div>

        {/* Recibí de */}
        <p className="text-white/50 text-[13px] mb-5">
          Recibí de{' '}
          <span className="text-white font-medium">{recibo.receptorNombre || '_________________'}</span>
          {recibo.receptorDoc && <span className="text-white/30"> · {recibo.receptorDoc}</span>}
        </p>

        {/* Monto */}
        <div className="rounded-2xl border-2 border-[#5448EE]/40 bg-[#5448EE]/5 p-6 text-center mb-5">
          <p className="text-[11px] uppercase tracking-wider text-white/30 mb-1">La suma de</p>
          <p className="text-[36px] font-semibold text-white tracking-tight">{formatCurrency(recibo.monto)}</p>
          <p className="text-[12px] text-white/35 mt-2">{numeroALetras(recibo.monto)}</p>
        </div>

        {/* Datos */}
        <div className="grid gap-3 md:grid-cols-2 mb-5">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Fecha</p>
            <p className="text-[13px] text-white font-medium">{formatearFecha(recibo.fecha)}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Medio de pago</p>
            <p className="text-[13px] text-white font-medium">{recibo.medioPago || '—'}</p>
          </div>
        </div>

        {/* Concepto */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 mb-5">
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">En concepto de</p>
          <p className="text-[14px] text-white/80">{recibo.concepto}</p>
        </div>

        {/* Notas */}
        {recibo.notas && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-5">
            <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Notas</p>
            <p className="text-[13px] text-white/60">{recibo.notas}</p>
          </div>
        )}

        {/* Firmas */}
        <div className="flex justify-around mt-8 pt-6 border-t border-white/[0.06]">
          <div className="text-center w-40">
            <div className="border-b border-dashed border-white/20 mb-2 h-8" />
            <p className="text-[10px] text-white/30">Firma de quien recibe</p>
            <p className="text-[12px] text-white font-medium mt-1">{recibo.emisorNombre}</p>
          </div>
          <div className="text-center w-40">
            <div className="border-b border-dashed border-white/20 mb-2 h-8" />
            <p className="text-[10px] text-white/30">Firma de quien entrega</p>
            <p className="text-[12px] text-white font-medium mt-1">{recibo.receptorNombre || ''}</p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <a
          href={`/api/recibos/${recibo.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-[13px] font-medium text-white/60 hover:text-white hover:border-white/20 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar PDF
        </a>
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-4 py-2.5 text-[13px] font-medium text-white btn-solid-text transition-colors"
          >
            Enviar por WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}
