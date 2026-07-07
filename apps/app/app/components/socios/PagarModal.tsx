'use client'

import { useState } from 'react'
import type { CobroProgramado } from '@/types/socios'
import { MEDIOS_PAGO } from '@/types/socios'
import { pagarCobro } from '@/lib/actions/socios'

function fmtN(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n)
}

interface Props {
  cobro: CobroProgramado
  nombre: string
  onClose: () => void
  onDone: () => void
}

const MAX_SIZE = 3 * 1024 * 1024

function firmasCoinciden(buffer: ArrayBuffer, mime: string): boolean {
  const head = new Uint8Array(buffer.slice(0, 12))
  switch (mime) {
    case 'image/jpeg':
      return head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF
    case 'image/png':
      return head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47 &&
             head[4] === 0x0D && head[5] === 0x0A && head[6] === 0x1A && head[7] === 0x0A
    case 'image/webp':
      return head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
             head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50
    case 'application/pdf':
      return head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46
    default:
      return false
  }
}

export default function PagarModal({ cobro, nombre, onClose, onDone }: Props) {
  const [medio, setMedio]           = useState('Efectivo')
  const [loading, setLoading]       = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [fileError, setFileError]   = useState('')
  const [comprobanteUrl, setComprobanteUrl] = useState('')
  const [fileName, setFileName]     = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError('')
    const f = e.target.files?.[0]
    if (!f) return

    if (f.size > MAX_SIZE) {
      setFileError('Máximo 3MB por archivo')
      e.target.value = ''
      return
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(f.type)) {
      setFileError('Solo JPG, PNG, WEBP o PDF')
      e.target.value = ''
      return
    }

    const head = await f.slice(0, 12).arrayBuffer()
    if (!firmasCoinciden(head, f.type)) {
      setFileError('El archivo no coincide con su tipo declarado')
      e.target.value = ''
      return
    }

    setFileName(f.name)
    setUploading(true)
    try {
      const form = new FormData()
      form.set('file', f)
      const res = await fetch('/api/socios/upload-comprobante', { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json()
        setFileError(err.error ?? 'Error al subir')
        setFileName('')
        e.target.value = ''
        setUploading(false)
        return
      }
      const { url } = await res.json()
      setComprobanteUrl(url)
    } catch {
      setFileError('Error al subir el archivo')
      setFileName('')
      e.target.value = ''
    }
    setUploading(false)
  }

  function handleRemoveFile() {
    setComprobanteUrl('')
    setFileName('')
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      await pagarCobro(cobro.id, medio, undefined, comprobanteUrl || undefined)
      onDone()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl border border-white/[0.10] bg-[#1A1830] p-5 w-full max-w-xs shadow-xl">
        <h3 className="text-[14px] font-semibold text-white mb-1">Registrar pago</h3>
        <p className="text-[11px] text-white/40 mb-4">
          {nombre} · {fmtN(cobro.monto)} · {new Date(cobro.fechaVencimiento + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
        </p>

        <label className="block text-[11px] text-white/40 mb-1.5">Medio de pago</label>
        <select
          value={medio}
          onChange={e => setMedio(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-white/[0.09] bg-white/[0.05] text-[12px] text-white mb-4 focus:outline-none focus:border-[#5448EE]/60"
        >
          {MEDIOS_PAGO.map(m => <option key={m}>{m}</option>)}
        </select>

        <label className="block text-[11px] text-white/40 mb-1.5">Comprobante (opcional, máx 3MB)</label>
        <div className="mb-3">
          {!comprobanteUrl ? (
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.03] cursor-pointer hover:border-[#5448EE]/40 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-white/30 flex-shrink-0">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
              </svg>
              <span className="text-[11px] text-white/30 flex-1">{uploading ? 'Subiendo...' : fileName || 'Adjuntar archivo'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFile}
                className="hidden"
                disabled={uploading}
              />
            </label>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#5448EE]/40 bg-[#5448EE]/10">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8880F5" strokeWidth={2} className="flex-shrink-0">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="text-[11px] text-[#8880F5] flex-1 truncate">{fileName}</span>
              <button
                onClick={handleRemoveFile}
                className="w-5 h-5 rounded flex items-center justify-center text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          )}
          {fileError && <p className="text-[10px] text-red-400 mt-1">{fileError}</p>}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-[12px] text-white/50 border border-white/10 rounded-xl hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            disabled={loading || uploading}
            onClick={handleConfirm}
            className="flex-[2] py-2.5 text-[12px] font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Guardando…' : '✓ Confirmar pago'}
          </button>
        </div>
      </div>
    </div>
  )
}
