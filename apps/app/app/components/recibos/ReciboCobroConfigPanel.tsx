'use client'

import { useRef, useState, useTransition } from 'react'
import { guardarReciboCobroConfig } from '@/lib/actions/recibos'
import type { ReciboCobroConfig } from '@/types/recibos'

const MAX_LOGO_BYTES = 3 * 1024 * 1024 // 3MB
const TIPOS_LOGO_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp']

export default function ReciboCobroConfigPanel({ config: initialConfig }: { config: ReciboCobroConfig | null }) {
  const [config, setConfig] = useState(initialConfig)
  const [showConfig, setShowConfig] = useState(!initialConfig)
  const [saveMsg, setSaveMsg] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const logoRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    emisorNombre: initialConfig?.emisorNombre ?? '',
    emisorDoc: initialConfig?.emisorDoc ?? '',
    emisorDireccion: initialConfig?.emisorDireccion ?? '',
    logoUrl: initialConfig?.logoUrl ?? '',
  })

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    if (!TIPOS_LOGO_PERMITIDOS.includes(file.type)) {
      setError('El logo debe ser PNG, JPG o WebP')
      if (logoRef.current) logoRef.current.value = ''
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError('El logo no puede superar los 3MB')
      if (logoRef.current) logoRef.current.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, logoUrl: reader.result as string }))
    reader.readAsDataURL(file)
  }

  function handleSave() {
    setError('')
    startTransition(async () => {
      try {
        const saved = await guardarReciboCobroConfig({
          emisorNombre: form.emisorNombre || undefined,
          emisorDoc: form.emisorDoc || undefined,
          emisorDireccion: form.emisorDireccion || undefined,
          logoUrl: form.logoUrl || undefined,
        })
        setConfig(saved)
        setSaveMsg('Guardado')
        setTimeout(() => setSaveMsg(''), 2000)
        if (form.emisorNombre) setShowConfig(false)
      } catch (err: any) {
        setError(err.message ?? 'No se pudo guardar')
      }
    })
  }

  const inputCls = 'w-full px-3 py-2.5 text-[12px] rounded-xl border border-white/[0.09] bg-white/[0.05] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60'

  return (
    <div className="mb-5">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">Tus datos</p>
      <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
      <button
        onClick={() => setShowConfig((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          {config?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.logoUrl} alt="Logo" className="w-7 h-7 rounded object-contain bg-white/10" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-[#5448EE]/20 flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="#8880F5">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
          <div className="text-left">
            <p className="text-[13px] font-medium text-white">
              {config?.emisorNombre ?? 'Configurar mi negocio'}
            </p>
            {config?.emisorDoc && <p className="text-[11px] text-white/35">CUIT {config.emisorDoc}</p>}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          className={`text-white/30 transition-transform ${showConfig ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6" strokeLinecap="round"/>
        </svg>
      </button>

      {showConfig && (
        <div className="px-5 pb-5 pt-1 border-t border-white/[0.06] space-y-3">
          <p className="text-[11px] text-white/30">Se autocompleta en cada recibo nuevo y el logo aparece en el PDF.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] text-white/40 mb-1.5">Nombre / Razón social</label>
              <input type="text" value={form.emisorNombre} onChange={(e) => setForm((f) => ({ ...f, emisorNombre: e.target.value }))}
                placeholder="Tu Empresa SRL" className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] text-white/40 mb-1.5">CUIT</label>
              <input type="text" value={form.emisorDoc} onChange={(e) => setForm((f) => ({ ...f, emisorDoc: e.target.value }))}
                placeholder="30-00000000-0" className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] text-white/40 mb-1.5">Dirección</label>
              <input type="text" value={form.emisorDireccion} onChange={(e) => setForm((f) => ({ ...f, emisorDireccion: e.target.value }))}
                placeholder="Av. Corrientes 1234, CABA" className={inputCls} />
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-[11px] text-white/40 mb-1.5">Logo (PNG, JPG o WebP · máx 3MB)</label>
            <div className="flex items-center gap-3">
              {form.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-contain bg-white/10 border border-white/10" />
              )}
              <button type="button" onClick={() => logoRef.current?.click()}
                className="px-3 py-2 rounded-xl border border-white/[0.09] bg-white/[0.05] text-[11px] text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors">
                {form.logoUrl ? 'Cambiar logo' : 'Subir logo'}
              </button>
              {form.logoUrl && (
                <button type="button" onClick={() => setForm((f) => ({ ...f, logoUrl: '' }))}
                  className="text-[11px] text-red-400/60 hover:text-red-400">
                  Quitar
                </button>
              )}
              <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />
            </div>
          </div>

          {error && <p className="text-[11px] text-red-400">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button onClick={handleSave} disabled={isPending}
              className="px-4 py-2.5 bg-[#5448EE] text-white btn-solid-text text-[12px] font-medium rounded-xl hover:bg-[#4438DE] disabled:opacity-50 transition-colors">
              {isPending ? 'Guardando...' : 'Guardar configuración'}
            </button>
            {saveMsg && <span className="text-[11px] text-emerald-400">{saveMsg}</span>}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
