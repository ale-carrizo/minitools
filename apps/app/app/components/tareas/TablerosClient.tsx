'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createTablero, deleteTablero } from '@/lib/actions/tareas'
import { COLORES_COLUMNA } from '@/types/tareas'
import type { Tablero } from '@/types/tareas'

const PLANTILLAS = [
  {
    nombre: 'Proyecto estándar',
    columnas: [
      { nombre: 'Por hacer',  color: '#6B7280' },
      { nombre: 'En progreso', color: '#F59E0B' },
      { nombre: 'Revisión',   color: '#3B82F6' },
      { nombre: 'Hecho',      color: '#059669' },
    ],
  },
  {
    nombre: 'Agile / Sprint',
    columnas: [
      { nombre: 'Backlog',     color: '#6B7280' },
      { nombre: 'Sprint',      color: '#5448EE' },
      { nombre: 'En curso',    color: '#F59E0B' },
      { nombre: 'Testing',     color: '#3B82F6' },
      { nombre: 'Completado',  color: '#059669' },
    ],
  },
  {
    nombre: 'Pipeline de ventas',
    columnas: [
      { nombre: 'Prospecto',   color: '#6B7280' },
      { nombre: 'Contactado',  color: '#3B82F6' },
      { nombre: 'Propuesta',   color: '#F59E0B' },
      { nombre: 'Negociación', color: '#F97316' },
      { nombre: 'Ganado',      color: '#059669' },
      { nombre: 'Perdido',     color: '#EF4444' },
    ],
  },
  {
    nombre: 'Personalizado',
    columnas: [] as { nombre: string; color: string }[],
  },
]

const BOARD_COLORS = ['#5448EE', '#059669', '#D97706', '#DC2626', '#7C3AED', '#06B6D4', '#DB2777', '#374151']

