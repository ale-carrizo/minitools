'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { updateTarea, deleteTarea } from '@/lib/actions/tareas'
import {
  PRIORIDAD_CONFIG, COLORES_ETIQUETA, COLORES_PORTADA,
  estaVencida, checkProgress,
  MAX_ADJUNTO_BYTES, TIPOS_ADJUNTO_PERMITIDOS,
} from '@/types/tareas'
import type { Tarea, Columna, Etiqueta, CheckItem, Prioridad, Adjunto } from '@/types/tareas'

interface Props {
  tarea:    Tarea
  columnas: Columna[]
  onClose:  () => void
  onUpdate: (t: Tarea) => void
  onDelete: (id: string) => void
  onMove:   (tareaId: string, columnaId: string) => void
}

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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function TareaModal({ tarea, columnas, onClose, onUpdate, onDelete, onMove }: Props) {
  const [titulo,      setTitulo]      = useState(tarea.titulo)
  const [desc,        setDesc]        = useState(tarea.descripcion ?? '')
  const [prioridad,   setPrioridad]   = useState<Prioridad>(tarea.prioridad)
  const [etiquetas,   setEtiquetas]   = useState<Etiqueta[]>(tarea.etiquetas)
  const [checklist,   setChecklist]   = useState<CheckItem[]>(tarea.checklist)
  const [adjuntos,    setAdjuntos]    = useState<Adjunto[]>(tarea.adjuntos)
  const [fechaVenc,   setFechaVenc]   = useState(tarea.fechaVenc ?? '')
  const [portada,     setPortada]     = useState(tarea.portada ?? '')
  const [nuevoItem,   setNuevoItem]   = useState('')
  const [showPortada, setShowPortada] = useState(false)
  const [showLabels,  setShowLabels]  = useState(false)
  const [adjuntoError, setAdjuntoError] = useState('')
  const [subiendo,    setSubiendo]    = useState(false)
  const [, startTrans]                = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  // Cerrar con Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') save() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [titulo, desc, prioridad, etiquetas, checklist, adjuntos, fechaVenc, portada])

  function save() {
    startTrans(async () => {
      const r = await updateTarea(tarea.id, {
        titulo:      titulo.trim() || tarea.titulo,
        descripcion: desc.trim() || null,
        prioridad,
        etiquetas:   JSON.stringify(etiquetas),
        checklist:   JSON.stringify(checklist),
        adjuntos:    JSON.stringify(adjuntos),
        fechaVenc:   fechaVenc || null,
        portada:     portada || null,
      })
      onUpdate(r)
      onClose()
    })
  }

  function toggleCheck(i: number) {
    setChecklist(cl => cl.map((c, idx) => idx === i ? { ...c, hecho: !c.hecho } : c))
  }

  function addCheck() {
    if (!nuevoItem.trim()) return
    setChecklist(cl => [...cl, { texto: nuevoItem.trim(), hecho: false }])
    setNuevoItem('')
  }

  function removeCheck(i: number) {
    setChecklist(cl => cl.filter((_, idx) => idx !== i))
  }

  function toggleEtiqueta(color: string, texto: string) {
    setEtiquetas(prev => {
      const exists = prev.find(e => e.color === color)
      return exists ? prev.filter(e => e.color !== color) : [...prev, { color, texto }]
    })
  }

  async function handleAdjuntoFile(file: File) {
    setAdjuntoError('')
    if (!TIPOS_ADJUNTO_PERMITIDOS.includes(file.type)) {
      setAdjuntoError('Solo se aceptan JPG, PNG, WEBP o PDF')
      return
    }
    if (file.size > MAX_ADJUNTO_BYTES) {
      setAdjuntoError('El archivo no puede superar los 3MB')
      return
    }
    setSubiendo(true)
    try {
      const head = await file.slice(0, 12).arrayBuffer()
      if (!firmasCoinciden(head, file.type)) {
        setAdjuntoError('El archivo no coincide con su tipo declarado')
        return
      }
      const url = await fileToDataUrl(file)
      setAdjuntos(prev => [...prev, { nombre: file.name, url, tipo: file.type, tamano: file.size }])
    } catch {
      setAdjuntoError('No se pudo leer el archivo')
    } finally {
      setSubiendo(false)
    }
  }

  function removeAdjunto(i: number) {
    setAdjuntos(prev => prev.filter((_, idx) => idx !== i))
  }

  const prog = checkProgress(checklist)
  const vencida = estaVencida(fechaVenc)

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-white/[0.10] light:border-black/[0.10] bg-[#13122A] light:bg-[#ffffff] shadow-2xl overflow-hidden flex flex-col">

        {/* Portada */}
        {portada && (
          <div className="h-16 w-full relative flex-shrink-0" style={{ background: portada }}>
            <button onClick={() => setPortada('')}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center text-white/70 hover:text-white text-xs">
              ×
            </button>
          </div>
        )}

        {/* Título — fijo */}
        <div className="px-5 pt-4 pb-2 flex-shrink-0">
          <input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            className="w-full text-[17px] font-bold text-white bg-transparent border-none outline-none placeholder:text-white/20"
            placeholder="Título de la tarea"
          />
          {etiquetas.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {etiquetas.map(e => (
                <span key={e.color} className="text-[10px] font-semibold px-2.5 py-1 rounded-full text-white"
                  style={{ background: e.color }}>
                  {e.texto}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Contenido — scrolleable */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Col izquierda — contenido */}
            <div className="col-span-3 sm:col-span-2 space-y-4">
              {/* Descripción */}
              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Descripción</p>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Agregá una descripción más detallada…"
                  rows={3}
                  className="w-full px-3 py-2.5 text-[12px] rounded-xl border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/50 resize-none"
                />
              </div>

              {/* Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                    Checklist {prog.total > 0 && <span className="text-white/50 normal-case tracking-normal font-normal">({prog.hechos}/{prog.total})</span>}
                  </p>
                </div>
                {prog.total > 0 && (
                  <div className="h-1.5 rounded-full bg-white/[0.06] mb-3 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.round((prog.hechos / prog.total) * 100)}%` }} />
                  </div>
                )}
                <div className="space-y-2 mb-2">
                  {checklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <input type="checkbox" checked={item.hecho} onChange={() => toggleCheck(i)}
                        className="rounded border-white/20 bg-white/[0.05] text-[#5448EE] accent-[#5448EE] flex-shrink-0 w-4 h-4 cursor-pointer" />
                      <span className={`flex-1 text-[12px] ${item.hecho ? 'line-through text-white/25' : 'text-white'}`}>
                        {item.texto}
                      </span>
                      <button onClick={() => removeCheck(i)}
                        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 text-xs transition-opacity">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={nuevoItem} onChange={e => setNuevoItem(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCheck() } }}
                    placeholder="Nuevo ítem…"
                    className="flex-1 px-3 py-2 text-[11px] rounded-xl border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/50" />
                  <button onClick={addCheck} disabled={!nuevoItem.trim()}
                    className="px-3 py-2 rounded-xl bg-[#5448EE]/20 text-[#8880F5] text-[11px] font-medium hover:bg-[#5448EE]/30 disabled:opacity-30 transition-colors">
                    + Agregar
                  </button>
                </div>
              </div>

              {/* Adjuntos */}
              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">
                  Adjuntos {adjuntos.length > 0 && <span className="text-white/50 normal-case tracking-normal font-normal">({adjuntos.length})</span>}
                </p>
                {adjuntos.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {adjuntos.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] group">
                        <span className="text-[13px] flex-shrink-0">
                          {a.tipo === 'application/pdf' ? '📄' : '🖼️'}
                        </span>
                        <a href={a.url} download={a.nombre} target="_blank" rel="noreferrer"
                          className="flex-1 min-w-0 text-[11px] text-white/70 hover:text-white truncate transition-colors">
                          {a.nombre}
                        </a>
                        <span className="text-[10px] text-white/25 flex-shrink-0">{(a.tamano / 1024).toFixed(0)} KB</span>
                        <button onClick={() => removeAdjunto(i)}
                          className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 text-xs transition-opacity flex-shrink-0">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleAdjuntoFile(file)
                    if (fileRef.current) fileRef.current.value = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={subiendo}
                  className="w-full py-2 rounded-xl border border-dashed border-white/[0.10] text-[11px] text-white/40 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
                >
                  {subiendo ? 'Subiendo…' : '+ Adjuntar archivo (JPG, PNG, PDF · máx 3MB)'}
                </button>
                {adjuntoError && <p className="text-[10px] text-red-400 mt-1.5">{adjuntoError}</p>}
              </div>
            </div>

            {/* Col derecha — metadatos */}
            <div className="col-span-3 sm:col-span-1 space-y-3">
              {/* Prioridad */}
              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Prioridad</p>
                <div className="flex flex-wrap gap-1 sm:block sm:space-y-1">
                  {(Object.entries(PRIORIDAD_CONFIG) as [Prioridad, any][]).map(([k, v]) => (
                    <button key={k} onClick={() => setPrioridad(k)}
                      className={`text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all sm:w-full ${prioridad === k ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                      style={prioridad === k ? { background: v.bg, color: v.color } : {}}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fecha */}
              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Vencimiento</p>
                <input type="date" value={fechaVenc} onChange={e => setFechaVenc(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-xl border text-[11px] bg-white/[0.04] focus:outline-none focus:border-[#5448EE]/50 ${vencida && fechaVenc ? 'border-red-500/40 text-red-400' : 'border-white/[0.08] text-white'}`} />
                {fechaVenc && (
                  <button onClick={() => setFechaVenc('')} className="text-[10px] text-white/25 hover:text-white/50 mt-1">
                    Quitar fecha
                  </button>
                )}
              </div>

              {/* Mover a */}
              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Columna</p>
                <select
                  value={tarea.columnaId}
                  onChange={e => { onMove(tarea.id, e.target.value); onClose() }}
                  className="w-full px-2.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.05] text-[11px] text-white focus:outline-none focus:border-[#5448EE]/50"
                >
                  {columnas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              {/* Portada */}
              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Portada</p>
                {showPortada ? (
                  <div className="grid grid-cols-5 gap-1.5">
                    {COLORES_PORTADA.map(c => (
                      <button key={c} onClick={() => { setPortada(c); setShowPortada(false) }}
                        className={`h-6 rounded-lg transition-transform hover:scale-110 ${portada === c ? 'ring-2 ring-white' : ''}`}
                        style={{ background: c }} />
                    ))}
                    <button onClick={() => { setPortada(''); setShowPortada(false) }}
                      className="col-span-5 text-[10px] text-white/30 hover:text-white/60 mt-1">
                      Sin portada
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowPortada(true)}
                    className="w-full h-8 rounded-xl border border-white/[0.08] flex items-center justify-center gap-2 text-[11px] text-white/40 hover:text-white hover:border-white/20 transition-colors"
                    style={portada ? { background: portada } : {}}>
                    {portada ? '' : '+ Color de portada'}
                  </button>
                )}
              </div>

              {/* Etiquetas */}
              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Etiquetas</p>
                {showLabels ? (
                  <div className="space-y-1">
                    {COLORES_ETIQUETA.map(({ bg, label }) => {
                      const sel = etiquetas.some(e => e.color === bg)
                      return (
                        <button key={bg} onClick={() => toggleEtiqueta(bg, label)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition-all ${sel ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                          style={sel ? { background: bg + '33' } : {}}>
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: bg }} />
                          {label}
                          {sel && <span className="ml-auto text-white/60">✓</span>}
                        </button>
                      )
                    })}
                    <button onClick={() => setShowLabels(false)} className="text-[10px] text-white/25 hover:text-white/50 mt-1">
                      Listo
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowLabels(true)}
                    className="w-full py-1.5 rounded-xl border border-white/[0.08] text-[11px] text-white/40 hover:text-white hover:border-white/20 transition-colors">
                    + Etiquetas
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer — fijo */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.06] light:border-black/[0.08] flex-shrink-0">
          <button onClick={() => { startTrans(async () => { await deleteTarea(tarea.id); onDelete(tarea.id); onClose() }) }}
            className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors">
            Eliminar tarea
          </button>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-[12px] text-white/40 border border-white/[0.08] rounded-xl hover:text-white transition-colors">
              Cancelar
            </button>
            <button onClick={save}
              className="px-4 py-2 text-[12px] font-medium text-white btn-solid-text bg-[#5448EE] rounded-xl hover:bg-[#4438DE] transition-colors">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
