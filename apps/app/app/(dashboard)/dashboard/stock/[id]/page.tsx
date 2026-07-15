import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getProducto, getMovimientos, eliminarProducto } from '@/lib/actions/stock'
import { getStockEstado, STOCK_ESTADO_CONFIG } from '@/types/stock'
import MovimientoFormWrapper from './MovimientoFormWrapper'

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function ProductoPage({ params }: { params: { id: string } }) {
  const [producto, movimientos] = await Promise.all([
    getProducto(params.id),
    getMovimientos(params.id),
  ])

  if (!producto) notFound()

  const estado = getStockEstado(producto)
  const cfg    = STOCK_ESTADO_CONFIG[estado]
  const margen = producto.precioCosto > 0
    ? ((producto.precioVenta - producto.precioCosto) / producto.precioCosto * 100).toFixed(0)
    : null

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-[13px] text-white/30">
        <Link href="/dashboard/stock/inventario" className="hover:text-white/60 transition-colors">Inventario</Link>
        <span>/</span>
        <span className="text-white/60">{producto.nombre}</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Ficha principal */}
        <div className="col-span-2 space-y-4">
          {/* Header */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-[18px] font-semibold text-white">{producto.nombre}</h2>
                {producto.sku && <p className="text-[11px] text-white/30 mt-0.5">SKU: {producto.sku}</p>}
                {producto.categoria && (
                  <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-white/[0.06] border border-white/10 rounded-full text-white/40">
                    {producto.categoria}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  href={`/dashboard/stock/${producto.id}/editar`}
                  className="px-3 py-1.5 text-[11px] font-medium border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-lg transition-colors"
                >
                  Editar
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Stock actual', value: `${producto.stock} ${producto.unidad}`, extraClass: cfg.color },
                { label: 'Estado',       value: cfg.label, extraClass: cfg.color },
                { label: 'Precio costo', value: fmt(producto.precioCosto) },
                { label: 'Precio venta', value: producto.precioVenta > 0 ? fmt(producto.precioVenta) : '—' },
              ].map(c => (
                <div key={c.label} className="bg-white/[0.03] rounded-xl p-3">
                  <p className="text-[10px] text-white/30 mb-1">{c.label}</p>
                  <p className={`text-[13px] font-semibold ${c.extraClass ?? 'text-white'}`}>{c.value}</p>
                </div>
              ))}
            </div>

            {margen && producto.precioVenta > 0 && (
              <p className="text-[11px] text-white/30 mt-3">
                Margen: <span className="text-emerald-400 font-medium">{margen}%</span>
              </p>
            )}

            {producto.descripcion && (
              <p className="text-[12px] text-white/40 mt-4 pt-4 border-t border-white/[0.06]">
                {producto.descripcion}
              </p>
            )}
          </div>

          {/* Historial de movimientos */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.06]">
              <h3 className="text-[12px] font-semibold text-white/60">Historial de movimientos</h3>
            </div>
            {movimientos.length === 0 ? (
              <p className="text-center py-10 text-[12px] text-white/25">Sin movimientos registrados</p>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {movimientos.map(m => {
                  const tipoColors: Record<string, string> = {
                    entrada: 'text-emerald-400',
                    salida:  'text-red-400',
                    ajuste:  'text-blue-400',
                  }
                  const prefix = m.tipo === 'entrada' ? '+' : m.tipo === 'salida' ? '-' : '='
                  return (
                    <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                        <span className={`text-[10px] font-bold ${tipoColors[m.tipo]}`}>{prefix}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-white/70">
                          <span className={`font-semibold ${tipoColors[m.tipo]}`}>
                            {prefix}{m.cantidad} {producto.unidad}
                          </span>
                          {m.motivo && <span className="text-white/30 ml-1">· {m.motivo}</span>}
                        </p>
                        <p className="text-[10px] text-white/25">Antes: {m.stockAntes} {producto.unidad}</p>
                      </div>
                      <span className="text-[10px] text-white/25 flex-shrink-0">{fmtDate(m.createdAt)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Formulario movimiento */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <h3 className="text-[12px] font-semibold text-white/60 mb-4">Registrar movimiento</h3>
            <MovimientoFormWrapper producto={producto} />
          </div>

          {/* Info */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 space-y-2">
            <p className="text-[10px] text-white/25">Creado: {fmtDate(producto.createdAt)}</p>
            <p className="text-[10px] text-white/25">Actualizado: {fmtDate(producto.updatedAt)}</p>
            <p className="text-[10px] text-white/25">Stock mínimo: {producto.stockMinimo} {producto.unidad}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
