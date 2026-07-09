'use client'

import { useState } from 'react'
import type { Empleado, RegistroAsistencia } from '@/types/asistencia'
import { ESTADO_CONFIG, formatHoras } from '@/types/asistencia'
import EstadoBadge from './EstadoBadge'

export default function RegistroDiaRow({
  empleado,
  registro,
  onEntrada,
  onSalida,
  onAusencia,
  onEditar,
}: {
  empleado: Empleado
  registro: RegistroAsistencia | null
  onEntrada: (empleadoId: string, hora: string) => void
  onSalida: (registroId: string, hora: string) => void
  onAusencia: (empleadoId: string, estado: 'ausente' | 'libre') => void
  onEditar: (registroId: string, data: { horaEntrada?: string; horaSalida?: string }) => void
}) {
  const [editing, setEditing] = useState(false)
  const [entrada, setEntrada] = useState(registro?.horaEntrada ?? '')
  const [salida, setSalida] = useState(registro?.horaSalida ?? '')
  const cfg = registro ? ESTADO_CONFIG[registro.estado] : ESTADO_CONFIG.libre

  return (
    <div className={`grid gap-3 rounded-2xl border bg-white/[0.04] p-4 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr_0.8fr_auto] ${
      registro?.horaEntrada && !registro?.horaSalida ? 'border-emerald-500/30' : 'border-white/[0.08]'
    }`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
          <p className="text-[13px] font-medium text-white truncate">{empleado.nombre}</p>
        </div>
        <p className="text-[11px] text-white/30 mt-1 truncate">{empleado.cargo ?? 'Sin cargo'}</p>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1">Entrada</p>
        {editing || !registro?.horaEntrada ? (
          <input
            type="time"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            className="w-full px-2.5 py-2 text-[12px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
          />
        ) : (
          <p className="text-[13px] text-white/70">{registro.horaEntrada}</p>
        )}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1">Salida</p>
        {editing || (registro?.horaEntrada && !registro.horaSalida) ? (
          <input
            type="time"
            value={salida}
            onChange={(e) => setSalida(e.target.value)}
            className="w-full px-2.5 py-2 text-[12px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
          />
        ) : (
          <p className="text-[13px] text-white/70">{registro?.horaSalida ?? '—'}</p>
        )}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1">Horas</p>
        <p className="text-[13px] text-white/70">{registro ? formatHoras(registro.horasTrabajadas) : '—'}</p>
      </div>

      <div className="flex items-center">
        <EstadoBadge estado={registro?.estado ?? 'libre'} />
      </div>

      <div className="flex flex-wrap gap-2 justify-start md:justify-end">
        {!registro ? (
          <>
            <button type="button" onClick={() => entrada && onEntrada(empleado.id, entrada)} className="bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-3 py-2 text-[12px] font-medium">
              ▶ Entrada
            </button>
            <button type="button" onClick={() => onAusencia(empleado.id, 'ausente')} className="border border-red-500/20 text-red-400 rounded-xl px-3 py-2 text-[12px] font-medium">✕ Ausente</button>
            <button type="button" onClick={() => onAusencia(empleado.id, 'libre')} className="border border-white/10 text-white/50 rounded-xl px-3 py-2 text-[12px] font-medium">🏖 Franco</button>
          </>
        ) : registro.horaEntrada && !registro.horaSalida ? (
          <>
            <button type="button" onClick={() => salida && onSalida(registro.id, salida)} className="bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-3 py-2 text-[12px] font-medium">
              ⏹ Salida
            </button>
            <button type="button" onClick={() => setEditing((prev) => !prev)} className="border border-white/10 text-white/50 rounded-xl px-3 py-2 text-[12px] font-medium">
              ✏️
            </button>
            {editing ? (
              <button
                type="button"
                onClick={() => {
                  onEditar(registro.id, { horaEntrada: entrada || undefined, horaSalida: salida || undefined })
                  setEditing(false)
                }}
                className="border border-white/10 text-white/50 rounded-xl px-3 py-2 text-[12px] font-medium"
              >
                Guardar
              </button>
            ) : null}
          </>
        ) : (
          <>
            <button type="button" onClick={() => setEditing((prev) => !prev)} className="border border-white/10 text-white/50 rounded-xl px-3 py-2 text-[12px] font-medium">
              ✏️
            </button>
            {editing ? (
              <button
                type="button"
                onClick={() => {
                  onEditar(registro.id, { horaEntrada: entrada || undefined, horaSalida: salida || undefined })
                  setEditing(false)
                }}
                className="border border-white/10 text-white/50 rounded-xl px-3 py-2 text-[12px] font-medium"
              >
                Guardar
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
