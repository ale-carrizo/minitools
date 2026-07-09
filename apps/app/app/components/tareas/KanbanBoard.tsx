'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createTarea, updateColumna, deleteColumna, addColumna,
  moverTarea, updateTablero, deleteTablero,
} from '@/lib/actions/tareas'
import { PRIORIDAD_CONFIG, COLORES_COLUMNA, estaVencida, checkProgress } from '@/types/tareas'
import type { Tablero, Columna, Tarea, Prioridad } from '@/types/tareas'
import TareaModal from './TareaModal'
import Link from 'next/link'

// ── TareaCard ─────────────────────────────────────────────────────────────────
function TareaCard({
  tarea, onDragStart, onDragEnd, onClick,
}: {
  tarea: Tarea
  onDragStart: (t: Tarea) => void
  onDragEnd: () => void
  onClick: (t: Tarea) => void
}) {
  const pCfg    = PRIORIDAD_CONFIG[tarea.prioridad]
  const vencida = estaVencida(tarea.fechaVenc)
  const prog    = checkProgress(tarea.checklist)

  return (
    <div
      draggable
      onDragStart={() => onDragStart(tarea)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(tarea)}
      className="group rounded-xl border border-white/[0.08] light:border-black/[0.08] bg-white/[0.05] light:bg-[#EBEBF5] hover:border-white/[0.15] light:hover:border-black/[0.15] hover:bg-white/[0.08] light:hover:bg-[#DEDEEB] cursor-pointer transition-all select-none shadow-sm hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Portada */}
      {tarea.portada && (
        <div className="h-8 rounded-t-xl" style={{ background: tarea.portada }} />
      )}

      <div className="p-3">
        {/* Etiquetas */}
        {tarea.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tarea.etiquetas.map(e => (
              <span key={e.color} className="w-8 h-2 rounded-full" style={{ background: e.color }} title={e.texto} />
            ))}
          </div>
        )}

        <p className="text-[13px] font-medium text-white leading-snug mb-2">{tarea.titulo}</p>

        {/* Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ background: pCfg.bg, color: pCfg.color }}>
            {pCfg.label}
          </span>

          {tarea.fechaVenc && (
            <span className={`flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${vencida ? 'bg-red-500/15 text-red-400' : 'bg-white/[0.06] text-white/40'}`}>
              <svg width="9" height="9" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              {new Date(tarea.fechaVenc + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
            </span>
          )}

          {prog.total > 0 && (
            <span className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md ${prog.hechos === prog.total ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.06] text-white/40'}`}>
              <svg width="9" height="9" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              {prog.hechos}/{prog.total}
            </span>
          )}

          {tarea.descripcion && (
            <span className="text-[10px] text-white/25">
              <svg width="9" height="9" viewBox="0 0 20 20" fill="currentColor" className="inline -mt-0.5">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── KanbanColumn ──────────────────────────────────────────────────────────────
function KanbanColumn({
  columna, tableroId, isDragOver,
  onDragOver, onDrop, onDragStart, onDragEnd, onCardClick, onColumnUpdate, onColumnDelete, onCardAdd,
}: {
  columna:        Columna
  tableroId:      string
  isDragOver:     boolean
  onDragOver:     (e: React.DragEvent, colId: string) => void
  onDrop:         (colId: string) => void
  onDragStart:    (t: Tarea) => void
  onDragEnd:      () => void
  onCardClick:    (t: Tarea) => void
  onColumnUpdate: (id: string, data: { nombre?: string; color?: string }) => void
  onColumnDelete: (id: string) => void
  onCardAdd:      (t: Tarea) => void
}) {
  const [editName, setEditName]   = useState(false)
  const [name, setName]           = useState(columna.nombre)
  const [addingCard, setAddingCard] = useState(false)
  const [newTitle, setNewTitle]   = useState('')
  const [showMenu, setShowMenu]   = useState(false)
  const [, startTrans]            = useTransition()

  function saveName() {
    if (name.trim() && name !== columna.nombre) {
      onColumnUpdate(columna.id, { nombre: name.trim() })
    }
    setEditName(false)
  }

  function handleAddCard() {
    if (!newTitle.trim()) return
    startTrans(async () => {
      const tarea = await createTarea({ columnaId: columna.id, titulo: newTitle.trim() })
      setNewTitle(''); setAddingCard(false)
      onCardAdd(tarea)
    })
  }

  const limite = columna.limiteWip
  const overLimit = limite && columna.tareas.length >= limite

  return (
    <div
      className="flex-shrink-0 flex flex-col"
      style={{ width: 272 }}
      onDragOver={e => onDragOver(e, columna.id)}
      onDrop={() => onDrop(columna.id)}
    >
      {/* Column header */}
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-2 transition-colors ${isDragOver ? 'bg-white/[0.08]' : 'bg-white/[0.04]'}`}>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: columna.color }} />
          {editName ? (
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setName(columna.nombre); setEditName(false) } }}
              autoFocus
              className="flex-1 text-[13px] font-semibold text-white bg-transparent border-b border-[#5448EE] outline-none pb-0.5"
            />
          ) : (
            <button onClick={() => setEditName(true)} className="flex-1 text-[13px] font-semibold text-white text-left hover:text-[#8880F5] transition-colors cursor-text group" title="Click para renombrar">
              {columna.nombre}
              <span className="ml-1.5 opacity-0 group-hover:opacity-40 transition-opacity">✎</span>
            </button>
          )}
        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${overLimit ? 'bg-red-500/20 text-red-400' : 'bg-white/[0.06] text-white/35'}`}>
          {columna.tareas.length}{limite ? `/${limite}` : ''}
        </span>
        <div className="relative">
          <button onClick={() => setShowMenu(v => !v)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.08] transition-colors text-lg leading-none">
            ···
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 w-44 rounded-xl border border-white/[0.10] light:border-black/[0.10] bg-[#1A1830] light:bg-[#ffffff] shadow-xl z-20 overflow-hidden">
              {COLORES_COLUMNA.map(c => (
                <button key={c} onClick={() => { onColumnUpdate(columna.id, { color: c }); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-white/50 hover:bg-white/[0.06] hover:text-white transition-colors">
                  <span className="w-3 h-3 rounded-full" style={{ background: c }} />
                  {columna.color === c ? 'Color actual' : ''}
                </button>
              ))}
              <div className="border-t border-white/[0.06]" />
              <button onClick={() => { setEditName(true); setShowMenu(false) }}
                className="w-full text-left px-3 py-2.5 text-[11px] text-white/50 hover:bg-white/[0.06] hover:text-white transition-colors flex items-center gap-2">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Renombrar
              </button>
              <button onClick={() => { onColumnDelete(columna.id); setShowMenu(false) }}
                className="w-full text-left px-3 py-2.5 text-[11px] text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                Eliminar columna
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className={`flex-1 space-y-2 min-h-[60px] rounded-xl p-2 transition-colors ${isDragOver ? 'bg-[#5448EE]/10 border border-dashed border-[#5448EE]/40' : ''}`}>
        {columna.tareas.map(t => (
          <TareaCard key={t.id} tarea={t}
            onDragStart={onDragStart} onDragEnd={onDragEnd}
            onClick={onCardClick}
          />
        ))}
      </div>

      {/* Add card */}
      {addingCard ? (
        <div className="mt-2 space-y-2">
          <textarea value={newTitle} onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard() } if (e.key === 'Escape') { setAddingCard(false); setNewTitle('') } }}
            placeholder="Título de la tarea…" rows={2} autoFocus
            className="w-full px-3 py-2.5 text-[12px] rounded-xl border border-white/[0.09] light:border-black/[0.10] bg-white/[0.05] light:bg-[#F7F7FB] text-white placeholder:text-white/20 light:placeholder:text-black/20 focus:outline-none focus:border-[#5448EE]/50 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={handleAddCard} disabled={!newTitle.trim()}
              className="px-3 py-1.5 bg-[#5448EE] text-white btn-solid-text text-[11px] font-medium rounded-lg hover:bg-[#4438DE] disabled:opacity-40">
              Agregar
            </button>
            <button onClick={() => { setAddingCard(false); setNewTitle('') }}
              className="text-[11px] text-white/30 hover:text-white">
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAddingCard(true)}
          className="mt-2 w-full flex items-center gap-1.5 px-3 py-2 text-[11px] text-white/30 hover:text-white/70 hover:bg-white/[0.04] rounded-xl transition-colors">
          <span className="text-base leading-none">+</span> Agregar tarea
        </button>
      )}
    </div>
  )
}

