'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearEmpleado, editarEmpleado } from '@/lib/actions/asistencia'
import { PALETA_EMPLEADO } from '@/types/asistencia'
import type { Empleado } from '@/types/asistencia'

export default function EmpleadoForm({
  empleado,
  onDone,
}: {
  empleado?: Empleado
  onDone?: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nombre: empleado?.nombre ?? '',
    cargo: empleado?.cargo ?? '',
    turnoInicio: empleado?.turnoInicio ?? '',
    turnoFin: empleado?.turnoFin ?? '',
    tolerancia: empleado?.tolerancia ?? 15,
    color: empleado?.color ?? PALETA_EMPLEADO[0],
  })

  function submit() {
    setError(null)
    startTransition(async () => {
      try {
        const payload = {
          nombre: form.nombre,
          cargo: form.cargo || undefined,
          turnoInicio: form.turnoInicio || undefined,
          turnoFin: form.turnoFin || undefined,
          tolerancia: Number(form.tolerancia),
          color: form.color,
        }

        if (empleado) await editarEmpleado(empleado.id, payload)
        else await crearEmpleado(payload)

        router.refresh()
        onDone?.()
      } catch (err: any) {
        setError(err.message ?? 'No se pudo guardar el empleado')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
            className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Cargo</label>
          <input
            value={form.cargo}
            onChange={(e) => setForm((prev) => ({ ...prev, cargo: e.target.value }))}
            placeholder="Ej: Vendedor, Cajero, Encargado"
            className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Turno inicio</label>
          <input
            type="time"
            value={form.turnoInicio}
            onChange={(e) => setForm((prev) => ({ ...prev, turnoInicio: e.target.value }))}
            className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Turno fin</label>
          <input
            type="time"
            value={form.turnoFin}
            onChange={(e) => setForm((prev) => ({ ...prev, turnoFin: e.target.value }))}
            className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Tolerancia</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="60"
              value={form.tolerancia}
              onChange={(e) => setForm((prev) => ({ ...prev, tolerancia: Number(e.target.value) }))}
              className="w-32 px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
            />
            <span className="text-[12px] text-white/40">minutos</span>
          </div>
          <p className="text-[10px] text-white/25 mt-1">Opcional — se usa para detectar tardanzas automáticamente</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Color</label>
          <div className="flex flex-wrap gap-2">
            {PALETA_EMPLEADO.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, color }))}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  form.color === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-white/25 mt-1">Se usa para distinguir turnos en el calendario</p>
        </div>
      </div>

      {error ? <p className="text-[12px] text-red-400">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onDone?.()}
          className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !form.nombre.trim()}
          className="bg-[#5448EE] hover:bg-[#4438DE] text-white btn-solid-text rounded-xl px-4 py-2.5 text-[13px] font-medium disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
