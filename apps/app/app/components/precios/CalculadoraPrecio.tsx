'use client'

import { useEffect, useMemo, useState } from 'react'
import { IVA_OPCIONES, calcularPrecio, type HistorialItem } from '@/types/precios'

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

function formatCurrency(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

function MoneyInput({
  value,
  onChange,
  placeholder = '0',
}: {
  value: number
  onChange: (value: number) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-white/35">$</span>
      <input
        type="number"
        min="0"
        step="any"
        value={value === 0 ? '' : value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        placeholder={placeholder}
        className="w-full pl-7 pr-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
      />
    </div>
  )
}

export default function CalculadoraPrecio({
  onGuardar,
}: {
  onGuardar: (item: Omit<HistorialItem, 'id' | 'fecha'>) => void
}) {
  const [modo, setModo] = useState<'desde_costo' | 'desde_precio'>('desde_costo')
  const [costo, setCosto] = useState(0)
  const [margen, setMargen] = useState(30)
  const [iva, setIva] = useState(21)
  const [ivaCustom, setIvaCustom] = useState(21)
  const [ivaOpcion, setIvaOpcion] = useState(21)
  const [precioVenta, setPrecioVenta] = useState(0)
  const [etiqueta, setEtiqueta] = useState('')
  const [guardado, setGuardado] = useState(false)

  const ivaActivo = ivaOpcion === -1 ? ivaCustom : ivaOpcion

  useEffect(() => {
    setIva(ivaActivo)
  }, [ivaActivo])

  const result = useMemo(() => calcularPrecio({
    costo,
    margen,
    iva: ivaActivo,
    modo,
    precioVenta,
  }), [costo, ivaActivo, margen, modo, precioVenta])

  useEffect(() => {
    if (!guardado) return
    const timeout = window.setTimeout(() => setGuardado(false), 2000)
    return () => window.clearTimeout(timeout)
  }, [guardado])

  const [exporting, setExporting] = useState(false)

  const costoPct = result.precioFinal > 0 ? (costo / result.precioFinal) * 100 : 0
  const gananciaPct = result.precioFinal > 0 ? (result.ganancia / result.precioFinal) * 100 : 0
  const ivaPct = result.precioFinal > 0 ? (result.ivaMonto / result.precioFinal) * 100 : 0

  async function exportarExcel() {
    setExporting(true)
    try {
      const XLSX = await import('xlsx')
      const data = [{
        Producto: etiqueta.trim() || 'Sin nombre',
        Costo: costo,
        Margen: margen,
        IVA: ivaActivo,
        Modo: modo === 'desde_costo' ? 'Desde el costo' : 'Desde el precio',
        'Precio sin IVA': result.precioSinIva,
        'IVA monto': result.ivaMonto,
        'Precio final': result.precioFinal,
        Ganancia: result.ganancia,
        'Margen real %': result.margenReal,
        'Markup %': result.markupReal,
        'Costo s/precio %': result.costoSobre,
      }]
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Precio')
      XLSX.writeFile(wb, `precio_${etiqueta.trim() || 'calculado'}.xlsx`)
    } catch {} finally {
      setExporting(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-3">Parámetros</p>
          <div className="flex gap-2">
            {[
              { label: '💸 Desde el costo', value: 'desde_costo' },
              { label: '🏷️ Desde el precio', value: 'desde_precio' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setModo(option.value as typeof modo)}
                className={`rounded-xl px-3 py-2 text-[12px] font-medium transition-colors ${
                  modo === option.value
                    ? 'bg-[#5448EE] text-white'
                    : 'bg-white/[0.06] text-white/40 hover:text-white/70'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Producto</label>
          <input
            value={etiqueta}
            onChange={(e) => setEtiqueta(e.target.value)}
            placeholder="Ej: Remera manga corta M"
            className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Costo ($)</label>
          <MoneyInput value={costo} onChange={setCosto} />
          <p className="text-[10px] text-white/25 mt-1">Cuánto te cuesta producirlo o comprarlo</p>
        </div>

        {modo === 'desde_costo' ? (
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Margen deseado (%)</label>
            <input
              type="number"
              min="0"
              max="99"
              step="any"
              value={margen}
              onChange={(e) => setMargen(Number(e.target.value))}
              placeholder="30"
              className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
            />
            <input
              type="range"
              min="0"
              max="99"
              step="0.5"
              value={margen}
              onChange={(e) => setMargen(Number(e.target.value))}
              className="mt-3 w-full accent-[#5448EE]"
            />
            <p className="text-[10px] text-white/25 mt-1">Porcentaje de ganancia sobre el precio de venta</p>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Precio de venta ($)</label>
            <MoneyInput value={precioVenta} onChange={setPrecioVenta} />
            <p className="text-[10px] text-white/25 mt-1">Precio al que lo vas a vender (con IVA)</p>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">IVA</label>
          <select
            value={ivaOpcion}
            onChange={(e) => setIvaOpcion(Number(e.target.value))}
            className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
          >
            {IVA_OPCIONES.map((option) => (
              <option key={option.label} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {ivaOpcion === -1 ? (
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">IVA personalizado %</label>
            <input
              type="number"
              min="0"
              step="any"
              value={ivaCustom}
              onChange={(e) => setIvaCustom(Number(e.target.value))}
              placeholder="21"
              className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
            />
          </div>
        ) : null}

        {costo > 0 && result.precioFinal > 0 ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onGuardar({
                  tipo: 'precio',
                  input: { costo, margen, iva, modo, precioVenta },
                  result,
                  etiqueta: etiqueta.trim() || undefined,
                })
                setGuardado(true)
              }}
              className="bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium"
            >
              Guardar en historial
            </button>
            {guardado ? <span className="text-[12px] text-emerald-400">✓ Guardado</span> : null}
          </div>
        ) : null}
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
        {costo === 0 ? (
          <div className="h-full min-h-[420px] flex items-center justify-center text-center text-white/35">
            <div>
              <p className="text-4xl mb-3">💡</p>
              <p className="text-[15px] text-white/60">Ingresá el costo para ver el resultado</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-2">Precio de venta final</p>
              <p className="text-[36px] font-semibold text-white tracking-tight">{formatCurrency(result.precioFinal)}</p>
              <p className="text-[15px] text-white/60 mt-2">
                IVA incluido · {result.margenReal.toFixed(1)}% de margen
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {[
                { label: 'Precio sin IVA', value: formatCurrency(result.precioSinIva) },
                { label: `IVA (${ivaActivo}%)`, value: formatCurrency(result.ivaMonto) },
                { label: 'Ganancia neta', value: formatCurrency(result.ganancia) },
                { label: 'Markup', value: `${result.markupReal.toFixed(1)}%` },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-4">
                  <p className="text-[11px] uppercase tracking-wider text-white/30 mb-1">{item.label}</p>
                  <p className="text-[20px] font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-5">
              <p className="text-[13px] text-white mb-3">Composición del precio final</p>
              <div className="h-4 overflow-hidden rounded-full bg-white/[0.05] flex">
                <div style={{ width: `${Math.max(0, costoPct)}%` }} className="bg-white/20" />
                <div style={{ width: `${Math.max(0, gananciaPct)}%` }} className="bg-[#5448EE]" />
                <div style={{ width: `${Math.max(0, ivaPct)}%` }} className="bg-[#8880F5]/60" />
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-3 text-[12px] text-white/60">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-white/20" />Costo · {costoPct.toFixed(1)}%</div>
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#5448EE]" />Ganancia · {gananciaPct.toFixed(1)}%</div>
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#8880F5]/60" />IVA · {ivaPct.toFixed(1)}%</div>
              </div>
            </div>

            {result.ganancia <= 0 ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
                ⚠️ Con ese precio perdés dinero
              </div>
            ) : null}

            {result.ganancia > 0 && result.margenReal < 10 ? (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-[13px] text-yellow-300">
                ⚠️ Margen muy bajo (menos del 10%)
              </div>
            ) : null}

            <button
              type="button"
              onClick={exportarExcel}
              disabled={exporting}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/10 px-4 py-2.5 text-[13px] font-medium text-white/60 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {exporting ? 'Exportando...' : 'Exportar Excel'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