export default function TablerosClient({ tableros: initial }: { tableros: Tablero[] }) {
  const [tableros, setTableros]     = useState(initial)
  const [creating, setCreating]     = useState(false)
  const [plantilla, setPlantilla]   = useState(0)
  const [boardName, setBoardName]   = useState('')
  const [boardDesc, setBoardDesc]   = useState('')
  const [boardColor, setBoardColor] = useState(BOARD_COLORS[0])
  const [columnas, setColumnas]     = useState<{ nombre: string; color: string }[]>(PLANTILLAS[0].columnas)
  const [, startTrans]              = useTransition()
  const router                      = useRouter()

  function selectPlantilla(i: number) {
    setPlantilla(i)
    if (PLANTILLAS[i].columnas.length > 0) {
      setColumnas([...PLANTILLAS[i].columnas])
    } else {
      setColumnas([{ nombre: '', color: COLORES_COLUMNA[0] }])
    }
  }

  function addCol() {
    if (columnas.length >= 8) return
    setColumnas(c => [...c, { nombre: '', color: COLORES_COLUMNA[c.length % COLORES_COLUMNA.length] }])
  }

  function setColNombre(i: number, v: string) {
    setColumnas(c => c.map((col, idx) => idx === i ? { ...col, nombre: v } : col))
  }

  function setColColor(i: number, v: string) {
    setColumnas(c => c.map((col, idx) => idx === i ? { ...col, color: v } : col))
  }

  function removeCol(i: number) {
    setColumnas(c => c.filter((_, idx) => idx !== i))
  }

  function handleCreate() {
    const cols = columnas.filter(c => c.nombre.trim())
    if (!boardName.trim() || cols.length === 0) return
    startTrans(async () => {
      const t = await createTablero({
        nombre:      boardName.trim(),
        descripcion: boardDesc.trim() || undefined,
        color:       boardColor,
        columnas:    cols,
      })
      router.push(`/dashboard/tareas/${t.id}`)
    })
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este tablero y todas sus tareas?')) return
    setTableros(ts => ts.filter(t => t.id !== id))
    startTrans(async () => { await deleteTablero(id) })
  }

  if (creating) {
    return (
      <div className="max-w-2xl space-y-5">
        <button onClick={() => setCreating(false)} className="flex items-center gap-1.5 text-[12px] text-[#8880F5] hover:text-white transition-colors mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Volver
        </button>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <span className="text-[11px] font-semibold text-white/25 uppercase tracking-wider">Nuevo tablero</span>
          </div>
          <div className="p-5 space-y-4">
            {/* Nombre + color */}
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[11px] text-white/40 mb-1.5">Nombre del tablero *</label>
                <input value={boardName} onChange={e => setBoardName(e.target.value)}
                  placeholder="Mi proyecto…"
                  className="w-full px-3 py-2.5 text-[12px] rounded-xl border border-white/[0.09] bg-white/[0.05] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
              </div>
              <div>
                <label className="block text-[11px] text-white/40 mb-1.5">Color</label>
                <div className="flex gap-1.5">
                  {BOARD_COLORS.map(c => (
                    <button key={c} onClick={() => setBoardColor(c)}
                      className={`w-7 h-7 rounded-lg ${boardColor === c ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'} transition-all`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-white/40 mb-1.5">Descripción (opcional)</label>
              <input value={boardDesc} onChange={e => setBoardDesc(e.target.value)}
                placeholder="Descripción del proyecto…"
                className="w-full px-3 py-2.5 text-[12px] rounded-xl border border-white/[0.09] bg-white/[0.05] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
            </div>

            {/* Plantillas */}
            <div>
              <label className="block text-[11px] text-white/40 mb-2">Plantilla</label>
              <div className="grid grid-cols-2 gap-2">
                {PLANTILLAS.map((p, i) => (
                  <button key={i} onClick={() => selectPlantilla(i)}
                    className={`py-2.5 px-3 rounded-xl border text-[11px] font-medium text-left transition-all ${plantilla === i ? 'border-[#5448EE]/60 bg-[#5448EE]/15 text-[#8880F5]' : 'border-white/[0.08] text-white/40 bg-white/[0.03] hover:text-white/70'}`}>
                    {p.nombre}
                    {p.columnas.length > 0 && <span className="ml-1 text-white/30 font-normal">({p.columnas.length} col.)</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Columnas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] text-white/40">Columnas <span className="text-white/20">({columnas.length}/8 máx.)</span></label>
              </div>
              <div className="space-y-2">
                {columnas.map((col, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {COLORES_COLUMNA.map(c => (
                        <button key={c} onClick={() => setColColor(i, c)}
                          className={`w-5 h-5 rounded-md ${col.color === c ? 'ring-2 ring-white' : ''} transition-all`}
                          style={{ background: c }} />
                      ))}
                    </div>
                    <input value={col.nombre} onChange={e => setColNombre(i, e.target.value)}
                      placeholder={`Columna ${i + 1}`}
                      className="flex-1 px-3 py-2 text-[12px] rounded-xl border border-white/[0.09] bg-white/[0.05] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
                    {columnas.length > 1 && (
                      <button onClick={() => removeCol(i)}
                        className="w-7 h-7 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center text-sm transition-colors">
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {columnas.length < 8 && (
                <button onClick={addCol} className="mt-2 text-[11px] text-[#8880F5] hover:text-white transition-colors">
                  + Agregar columna
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setCreating(false)}
            className="flex-1 py-3 border border-white/10 rounded-xl text-[12px] text-white/40 hover:text-white transition-colors">
            Cancelar
          </button>
          <button onClick={handleCreate} disabled={!boardName.trim() || columnas.filter(c => c.nombre.trim()).length === 0}
            className="flex-[2] py-3 bg-[#5448EE] text-white btn-solid-text rounded-xl text-[12px] font-medium hover:bg-[#4438DE] disabled:opacity-40 transition-colors">
            Crear tablero
          </button>
        </div>
      </div>
    )
  }

  // ── Lista de tableros ─────────────────────────────────────────────────────
  return (
    <div>
      {tableros.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm font-medium text-white/70 mb-1">No tenés tableros todavía</p>
          <p className="text-xs text-white/30 mb-6">Creá tu primer tablero kanban para organizar tus tareas</p>
          <button onClick={() => setCreating(true)}
            className="inline-block rounded-xl bg-[#5448EE] px-5 py-2.5 text-[12px] font-medium text-white btn-solid-text hover:bg-[#4438DE]">
            + Crear tablero
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-[13px] text-white/40">{tableros.length} tablero{tableros.length !== 1 ? 's' : ''}</p>
            <button onClick={() => setCreating(true)}
              className="px-4 py-2 rounded-xl bg-[#5448EE] text-white btn-solid-text text-[12px] font-medium hover:bg-[#4438DE] transition-colors">
              + Nuevo tablero
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tableros.map(t => {
              const total = t.columnas.reduce((a, c) => a + c.tareas.length, 0)
              return (
                <div key={t.id} className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] overflow-hidden transition-colors">
                  <div className="h-1.5 w-full" style={{ background: t.color }} />
                  <div className="p-4">
                    <p className="text-[14px] font-semibold text-white mb-1 truncate">{t.nombre}</p>
                    {t.descripcion && <p className="text-[11px] text-white/35 mb-3 truncate">{t.descripcion}</p>}
                    <div className="flex items-center gap-3 text-[11px] text-white/30">
                      <span>{t.columnas.length} columnas</span>
                      <span>·</span>
                      <span>{total} tareas</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <a href={`/dashboard/tareas/${t.id}`}
                        className="flex-1 text-center py-2 rounded-xl bg-[#5448EE]/15 text-[#8880F5] text-[11px] font-medium hover:bg-[#5448EE]/25 transition-colors">
                        Abrir
                      </a>
                      <button onClick={() => handleDelete(t.id)}
                        className="px-3 py-2 rounded-xl text-white/25 hover:text-red-400 hover:bg-red-500/10 text-[11px] transition-colors">
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
