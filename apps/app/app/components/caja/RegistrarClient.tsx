'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { registrarCobro, registrarCobrosLote } from '@/lib/actions/caja'
import type { BancoExtracto, ExtractoRow } from '@/types/caja'
import { BANCOS_EXTRACTO } from '@/types/caja'

type Layer = 'comprobante' | 'extracto'

const LAYER_CONFIG = {
  comprobante: {
    icon: '📄',
    label: 'Comprobante',
    desc: 'Foto o PDF · IA lee los datos',
  },
  extracto: {
    icon: '📊',
    label: 'Extracto bancario',
    desc: 'XLS o CSV del homebanking',
  },
}

export default function RegistrarClient() {
  const router  = useRouter()
  const [layer, setLayer] = useState<Layer>('comprobante')

  return (
    <div className="max-w-lg">
      {/* Selector */}
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-3">
        ¿Cómo querés registrar el cobro?
      </p>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {(Object.entries(LAYER_CONFIG) as [Layer, typeof LAYER_CONFIG[Layer]][]).map(([id, cfg]) => (
          <button
            key={id}
            onClick={() => setLayer(id)}
            className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border text-center transition-all ${
              layer === id
                ? 'border-[#5448EE]/50 bg-[#5448EE]/10'
                : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]'
            }`}
          >
            <span className="text-xl">{cfg.icon}</span>
            <span className={`text-[12px] font-semibold ${layer === id ? 'text-[#8880F5]' : 'text-white/70'}`}>
              {cfg.label}
            </span>
            <span className="text-[10px] text-white/30 leading-tight">{cfg.desc}</span>
          </button>
        ))}
      </div>

      {/* Panel activo */}
      {layer === 'comprobante' && (
        <ComprobantePanel onSuccess={() => router.push('/dashboard/caja')} />
      )}
      {layer === 'extracto' && (
        <ExtractoPanel onSuccess={() => router.push('/dashboard/caja')} />
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[11px] text-white/30">o ingresá efectivo manualmente</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {/* Efectivo manual — siempre visible */}
      <EfectivoManual onSuccess={() => router.push('/dashboard/caja')} />
    </div>
  )
}

// ── Panel: Comprobante ────────────────────────────────────────────────────────
function ComprobantePanel({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep]         = useState<'upload' | 'preview'>('upload')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [preview, setPreview]   = useState<any>(null)
  const [confirming, setConfirm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setLoading(true); setError('')
    try {
      const fd  = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/scan-comprobante', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al procesar'); return }
      setPreview(data)
      setStep('preview')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    if (!preview) return
    setConfirm(true)
    try {
      await registrarCobro({
        monto:         parseFloat(String(preview.monto).replace(/[^\d.]/g, '')),
        fecha_cobro:   preview.fecha ?? new Date().toISOString().split('T')[0],
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
      setConfirm(false)
    }
  }

  // Preview state
  if (step === 'preview' && preview) {
    const campos = [
      ['Monto',        preview.monto ? `$${Number(preview.monto).toLocaleString('es-AR')}` : null],
      ['Fecha',        preview.fecha],
      ['Hora',         preview.hora],
      ['Emisor',       preview.emisor_nombre],
      ['Banco origen', preview.emisor_banco],
      ['Referencia',   preview.referencia],
    ].filter(([, val]) => val)

    return (
      <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2 border-b border-emerald-500/20">
          <span className="text-emerald-400 text-[13px]">✓</span>
          <span className="text-[13px] font-medium text-emerald-300">Comprobante leído correctamente</span>
          {preview.emisor_banco && (
            <span className="ml-auto text-[11px] text-white/40">{preview.emisor_banco}</span>
          )}
        </div>

        <div className="divide-y divide-white/[0.04]">
          {campos.map(([label, val]) => (
            <div key={String(label)} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[12px] text-white/40">{label}</span>
              <span className="text-[12px] font-medium text-white">{String(val)}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="px-4 py-2 text-[11px] text-red-400">{error}</div>
        )}

        <div className="flex gap-2 p-3">
          <button
            onClick={() => { setStep('upload'); setPreview(null) }}
            className="flex-1 py-2.5 text-[12px] text-white/50 border border-white/[0.08] rounded-xl hover:text-white transition-colors"
          >
            Nuevo archivo
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-[2] py-2.5 text-[12px] font-semibold text-white bg-[#5448EE] rounded-xl hover:bg-[#4438DE] disabled:opacity-50 transition-colors"
          >
            {confirming ? 'Guardando…' : 'Confirmar y registrar'}
          </button>
        </div>
      </div>
    )
  }

  // Upload state
  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div
        onClick={() => fileRef.current?.click()}
        className="border border-dashed border-white/[0.12] rounded-2xl p-8 text-center cursor-pointer hover:bg-white/[0.03] hover:border-white/20 transition-all mb-3"
      >
        {loading ? (
          <div>
            <div className="w-6 h-6 border-2 border-[#5448EE]/30 border-t-[#5448EE] rounded-full animate-spin mx-auto mb-2" />
            <p className="text-[12px] text-white/40">Procesando con IA…</p>
          </div>
        ) : (
          <>
            <div className="text-3xl mb-2">📄</div>
            <p className="text-[13px] font-medium text-white/70 mb-1">Subir comprobante de transferencia</p>
            <p className="text-[11px] text-white/35">JPG, PNG o PDF · máx 10MB</p>
          </>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Cámara',  accept: 'image/*',        capture: 'environment' },
          { label: 'Galería', accept: 'image/*',         capture: undefined },
          { label: 'PDF',     accept: 'application/pdf', capture: undefined },
        ].map(opt => (
          <button
            key={opt.label}
            onClick={() => {
              if (!fileRef.current) return
              fileRef.current.accept = opt.accept
              if (opt.capture) fileRef.current.setAttribute('capture', opt.capture)
              else fileRef.current.removeAttribute('capture')
              fileRef.current.click()
            }}
            className="py-2 text-[11px] font-medium text-white/40 border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:text-white/70 transition-all"
          >
            {opt.label === 'Cámara' ? '📷' : opt.label === 'Galería' ? '🖼' : '📋'} {opt.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
    </div>
  )
}

// ── Panel: Extracto ───────────────────────────────────────────────────────────
function ExtractoPanel({ onSuccess }: { onSuccess: () => void }) {
  const [banco, setBanco]       = useState<BancoExtracto>('Banco Nación')
  const [rows, setRows]         = useState<ExtractoRow[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading]   = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError]       = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setLoading(true); setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('banco', banco)
    try {
      const res  = await fetch('/api/import-extracto', { method: 'POST', body: fd })
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

  async function handleImport() {
    const toImport = rows.filter((_, i) => selected.has(i))
    setImporting(true)
    try {
      const n = await registrarCobrosLote(toImport.map(r => ({
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
    <div>
      {/* Selector de banco */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {BANCOS_EXTRACTO.map(b => (
          <button
            key={b}
            onClick={() => setBanco(b)}
            className={`py-2 text-[11px] font-medium rounded-xl border transition-all ${
              banco === b
                ? 'border-[#5448EE]/50 bg-[#5448EE]/10 text-[#8880F5]'
                : 'border-white/[0.08] text-white/40 hover:bg-white/[0.06]'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".xls,.xlsx,.csv"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {rows.length === 0 ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="border border-dashed border-white/[0.12] rounded-2xl p-8 text-center cursor-pointer hover:bg-white/[0.03] hover:border-white/20 transition-all"
        >
          {loading ? (
            <div>
              <div className="w-6 h-6 border-2 border-[#5448EE]/30 border-t-[#5448EE] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-[12px] text-white/40">Procesando extracto…</p>
            </div>
          ) : (
            <>
              <div className="text-3xl mb-2">📊</div>
              <p className="text-[13px] font-medium text-white/70 mb-1">Subir XLS o CSV del homebanking</p>
              <p className="text-[11px] text-white/35">Banco Nación, BBVA, Santander, Galicia, Brubank</p>
            </>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-white/50">
              {rows.length} movimientos detectados
            </span>
            <button onClick={toggleAll} className="text-[11px] text-[#8880F5] hover:text-white transition-colors">
              {selected.size === rows.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.04] mb-4">
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
                  selected.has(i)
                    ? 'bg-[#5448EE] border-[#5448EE]'
                    : 'border-white/20'
                }`}>
                  {selected.has(i) && <span className="text-white text-[9px] font-bold">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-white truncate">{row.descripcion}</p>
                  <p className="text-[10px] text-white/35">
                    {row.fecha}{row.hora ? ` · ${row.hora}` : ''}
                  </p>
                </div>
                <span className="text-[13px] font-medium text-emerald-400 flex-shrink-0">
                  ${row.monto.toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>

          {error && <p className="text-[11px] text-red-400 mb-2">{error}</p>}

          <button
            onClick={handleImport}
            disabled={importing || selected.size === 0}
            className="w-full py-3 text-[13px] font-semibold text-white bg-[#5448EE] rounded-xl hover:bg-[#4438DE] disabled:opacity-40 transition-colors"
          >
            {importing
              ? 'Importando…'
              : `Importar ${selected.size} cobro${selected.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
      {error && rows.length === 0 && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
    </div>
  )
}

// ── Panel: Efectivo manual ────────────────────────────────────────────────────
function EfectivoManual({ onSuccess }: { onSuccess: () => void }) {
  const [monto, setMonto]       = useState('')
  const [hora, setHora]         = useState(new Date().toTimeString().slice(0, 5))
  const [concepto, setConcepto] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit() {
    if (!monto || parseFloat(monto) <= 0) { setError('Ingresá un monto válido'); return }
    setLoading(true); setError('')
    try {
      await registrarCobro({
        monto:       parseFloat(monto),
        fecha_cobro: new Date().toISOString().split('T')[0],
        hora_cobro:  hora,
        medio:       'efectivo',
        source:      'manual',
        concepto:    concepto || undefined,
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
