'use client'

import { useState, useRef } from 'react'
import { crearEmpleado } from '@/lib/actions/asistencia'
import { type EmpleadoTurno } from '@/types/turno'
import { PALETA_EMPLEADO } from '@/types/asistencia'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (empleado: EmpleadoTurno) => void
  empleadosActuales: string[]
}

export default function EmpleadoRapidoModal({ open, onClose, onCreated, empleadosActuales }: Props) {
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = nombre.trim()
    if (!trimmed) {
      setError('Ingresá un nombre')
      return
    }

    const existe = empleadosActuales.some(
      (n) => n.toLowerCase() === trimmed.toLowerCase()
    )
    if (existe) {
      setError('Ya existe un empleado con ese nombre')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const created = await crearEmpleado({ nombre: trimmed, color: color ?? undefined })
      onCreated({ id: created.id, userId: created.userId, nombre: created.nombre, apellido: created.apellido, color: created.color })
      setNombre('')
      setColor(null)
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'No se pudo crear el empleado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.10] light:border-black/[0.10] bg-[#13122A] light:bg-[#ffffff] shadow-2xl shadow-black/50 overflow-hidden animate-[fade-up_0.2s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="px-5 py-4 border-b border-white/[0.07]">
          <p className="text-[14px] font-semibold text-white">Nuevo empleado</p>
          <p className="text-[10px] text-white/30 mt-0.5">Agregalo rápido sin salir del turno</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="text-[12px] text-white/50">Nombre</label>
            <input
              autoFocus
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setError(null) }}
              placeholder="Nombre del empleado"
              className="w-full mt-1 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
            />
          </div>

          <div>
            <label className="text-[12px] text-white/50">Color</label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {PALETA_EMPLEADO.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {error ? (
            <p className="text-[12px] text-red-400">{error}</p>
          ) : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.09] text-[12px] text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !nombre.trim()}
              className="flex-[2] py-2.5 rounded-xl text-[12px] font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6E63FF, #5448EE)' }}
            >
              {loading ? 'Guardando...' : 'Crear empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
