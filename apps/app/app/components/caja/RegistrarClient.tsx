'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { registrarCobro } from '@/lib/actions/caja'
import { todayAR } from '@/lib/date'
import type { Producto } from '@/types/stock'
import VentaItemsPicker, { nuevoVentaItem, buildVentaItemsPayload, type VentaItem } from '../stock/VentaItemsPicker'

export default function RegistrarClient({ productos }: { productos: Producto[] }) {
  const router = useRouter()

  return (
    <div className="max-w-6xl grid gap-5 lg:grid-cols-2 items-start">
      <ComprobanteIA productos={productos} onSuccess={() => router.push('/dashboard/caja')} />

      <div>
        <div className="flex items-center gap-3 mb-5 lg:hidden">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[11px] text-white/30">o ingresá efectivo manualmente</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        <p className="hidden lg:block mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">
          O ingresá efectivo manualmente
        </p>
        <EfectivoManual productos={productos} onSuccess={() => router.push('/dashboard/caja')} />
      </div>
    </div>
  )
}


// ── Panel: Comprobante por IA (foto/PDF) ───────────────────────────────────────
// No necesita saber el banco de antemano — la IA lo detecta del comprobante.
function ComprobanteIA({ productos, onSuccess }: { productos: Producto[]; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<any>(null)
  const [confirming, setConfirming] = useState(false)
  const [esVenta, setEsVenta] = useState(false)
  const [items, setItems] = useState<VentaItem[]>([nuevoVentaItem()])

  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setPreview(null)
    setError('')
    setEsVenta(false)
    setItems([nuevoVentaItem()])
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
    const ventaItems = esVenta ? buildVentaItemsPayload(items) : []
    if (esVenta && ventaItems.length === 0) {
      setError('Agregá al menos un producto para descontar stock')
      return
    }
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
        items:         ventaItems,
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
            {productos.length > 0 && (
              <div className="px-3 pb-3">
                <label className="mb-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-[12px] text-white/65">
                  <input
                    type="checkbox"
                    checked={esVenta}
                    onChange={(e) => setEsVenta(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/[0.05] accent-[#5448EE]"
                  />
                  Esta operación fue una venta de productos
                </label>
                {esVenta && <VentaItemsPicker productos={productos} items={items} onChange={setItems} />}
              </div>
            )}
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

// ── Panel: Efectivo manual ────────────────────────────────────────────────────
function EfectivoManual({ productos, onSuccess }: { productos: Producto[]; onSuccess: () => void }) {
  const [monto, setMonto]       = useState('')
  const [hora, setHora]         = useState(new Date().toTimeString().slice(0, 5))
  const [concepto, setConcepto] = useState('')
  const [esVenta, setEsVenta]   = useState(false)
  const [items, setItems]       = useState<VentaItem[]>([nuevoVentaItem()])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit() {
    if (!monto || parseFloat(monto) <= 0) { setError('Ingresá un monto válido'); return }
    const ventaItems = esVenta ? buildVentaItemsPayload(items) : []

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
        <div className="mb-3">
          <VentaItemsPicker productos={productos} items={items} onChange={setItems} />
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
