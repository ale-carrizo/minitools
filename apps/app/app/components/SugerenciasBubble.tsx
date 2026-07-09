'use client'

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { enviarSugerencia } from '@/lib/actions/sugerencias'
import { getToolPathLabel } from '@/lib/apps-config'
import { useAppNames } from '@/hooks/useAppNames'

const CATEGORIAS = [
  { value: 'mejora',         label: '✨ Mejora',          color: '#8880F5' },
  { value: 'nueva_funcion',  label: '🚀 Nueva función',   color: '#06B6D4' },
  { value: 'error',          label: '🐛 Error / Bug',     color: '#F87171' },
  { value: 'otro',           label: '💬 Otro',            color: '#9CA3AF' },
]

const POSITION_KEY = 'zimple-sugerencias-bubble-pos'
const BUBBLE_SIZE = 48
const DRAG_THRESHOLD = 6 // px de movimiento antes de considerarlo drag y no click

type Pos = { x: number; y: number }

export default function SugerenciasBubble() {
  const [open, setOpen]         = useState(false)
  const [texto, setTexto]       = useState('')
  const [categoria, setCategoria] = useState('mejora')
  const [sent, setSent]         = useState(false)
  const [, startTrans]          = useTransition()
  const panelRef                = useRef<HTMLDivElement>(null)
  const btnRef                  = useRef<HTMLButtonElement>(null)
  const pathname                = usePathname()
  const { names }               = useAppNames()
  const tool                    = getToolPathLabel(pathname, names)

  const [pos, setPos] = useState<Pos | null>(null)
  const [dragging, setDragging] = useState(false)
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null)

  // Cargar posición guardada al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(POSITION_KEY)
      if (raw) setPos(JSON.parse(raw))
    } catch {}
  }, [])

  function clampPos(x: number, y: number): Pos {
    const maxX = window.innerWidth - BUBBLE_SIZE - 8
    const maxY = window.innerHeight - BUBBLE_SIZE - 8
    return { x: Math.min(Math.max(x, 8), maxX), y: Math.min(Math.max(y, 8), maxY) }
  }

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragState.current) return
    const dx = e.clientX - dragState.current.startX
    const dy = e.clientY - dragState.current.startY
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      dragState.current.moved = true
      setDragging(true)
    }
    if (dragState.current.moved) {
      setPos(clampPos(dragState.current.origX + dx, dragState.current.origY + dy))
    }
  }, [])

  const onPointerUp = useCallback(() => {
    if (dragState.current?.moved) {
      setPos((current) => {
        if (current) {
          try { localStorage.setItem(POSITION_KEY, JSON.stringify(current)) } catch {}
        }
        return current
      })
    }
    const wasMoved = dragState.current?.moved
    dragState.current = null
    setDragging(false)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    return wasMoved
  }, [onPointerMove])

  function handlePointerDown(e: React.PointerEvent) {
    if (open) return // no arrastrar con el panel abierto
    const rect = btnRef.current?.getBoundingClientRect()
    const current = pos ?? (rect ? { x: rect.left, y: rect.top } : clampPos(window.innerWidth - BUBBLE_SIZE - 24, window.innerHeight - BUBBLE_SIZE - 24))
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: current.x, origY: current.y, moved: false }
    setPos(current)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  function handleClick() {
    if (dragState.current?.moved) return // fue un drag, no abrir el panel
    if (open) setOpen(false)
    else handleOpen()
  }

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleOpen() {
    setSent(false)
    setTexto('')
    setCategoria('mejora')
    setOpen(true)
  }

  function handleSubmit() {
    if (!texto.trim()) return
    startTrans(async () => {
      await enviarSugerencia({ texto, categoria, tool })
      setSent(true)
      setTimeout(() => setOpen(false), 1800)
    })
  }

  const catConfig = CATEGORIAS.find(c => c.value === categoria)!

  // Si hay posición custom, la usamos con top/left fijo; el panel se abre hacia
  // arriba-izquierda del botón para no salirse de la pantalla.
  const containerStyle: React.CSSProperties = pos
    ? { position: 'fixed', left: pos.x, top: pos.y, zIndex: 50 }
    : {}

  return (
    <div
      className={pos ? 'flex flex-col items-end gap-3' : 'fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3'}
      style={containerStyle}
    >
      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="w-80 rounded-2xl border border-white/[0.10] light:border-black/[0.10] bg-[#13122A] light:bg-[#ffffff] shadow-2xl shadow-black/50 overflow-hidden"
          style={{
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
            ...(pos ? { position: 'absolute', bottom: BUBBLE_SIZE + 12, right: 0 } : {}),
          }}
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-white">Sugerencias</p>
              {tool && (
                <p className="text-[10px] text-white/30 mt-0.5">Tool: {tool}</p>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {sent ? (
            <div className="py-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                ✓
              </div>
              <p className="text-[13px] font-medium text-white">¡Gracias por tu sugerencia!</p>
              <p className="text-[11px] text-white/35">La vamos a revisar pronto.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Categoría */}
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategoria(cat.value)}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium text-left transition-all ${
                      categoria === cat.value
                        ? 'border-[#5448EE]/60 bg-[#5448EE]/15 text-white'
                        : 'border-white/[0.07] text-white/35 bg-white/[0.03] hover:text-white/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Texto */}
              <textarea
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder={
                  categoria === 'error'
                    ? 'Describí qué pasó y cuándo ocurrió…'
                    : categoria === 'nueva_funcion'
                    ? 'Qué función te gustaría ver…'
                    : 'Tu sugerencia o comentario…'
                }
                rows={4}
                className="w-full px-3 py-2.5 text-[12px] rounded-xl border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/50 resize-none"
                autoFocus
              />

              <button
                onClick={handleSubmit}
                disabled={!texto.trim()}
                className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: texto.trim()
                    ? 'linear-gradient(135deg, #6E63FF, #5448EE)'
                    : 'rgba(255,255,255,0.05)',
                }}
              >
                Enviar sugerencia
              </button>
            </div>
          )}
        </div>
      )}

      {/* Botón flotante — arrastrable */}
      <button
        ref={btnRef}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 touch-none ${
          dragging ? 'cursor-grabbing scale-105' : open ? 'scale-95 cursor-pointer' : 'hover:scale-105 cursor-grab'
        }`}
        style={{
          background: 'linear-gradient(135deg, #6E63FF, #5448EE 55%, #4035d4)',
          boxShadow: '0 4px 20px rgba(84,72,238,0.5)',
        }}
        title="Sugerencias y mejoras — mantené presionado y arrastrá para mover"
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a7 7 0 0 1 7 7c0 3.5-2.5 6-5 8v1a1 1 0 0 1-2 0v-1c-2.5-2-5-4.5-5-8a7 7 0 0 1 7-7z"/>
            <path d="M9 21h6"/>
          </svg>
        )}

        {/* Pulse ring */}
        {!open && !dragging && (
          <span className="absolute inset-0 rounded-2xl animate-ping opacity-20"
            style={{ background: '#5448EE' }} />
        )}
      </button>
    </div>
  )
}
