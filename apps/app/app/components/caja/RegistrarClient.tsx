'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { registrarCobro, registrarCobrosLote } from '@/lib/actions/caja'
import { todayAR } from '@/lib/date'
import type { BancoExtracto, ExtractoRow } from '@/types/caja'
import { BANCOS_EXTRACTO } from '@/types/caja'
import type { Producto } from '@/types/stock'

export default function RegistrarClient({ productos }: { productos: Producto[] }) {
  const router = useRouter()

  return (
    <div className="max-w-lg">
      <ComprobanteIA onSuccess={() => router.push('/dashboard/caja')} />

      <div className="my-5">
        <RegistrarDesdeArchivo onSuccess={() => router.push('/dashboard/caja')} />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[11px] text-white/30">o ingresá efectivo manualmente</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {/* Efectivo manual — siempre visible */}
      <EfectivoManual productos={productos} onSuccess={() => router.push('/dashboard/caja')} />
    </div>
  )
}


// ── Panel: Comprobante por IA (foto/PDF) ───────────────────────────────────────
// No necesita saber el banco de antemano — la IA lo detecta del comprobante.
function ComprobanteIA({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<any>(null)
  const [confirming, setConfirming] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setPreview(null)
    setError('')
  }

  async function handleFile(file: File) {
    reset()
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/scan-comprobante', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al procesar'); return }
      setPreview(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmIA() {
    if (!preview) return
    setConfirming(true)
    try {
      await registrarCobro({
        monto:         parseFloat(String(preview.monto).replace(/[^\d.]/g, '')),
        fecha_cobro:   preview.fecha ?? todayAR(),
        hora_cobro:    preview.hora  ?? undefined,
        medio:         'transferencia',
        source:        'comprobante_ia',
        emisor_nombre: preview.emisor_nombre ?? undefined,
        emisor_banco:  preview.emisor_banco  ?? undefined,
        referencia:    preview.referencia    ?? undefined,
        ia_raw:        preview.ia_raw,
        ia_confidence: preview.confidence,
        ia_provider:   preview.ia_provider,
        ia_model:      preview.ia_model,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
          Comprobante de transferencia
        </p>
      </div>

      <div className="p-4 space-y-4">
        {preview ? (
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-emerald-500/20">
              <span className="text-emerald-400 text-[13px]">✓</span>
              <span className="text-[13px] font-medium text-emerald-300">Comprobante leído correctamente</span>
              {preview.emisor_banco && (
                <span className="ml-auto text-[11px] text-white/40">{preview.emisor_banco}</span>
              )}
            </div>
            <div className="divide-y divide-white/[0.04]">
              {[
                ['Monto',        preview.monto ? `$${Number(preview.monto).toLocaleString('es-AR')}` : null],
                ['Fecha',        preview.fecha],
                ['Hora',         preview.hora],
                ['Emisor',       preview.emisor_nombre],
                ['Banco origen', preview.emisor_banco],
                ['Referencia',   preview.referencia],
              ].filter(([, val]) => val).map(([label, val]) => (
                <div key={String(label)} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[12px] text-white/40">{label}</span>
                  <span className="text-[12px] font-medium text-white">{String(val)}</span>
                </div>
              ))}
            </div>
            {error && <div className="px-4 py-2 text-[11px] text-red-400">{error}</div>}
            <div className="flex gap-2 p-3">
              <button onClick={reset} className="flex-1 py-2.5 text-[12px] text-white/50 border border-white/[0.08] rounded-xl hover:text-white transition-colors">
                Subir otro
              </button>
              <button onClick={handleConfirmIA} disabled={confirming} className="flex-[2] py-2.5 text-[12px] font-semibold text-white btn-solid-text bg-[#5448EE] rounded-xl hover:bg-[#4438DE] disabled:opacity-50 transition-colors">
                {confirming ? 'Guardando…' : 'Confirmar y registrar'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
                if (fileRef.current) fileRef.current.value = ''
              }}
            />
            <div
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-white/[0.12] rounded-2xl p-8 text-center cursor-pointer hover:bg-white/[0.03] hover:border-white/20 transition-all"
            >
              {loading ? (
                <div>
                  <div className="w-6 h-6 border-2 border-[#5448EE]/30 border-t-[#5448EE] rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-[12px] text-white/40">Procesando archivo…</p>
                </div>
              ) : (
                <>
                  <div className="text-3xl mb-2">📎</div>
                  <p className="text-[13px] font-medium text-white/70 mb-1">Arrastrá o elegí un comprobante</p>
                  <p className="text-[11px] text-white/35">JPG, PNG o PDF · máx 10MB</p>
                </>
              )}
            </div>
            {error && <p className="text-[11px] text-red-400">{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}

// ── Panel: Registrar pagos desde archivo (extracto bancario Excel/CSV) ─────────
function RegistrarDesdeArchivo({ onSuccess }: { onSuccess: () => void }) {
  const [banco, setBanco] = useState<BancoExtracto>('Banco Nación')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [rows, setRows] = useState<ExtractoRow[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [importing, setImporting] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setRows([])
    setSelected(new Set())
    setError('')
  }

  async function handleFile(file: File) {
    reset()
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('banco', banco)
      const res = await fetch('/api/import-extracto', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setRows(data.movimientos)
      setSelected(new Set(data.movimientos.map((_: any, i: number) => i)))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleImportExtracto() {
    const toImport = rows.filter((_, i) => selected.has(i))
    setImporting(true)
    try {
      await registrarCobrosLote(toImport.map(r => ({
        monto:        r.monto,
        fecha_cobro:  r.fecha,
        hora_cobro:   r.hora ?? undefined,
        medio:        'transferencia' as const,
        source:       'extracto' as const,
        concepto:     r.descripcion,
        referencia:   r.referencia ?? undefined,
        emisor_banco: banco,
        extracto_row: r.raw,
      })))
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setImporting(false)
    }
  }

  function toggleAll() {
    if (selected.size === rows.length) setSelected(new Set())
    else setSelected(new Set(rows.map((_, i) => i)))
  }

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
            Registrar pagos desde archivo
          </p>
          <p className="text-[10px] text-white/25 mt-0.5">Subí un extracto bancario (Excel/CSV) y elegí qué movimientos registrar</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            const XLSX = await import('xlsx')
            const template = [
              { Fecha: '2026-07-01', Hora: '14:30', Descripción: 'Juan Perez — Cuota julio', Monto: 35000, Referencia: '00012345' },
              { Fecha: '2026-07-02', Hora: '10:15', Descripción: 'María Gomez — Servicio técnico', Monto: 18200, Referencia: '' },
            ]
            const ws = XLSX.utils.json_to_sheet(template)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'Movimientos')
            XLSX.writeFile(wb, 'plantilla_movimientos_caja.xlsx')
          }}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5448EE]/10 border border-[#5448EE]/20 text-[#8880F5] text-[10px] font-semibold hover:bg-[#5448EE]/20 transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar plantilla
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Banco selector */}
        <div className="flex flex-wrap gap-1.5">
          {BANCOS_EXTRACTO.map(b => (
            <button
              key={b}
              onClick={() => setBanco(b)}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-lg border transition-all ${
                banco === b
                  ? 'border-[#5448EE]/50 bg-[#5448EE]/10 text-[#8880F5]'
                  : 'border-white/[0.08] text-white/40 hover:bg-white/[0.06]'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {rows.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-white/50">{rows.length} movimientos detectados</span>
              <button onClick={toggleAll} className="text-[11px] text-[#8880F5] hover:text-white transition-colors">
                {selected.size === rows.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            </div>
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.04] mb-4 max-h-64 overflow-y-auto">
              {rows.map((row, i) => (
                <div
                  key={i}
                  onClick={() => setSelected(prev => {
                    const next = new Set(prev)
                    next.has(i) ? next.delete(i) : next.add(i)
                    return next
                  })}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    selected.has(i) ? 'hover:bg-white/[0.03]' : 'opacity-40'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
                    selected.has(i) ? 'bg-[#5448EE] border-[#5448EE]' : 'border-white/20'
                  }`}>
                    {selected.has(i) && <span className="text-[#ffffff] text-[9px] font-bold">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-white truncate">{row.descripcion}</p>
                    <p className="text-[10px] text-white/35">{row.fecha}{row.hora ? ` · ${row.hora}` : ''}</p>
                  </div>
                  <span className="text-[13px] font-medium text-emerald-400 flex-shrink-0">
                    ${row.monto.toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
            {error && <p className="text-[11px] text-red-400 mb-2">{error}</p>}
            <div className="flex gap-2">
              <button onClick={reset} className="flex-1 py-2.5 text-[12px] text-white/50 border border-white/[0.08] rounded-xl hover:text-white transition-colors">
                Subir otro
              </button>
              <button onClick={handleImportExtracto} disabled={importing || selected.size === 0} className="flex-[2] py-2.5 text-[13px] font-semibold text-white btn-solid-text bg-[#5448EE] rounded-xl hover:bg-[#4438DE] disabled:opacity-40 transition-colors">
                {importing ? 'Importando…' : `Importar ${selected.size} cobro${selected.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        ) : (
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".xls,.xlsx,.csv"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
                if (fileRef.current) fileRef.current.value = ''
              }}
            />
            <div
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-white/[0.12] rounded-2xl p-6 text-center cursor-pointer hover:bg-white/[0.03] hover:border-white/20 transition-all"
            >
              {loading ? (
                <div>
                  <div className="w-6 h-6 border-2 border-[#5448EE]/30 border-t-[#5448EE] rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-[12px] text-white/40">Procesando archivo…</p>
                </div>
              ) : (
                <>
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-[13px] font-medium text-white/70 mb-1">Arrastrá o elegí un extracto</p>
                  <p className="text-[11px] text-white/35">XLS o CSV · máx 10MB</p>
                </>
              )}
            </div>
            {error && <p className="text-[11px] text-red-400">{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}

// ── Panel: Efectivo manual ────────────────────────────────────────────────────
function EfectivoManual({ productos, onSuccess }: { productos: Producto[]; onSuccess: () => void }) {
  const [monto, setMonto]       = useState('')
  const [hora, setHora]         = useState(new Date().toTimeString().slice(0, 5))
  const [concepto, setConcepto] = useState('')
  const [esVenta, setEsVenta]   = useState(false)
  const [items, setItems]       = useState<Array<{ productoId: string; cantidad: number; precio: string }>>([
    { productoId: '', cantidad: 1, precio: '' },
  ])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  function setItem(index: number, patch: Partial<{ productoId: string; cantidad: number; precio: string }>) {
    setItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  function addItem() {
    setItems((prev) => [...prev, { productoId: '', cantidad: 1, precio: '' }])
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length === 1 ? [{ productoId: '', cantidad: 1, precio: '' }] : prev.filter((_, itemIndex) => itemIndex !== index)))
  }

  async function handleSubmit() {
    if (!monto || parseFloat(monto) <= 0) { setError('Ingresá un monto válido'); return }
    const ventaItems = esVenta
      ? items
          .map((item) => ({
            producto_id: item.productoId,
            cantidad: Number(item.cantidad),
            precio: item.precio ? Number(item.precio) : undefined,
          }))
          .filter((item) => item.producto_id && item.cantidad > 0)
      : []

    if (esVenta && ventaItems.length === 0) {
      setError('Agregá al menos un producto para descontar stock')
      return
    }

    setLoading(true); setError('')
    try {
      await registrarCobro({
        monto:       parseFloat(monto),
        fecha_cobro: todayAR(),
        hora_cobro:  hora,
        medio:       'efectivo',
        source:      'manual',
        concepto:    concepto || undefined,
        items:       ventaItems,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11px] text-white/40 mb-1.5">Monto</label>
          <input
            type="number"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2.5 text-[13px] bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-[#5448EE]/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[11px] text-white/40 mb-1.5">Hora</label>
          <input
            type="time"
            value={hora}
            onChange={e => setHora(e.target.value)}
            className="w-full px-3 py-2.5 text-[13px] bg-white/[0.06] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/50 transition-colors"
          />
        </div>
      </div>
      <label className="block text-[11px] text-white/40 mb-1.5">Concepto (opcional)</label>
      <input
        type="text"
        value={concepto}
        onChange={e => setConcepto(e.target.value)}
        placeholder="Ej: Juan Pérez — cuota marzo"
        className="w-full px-3 py-2.5 text-[13px] bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-[#5448EE]/50 transition-colors mb-3"
      />
      <label className="mb-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-[12px] text-white/65">
        <input
          type="checkbox"
          checked={esVenta}
          onChange={e => setEsVenta(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-white/[0.05] accent-[#5448EE]"
        />
        Esta operación fue una venta de productos
      </label>

      {esVenta ? (
        <div className="mb-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Productos vendidos</p>
            <button type="button" onClick={addItem} className="rounded-xl bg-[#5448EE] px-3 py-1.5 text-[11px] font-medium text-white btn-solid-text hover:bg-[#4438DE]">
              + Agregar
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => {
              const producto = productos.find((p) => p.id === item.productoId)
              return (
                <div key={index} className="grid gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 md:grid-cols-[1.5fr_0.65fr_0.8fr_auto]">
                  <div>
                    <label className="mb-1 block text-[10px] text-white/35">Producto</label>
                    <select
                      value={item.productoId}
                      onChange={(e) => setItem(index, { productoId: e.target.value })}
                      className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white focus:border-[#5448EE]/60 focus:outline-none"
                    >
                      <option value="">Seleccionar producto</option>
                      {productos.map((producto) => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombre} · stock {producto.stock}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] text-white/35">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      value={item.cantidad}
                      onChange={(e) => setItem(index, { cantidad: Number(e.target.value || 1) })}
                      className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white focus:border-[#5448EE]/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] text-white/35">Precio ref.</label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.precio}
                      onChange={(e) => setItem(index, { precio: e.target.value })}
                      placeholder={producto ? String(producto.precioVenta) : 'Opcional'}
                      className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button type="button" onClick={() => removeItem(index)} className="rounded-xl border border-red-500/20 px-3 py-2 text-[11px] font-medium text-red-400">
                      Quitar
                    </button>
                  </div>
                  {producto ? (
                    <p className="md:col-span-4 text-[10px] text-white/35">
                      Disponible: {producto.stock} {producto.unidad}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
      {error && <p className="text-[11px] text-red-400 mb-2">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-2.5 text-[13px] font-semibold text-white bg-white/[0.10] border border-white/[0.12] rounded-xl hover:bg-white/[0.15] disabled:opacity-40 transition-colors"
      >
        {loading ? 'Guardando…' : 'Registrar efectivo'}
      </button>
    </div>
  )
}
