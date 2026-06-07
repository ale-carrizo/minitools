import { getAlertasStock } from '@/lib/actions/stock'
import { getStockEstado, STOCK_ESTADO_CONFIG } from '@/types/stock'
import Link from 'next/link'

export default async function AlertasPage() {
  const alertas = await getAlertasStock()

  if (alertas.length === 0) {
    return (
      <div className="py-20 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl">
        <p className="text-4xl mb-3">✅</p>
        <p className="text-white/50 text-sm">Todo el inventario en orden</p>
        <p className="text-white/30 text-xs mt-1">No hay productos con stock bajo o sin stock</p>
      </div>
    )
  }

  const sinStock  = alertas.filter(p => p.stock === 0)
  const stockBajo = alertas.filter(p => p.stock > 0)

  return (
    <div className="space-y-6">
      {sinStock.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold text-red-400/80 uppercase tracking-wider mb-3">
            Sin stock — {sinStock.length}
          </h2>
          <div className="bg-white/[0.04] border border-red-500/10 rounded-2xl overflow-hidden">
            {sinStock.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < sinStock.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
              >
                <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{p.nombre}</p>
                  <p className="text-[11px] text-white/30">{p.categoria ?? 'Sin categoría'}</p>
                </div>
                <span className="text-[11px] text-red-400 font-semibold px-2 py-0.5 bg-red-500/10 rounded-full">
                  0 {p.unidad}
                </span>
                <Link
                  href={`/dashboard/stock/${p.id}`}
                  className="text-[11px] text-[#8880F5] hover:text-white font-medium transition-colors"
                >
                  Cargar →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {stockBajo.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold text-yellow-400/80 uppercase tracking-wider mb-3">
            Stock bajo — {stockBajo.length}
          </h2>
          <div className="bg-white/[0.04] border border-yellow-500/10 rounded-2xl overflow-hidden">
            {stockBajo.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < stockBajo.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
              >
                <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{p.nombre}</p>
                  <p className="text-[11px] text-white/30">{p.categoria ?? 'Sin categoría'} · mínimo: {p.stockMinimo} {p.unidad}</p>
                </div>
                <span className="text-[11px] text-yellow-400 font-semibold px-2 py-0.5 bg-yellow-500/10 rounded-full">
                  {p.stock} {p.unidad}
                </span>
                <Link
                  href={`/dashboard/stock/${p.id}`}
                  className="text-[11px] text-[#8880F5] hover:text-white font-medium transition-colors"
                >
                  Ver →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
