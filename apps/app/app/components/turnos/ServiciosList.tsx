'use client'

import { useState, useTransition } from 'react'
import { eliminarServicio } from '@/lib/actions/turno'
import { formatCurrency, type TurnoServicio } from '@/types/turno'
import ServicioForm from './ServicioForm'

export default function ServiciosList({ servicios }: { servicios: TurnoServicio[] }) {
  const [showNew, setShowNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar este servicio?')) return
    startTransition(async () => {
      await eliminarServicio(id)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-semibold text-[16px]">Servicios</h2>
          <p className="text-white/35 text-[13px] mt-1">Definí los servicios que ofrecés para cargar turnos más rápido.</p>
        </div>
        <button onClick={() => setShowNew((prev) => !prev)} className="bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
          {showNew ? 'Cerrar' : '+ Agregar servicio'}
        </button>
      </div>

      {showNew ? <ServicioForm onDone={() => setShowNew(false)} /> : null}

      {servicios.length === 0 ? (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-10 text-center">
          <p className="text-3xl mb-3">✂️</p>
          <p className="text-white font-medium">No hay servicios configurados</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {servicios.map((servicio) => (
            <div key={servicio.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
              {editingId === servicio.id ? (
                <ServicioForm servicio={servicio} onDone={() => setEditingId(null)} />
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: servicio.color }} />
                        <p className="text-white font-medium">{servicio.nombre}</p>
                      </div>
                      <p className="text-[13px] text-white/40 mt-2">Duración: {servicio.duracion} minutos</p>
                      <p className="text-[13px] text-white/40 mt-1">Precio: {servicio.precio > 0 ? formatCurrency(servicio.precio) : 'Gratis'}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setEditingId(servicio.id)} className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(servicio.id)} disabled={isPending} className="border border-red-500/20 hover:border-red-500/35 text-red-300 hover:text-red-200 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors disabled:opacity-70">
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
