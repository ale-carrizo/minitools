import Link from 'next/link'
import { notFound } from 'next/navigation'
import PresupuestoAcciones from '@/app/components/presupuesto/PresupuestoAcciones'
import EstadoBadge from '@/app/components/presupuesto/EstadoBadge'
import { getPresupuesto } from '@/lib/actions/presupuesto'
import { calcularTotales, formatCurrency, formatPresupuestoNumero } from '@/types/presupuesto'

function fmtDate(value: string | null) {
  if (!value) return 'Sin vencimiento'
  const normalized = value.includes('T') ? value : `${value}T00:00:00`
  return new Date(normalized).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function PresupuestoDetailPage({ params }: { params: { id: string } }) {
  const presupuesto = await getPresupuesto(params.id)
  if (!presupuesto) notFound()

  const totals = calcularTotales(presupuesto.items, presupuesto.descuento, presupuesto.iva)

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-center gap-2 text-[13px] text-white/30">
        <Link href="/dashboard/presupuestos" className="hover:text-white/60">Presupuestos</Link>
        <span>/</span>
        <span className="text-white/60">{presupuesto.titulo}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-medium text-[#8880F5]">{formatPresupuestoNumero(presupuesto.numero)}</p>
                <h2 className="mt-1 text-[22px] font-semibold text-white">{presupuesto.titulo}</h2>
                <p className="mt-2 text-[13px] text-white/45">
                  {presupuesto.cliente?.nombre ?? 'Sin cliente'}
                  {presupuesto.cliente?.empresa ? ` · ${presupuesto.cliente.empresa}` : ''}
                </p>
              </div>
              <EstadoBadge estado={presupuesto.estado} />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] text-white/30">Emision</p>
                <p className="mt-1 text-[13px] font-medium text-white">{fmtDate(presupuesto.fechaEmision)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] text-white/30">Vence</p>
                <p className="mt-1 text-[13px] font-medium text-white">{fmtDate(presupuesto.fechaVence)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] text-white/30">Moneda</p>
                <p className="mt-1 text-[13px] font-medium text-white">{presupuesto.moneda}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] text-white/30">Total</p>
                <p className="mt-1 text-[13px] font-medium text-white">{formatCurrency(presupuesto.totalFinal, presupuesto.moneda)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden">
            <div className="border-b border-white/[0.06] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Items
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04] text-left text-[10px] font-semibold uppercase tracking-wider text-white/25">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Descripcion</th>
                  <th className="px-5 py-3">Cant</th>
                  <th className="px-5 py-3">Precio</th>
                  <th className="px-5 py-3">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {presupuesto.items.map((item) => (
                  <tr key={item.id} className="border-b border-white/[0.04]">
                    <td className="px-5 py-3 text-white/40">{item.orden}</td>
                    <td className="px-5 py-3 text-white">{item.descripcion}</td>
                    <td className="px-5 py-3 text-white/55">{item.cantidad}</td>
                    <td className="px-5 py-3 text-white/55">{formatCurrency(item.precioUnitario, presupuesto.moneda)}</td>
                    <td className="px-5 py-3 text-white/80">{formatCurrency(item.subtotal, presupuesto.moneda)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Totales</p>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between text-white/55"><span>Subtotal</span><span>{formatCurrency(totals.subtotal, presupuesto.moneda)}</span></div>
                <div className="flex justify-between text-white/55"><span>Descuento {presupuesto.descuento}%</span><span>- {formatCurrency(totals.descuentoMonto, presupuesto.moneda)}</span></div>
                <div className="flex justify-between text-white/55"><span>Base</span><span>{formatCurrency(totals.base, presupuesto.moneda)}</span></div>
                <div className="flex justify-between text-white/55"><span>{presupuesto.iva > 0 ? `IVA ${presupuesto.iva}%` : 'Sin IVA'}</span><span>{formatCurrency(totals.ivaMonto, presupuesto.moneda)}</span></div>
                <div className="flex justify-between border-t border-white/[0.06] pt-3 text-[18px] font-semibold text-white"><span>Total</span><span>{formatCurrency(totals.totalFinal, presupuesto.moneda)}</span></div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Notas</p>
              <div className="space-y-4 text-[13px] text-white/50">
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-white/25">Internas</p>
                  <p>{presupuesto.notas ?? 'Sin notas internas'}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-white/25">Cliente</p>
                  <p>{presupuesto.notasCliente ?? 'Sin notas para el cliente'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-first space-y-4 lg:order-none">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Acciones</p>
            <PresupuestoAcciones presupuesto={presupuesto} />
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 text-[12px] text-white/35">
            <p>Creado: {fmtDate(presupuesto.createdAt)}</p>
            <p className="mt-2">Actualizado: {fmtDate(presupuesto.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
