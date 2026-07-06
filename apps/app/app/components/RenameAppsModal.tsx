'use client'

import { useState, useEffect, useRef } from 'react'
import { APPS, APP_BY_SLUG } from '@/lib/apps-config'
import { useAppNames } from '@/hooks/useAppNames'

interface Props {
  open: boolean
  onClose: () => void
}

export default function RenameAppsModal({ open, onClose }: Props) {
  const { names, setLabel, resetLabel } = useAppNames()
  const [draft, setDraft] = useState<Record<string, string>>({})
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      const d: Record<string, string> = {}
      APPS.forEach(a => { d[a.slug] = names[a.slug] ?? '' })
      setDraft(d)
    }
  }, [open, names])

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (e.target === overlayRef.current) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  function handleSave() {
    Object.entries(draft).forEach(([slug, val]) => {
      if (val.trim()) {
        setLabel(slug, val.trim())
      } else {
        resetLabel(slug)
      }
    })
    onClose()
  }

  function handleReset(slug: string) {
    setDraft(prev => ({ ...prev, [slug]: '' }))
  }

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.10] light:border-gray-200 bg-[#13122A] light:bg-[#ffffff] shadow-2xl shadow-black/50 light:shadow-black/10 overflow-hidden animate-[fade-up_0.3s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="px-5 py-4 border-b border-white/[0.07] light:border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-white light:text-gray-900">Renombrar apps</p>
            <p className="text-[10px] text-white/30 light:text-gray-400 mt-0.5">Personalizá el nombre de cada herramienta — es solo visual</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 light:text-gray-400 hover:text-white light:hover:text-gray-700 hover:bg-white/[0.08] light:hover:bg-gray-100 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-2.5 max-h-[50vh] overflow-y-auto">
          {APPS.map(app => {
            const def = APP_BY_SLUG[app.slug]
            const value = draft[app.slug] ?? ''
            const changed = value.trim() && value.trim() !== def.label
            return (
              <div key={app.slug} className="flex items-center gap-3">
                <span className="text-lg flex-shrink-0 w-7 text-center">{app.icon}</span>
                <div className="flex-1 relative">
                  <input
                    value={value}
                    onChange={e => setDraft(prev => ({ ...prev, [app.slug]: e.target.value }))}
                    placeholder={def.label}
                    className={`w-full px-3 py-2 text-[12px] rounded-xl border bg-white/[0.04] light:bg-gray-50 text-white light:text-gray-900 placeholder:text-white/20 light:placeholder:text-gray-300 focus:outline-none focus:border-[#5448EE]/50 transition-colors ${
                      changed ? 'border-[#5448EE]/40' : 'border-white/[0.08] light:border-gray-200'
                    }`}
                  />
                </div>
                {changed && (
                  <button
                    onClick={() => handleReset(app.slug)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white/25 light:text-gray-400 hover:text-red-400 hover:bg-white/[0.06] light:hover:bg-red-50 transition-colors flex-shrink-0"
                    title="Restaurar nombre original"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                      <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    </svg>
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="px-5 py-4 border-t border-white/[0.07] light:border-gray-100 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.09] light:border-gray-200 text-[12px] text-white/50 light:text-gray-400 hover:text-white light:hover:text-gray-700 hover:bg-white/[0.04] light:hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-2.5 rounded-xl text-[12px] font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6E63FF, #5448EE)' }}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}
