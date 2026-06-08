import Link from 'next/link'
import EstadoBadge from './EstadoBadge'
import { formatCurrency, formatFecha, formatPeriodo, type Recibo, type ReciboConfig } from '@/types/recibo'
import ReciboAcciones from './ReciboAcciones'

export default function ReciboDetalle({
  recibo,
  config,
}: {
  recibo: Recibo
  config: ReciboConfig | null
}) {
  const haberes = recibo.conceptos.filter((concepto) => concepto.tipo === 'haber')
  const deducciones = recibo.conceptos.filter((concepto) => concepto.tipo === 'deduccion')

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-center gap-2 text-[13px] text-white/30">
        <Link href="/dashboard/sueldos" className="hover:text-white/60">Recibos</Link>
        <span>/</span>
        <span className="text-white/60">{recibo.empNombre} — {formatPeriodo(recibo.periodo)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <div className="space-y-5">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[22px] font-semibold text-white">{formatPeriodo(recibo.periodo)}</p>
                <p className="text-[13px] text-white/45 mt-1">{recibo.empNombre}</p>
              </div>
              <EstadoBadge estado={recibo.estado} />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="bg-white/[0.03] rounded-xl p-4 text-[13px] text-white/60 space-y-1">
                <p><span className="text-white/35">CUIL:</span> {recibo.empCuil ?? '—'}</p>
                <p><span className="text-white/35">Cargo:</span> {recibo.empCargo ?? '—'}</p>
                <p><span className="text-white/35">Modalidad:</span> {recibo.empModalidad === 'dependencia' ? 'Relación de dependencia' : 'Monotributista'}</p>
                <p><span className="text-white/35">Fecha ingreso:</span> {recibo.empFechaIngreso ? formatFecha(recibo.empFechaIngreso) : '—'}</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4 text-[13px] text-white/60 space-y-1">
                <p><span className="text-white/35">Fecha de pago:</span> {formatFecha(recibo.fechaPago)}</p>
                {recibo.empModalidad === 'monotributista' ? <p><span className="text-white/35">N° factura:</span> {recibo.nroFactura ?? '—'}</p> : null}
                <p><span className="text-white/35">Creado:</span> {new Date(recibo.createdAt).toLocaleDateString('es-AR')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/30">Conceptos</div>
            <div className="p-5 space-y-6">
              <div>
                <p className="text-emerald-400 text-[13px] font-medium mb-3">Haberes</p>
                <div className="space-y-2">
                  {haberes.map((concepto) => (
                    <div key={concepto.id} className="flex justify-between text-[13px] text-white/70">
                      <span>{concepto.descripcion}</span>
                      <span>{formatCurrency(concepto.monto)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-between text-emerald-400 font-medium text-[13px]">
                  <span>Subtotal haberes</span>
                  <span>{formatCurrency(recibo.totalHaberes)}</span>
                </div>
              </div>

              <div>
                <p className="text-red-400 text-[13px] font-medium mb-3">Deducciones</p>
                <div className="space-y-2">
                  {deducciones.map((concepto) => (
                    <div key={concepto.id} className="flex justify-between text-[13px] text-white/70">
                      <span>{concepto.descripcion}</span>
                      <span>{formatCurrency(concepto.monto)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-between text-red-400 font-medium text-[13px]">
                  <span>Subtotal deducciones</span>
                  <span>{formatCurrency(recibo.totalDeducciones)}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#5448EE]/10 border border-[#5448EE]/20 px-5 py-4 flex justify-between items-center">
                <span className="text-white/70 text-[13px]">NETO A COBRAR</span>
                <span className="text-white font-semibold text-[24px]">{formatCurrency(recibo.netoAPagar)}</span>
              </div>
            </div>
          </div>

          {recibo.notas ? (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-3">Notas</p>
              <p className="text-[13px] text-white/60">{recibo.notas}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-4">Acciones</p>
            <ReciboAcciones recibo={recibo} />
          </div>

          {config ? (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-4">Empleador</p>
              <div className="space-y-1 text-[13px] text-white/60">
                <p>{config.razonSocial}</p>
                <p>CUIT: {config.cuit}</p>
                {config.domicilio ? <p>{config.domicilio}</p> : null}
                {config.localidad ? <p>{config.localidad}</p> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