// ── KanbanBoard (main) ────────────────────────────────────────────────────────
export default function KanbanBoard({ tablero: initial }: { tablero: Tablero }) {
  const [tablero, setTablero]       = useState(initial)
  const [dragCard, setDragCard]     = useState<Tarea | null>(null)
  const [overCol, setOverCol]       = useState<string | null>(null)
  const [modal, setModal]           = useState<Tarea | null>(null)
  const [addingCol, setAddingCol]   = useState(false)
  const [newColName, setNewColName] = useState('')
  const [newColColor, setNewColColor] = useState(COLORES_COLUMNA[0])
  const [, startTrans]              = useTransition()
  const router                      = useRouter()

  function handleDragStart(t: Tarea) { setDragCard(t) }
  function handleDragEnd()           { setDragCard(null); setOverCol(null) }
  function handleDragOver(e: React.DragEvent, colId: string) { e.preventDefault(); setOverCol(colId) }

  function handleDrop(destColId: string) {
    if (!dragCard) return
    const destOrden = tablero.columnas.find(c => c.id === destColId)?.tareas.length ?? 0

    // Optimistic update
    setTablero(tb => {
      const cols = tb.columnas.map(c => ({
        ...c,
        tareas: c.tareas.filter(t => t.id !== dragCard.id),
      }))
      return {
        ...tb,
        columnas: cols.map(c =>
          c.id === destColId
            ? { ...c, tareas: [...c.tareas, { ...dragCard, columnaId: destColId, orden: destOrden }] }
            : c
        ),
      }
    })

    startTrans(async () => {
      await moverTarea(dragCard.id, destColId, destOrden, tablero.id)
    })
    setDragCard(null); setOverCol(null)
  }

  function handleCardUpdate(updated: Tarea) {
    setTablero(tb => ({
      ...tb,
      columnas: tb.columnas.map(c => ({
        ...c,
        tareas: c.tareas.map(t => t.id === updated.id ? updated : t),
      })),
    }))
  }

  function handleCardDelete(id: string) {
    setTablero(tb => ({
      ...tb,
      columnas: tb.columnas.map(c => ({
        ...c,
        tareas: c.tareas.filter(t => t.id !== id),
      })),
    }))
  }

  function handleMove(tareaId: string, destColId: string) {
    const tarea = tablero.columnas.flatMap(c => c.tareas).find(t => t.id === tareaId)
    if (!tarea) return
    handleDrop(destColId)
    startTrans(async () => {
      const destOrden = tablero.columnas.find(c => c.id === destColId)?.tareas.length ?? 0
      await moverTarea(tareaId, destColId, destOrden, tablero.id)
    })
  }

  function handleColUpdate(id: string, data: { nombre?: string; color?: string }) {
    setTablero(tb => ({
      ...tb,
      columnas: tb.columnas.map(c => c.id === id ? { ...c, ...data } : c),
    }))
    startTrans(async () => { await updateColumna(id, data) })
  }

  function handleColDelete(id: string) {
    if (!confirm('¿Eliminar esta columna y todas sus tareas?')) return
    setTablero(tb => ({ ...tb, columnas: tb.columnas.filter(c => c.id !== id) }))
    startTrans(async () => { await deleteColumna(id, tablero.id) })
  }

  function handleCardAdd(tarea: Tarea) {
    setTablero(tb => ({
      ...tb,
      columnas: tb.columnas.map(c =>
        c.id === tarea.columnaId
          ? { ...c, tareas: [...c.tareas, tarea] }
          : c
      ),
    }))
  }

  function handleAddCol() {
    if (!newColName.trim()) return
    if (tablero.columnas.length >= 8) return
    startTrans(async () => {
      const col = await addColumna(tablero.id, newColName.trim(), newColColor)
      setTablero(tb => ({ ...tb, columnas: [...tb.columnas, col] }))
      setAddingCol(false); setNewColName(''); setNewColColor(COLORES_COLUMNA[0])
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Board header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
        <Link href="/dashboard/tareas" className="text-white/30 hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Link>
        <div className="w-3 h-3 rounded-full" style={{ background: tablero.color }} />
        <h1 className="font-display text-[20px] font-semibold text-white tracking-tight">{tablero.nombre}</h1>
        {tablero.descripcion && (
          <span className="text-[12px] text-white/30 hidden md:block">· {tablero.descripcion}</span>
        )}
        <div className="ml-auto flex items-center gap-2 text-[11px] text-white/30">
          <span>{tablero.columnas.reduce((a, c) => a + c.tareas.length, 0)} tareas</span>
        </div>
      </div>

      {/* Board canvas */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-6 h-full" style={{ minWidth: 'max-content', alignItems: 'flex-start' }}>
          {tablero.columnas.map(col => (
            <KanbanColumn
              key={col.id}
              columna={col}
              tableroId={tablero.id}
              isDragOver={overCol === col.id}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onCardClick={t => setModal(t)}
              onColumnUpdate={handleColUpdate}
              onColumnDelete={handleColDelete}
              onCardAdd={handleCardAdd}
            />
          ))}

          {/* Add column */}
          {tablero.columnas.length < 8 && (
            <div className="flex-shrink-0" style={{ width: 272 }}>
              {addingCol ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 space-y-2">
                  <input value={newColName} onChange={e => setNewColName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddCol(); if (e.key === 'Escape') setAddingCol(false) }}
                    placeholder="Nombre de la columna" autoFocus
                    className="w-full px-3 py-2 text-[12px] rounded-xl border border-white/[0.09] bg-white/[0.05] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/50"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {COLORES_COLUMNA.map(c => (
                      <button key={c} onClick={() => setNewColColor(c)}
                        className={`w-6 h-6 rounded-lg ${newColColor === c ? 'ring-2 ring-white' : ''}`}
                        style={{ background: c }} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddCol} disabled={!newColName.trim()}
                      className="px-3 py-1.5 bg-[#5448EE] text-white btn-solid-text text-[11px] font-medium rounded-lg hover:bg-[#4438DE] disabled:opacity-40">
                      Agregar
                    </button>
                    <button onClick={() => { setAddingCol(false); setNewColName('') }}
                      className="text-[11px] text-white/30 hover:text-white">
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingCol(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/[0.10] text-[12px] text-white/30 hover:text-white/60 hover:border-white/[0.20] transition-colors">
                  <span className="text-lg leading-none">+</span> Agregar columna
                  <span className="ml-auto text-[10px]">{tablero.columnas.length}/8</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <TareaModal
          tarea={modal}
          columnas={tablero.columnas}
          onClose={() => setModal(null)}
          onUpdate={t => { handleCardUpdate(t); setModal(null) }}
          onDelete={id => { handleCardDelete(id); setModal(null) }}
          onMove={handleMove}
        />
      )}
    </div>
  )
}
