'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { eliminarEmpleado } from '@/lib/actions/asistencia'
import type { Empleado } from '@/types/asistencia'
import EmpleadoForm from './EmpleadoForm'

export default function EmpleadosList({ empleados }: { empleados: Empleado[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [isPending, startTransition] = useTransition()

  if (empleados.length === 0 && editingId !== 'new') {
    return (
      <div className="py-20 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl">
        <p className="text-4xl mb-3">👥</p>
        <p className="text-white/50 text-sm mb-1">No hay empleados</p>
        <p className="text-white/30 text-xs mb-5">Agregá el primero para empezar</p>
        <button
          type="button"
          onClick={() => setEditingId('new')}
          className="inline-flex bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium"
        >
          + Agregar empleado
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setEditingId('new')}
          className="bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium"
        >
          + Agregar empleado
        </button>
      </div>

      {editingId === 'new' ? (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <EmpleadoForm onDone={() => setEditingId(null)} />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {empleados.map((empleado) => (
          <div key={empleado.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
            {editingId === empleado.id ? (
              <EmpleadoForm empleado={empleado} onDone={() => setEditingId(null)} />
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[18px] font-semibold text-white">{empleado.nombre}</h3>
                    <p className="text-[13px] text-white/40 mt-1">{empleado.cargo ?? 'Sin cargo'}</p>
                  </div>
                  <span
                    className="inline-block w-4 h-4 rounded-full flex-shrink-0 border border-white/10"
                    style={{ backgroundColor: empleado.color ?? '#5448EE' }}
                    title="Color en agenda"
                  />
                </div>
                <div className="space-y-2 text-[12px] text-white/45">
                  <p>Turno: {empleado.turnoInicio && empleado.turnoFin ? `${empleado.turnoInicio} → ${empleado.turnoFin}` : 'Sin turno configurado'}</p>
                  <p>Tolerancia: {empleado.tolerancia} min</p>
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(empleado.id)}
                    className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-4 py-2 text-[12px] font-medium"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      if (!window.confirm(`¿Eliminar a ${empleado.nombre}?`)) return
                      startTransition(async () => {
                        await eliminarEmpleado(empleado.id)
                        router.refresh()
                      })
                    }}
                    className="border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl px-4 py-2 text-[12px] font-medium disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
