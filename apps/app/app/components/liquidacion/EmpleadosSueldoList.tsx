'use client'

import { useState, useTransition } from 'react'
import { actualizarSueldo } from '@/lib/actions/liquidacion'
import { formatCurrency, type EmpleadoMin } from '@/types/liquidacion'

export default function EmpleadosSueldoList({ empleados }: { empleados: EmpleadoMin[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [salario, setSalario] = useState('')
  const [categoria, setCategoria] = useState('')
  const [isPending, startTransition] = useTransition()

  if (empleados.length === 0) {
    return (
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-10 text-center">
        <p className="text-white font-medium">No hay empleados. Crealos desde Control de Asistencia.</p>
      </div>
    )
  }

  function openEdit(empleado: EmpleadoMin) {
    setEditingId(empleado.id)
    setSalario(String(empleado.salarioBasico ?? 0))
    setCategoria(empleado.categoriaLaboral ?? '')
  }

  function save(empleadoId: string) {
    startTransition(async () => {
      await actualizarSueldo(empleadoId, {
        salarioBasico: Number(salario) || 0,
        categoriaLaboral: categoria,
      })
      setEditingId(null)
    })
  }

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-white/[0.03]">
          <tr className="text-[11px] uppercase tracking-wider text-white/30">
            <th className="px-4 py-3">Nombre Apellido</th>
            <th className="px-4 py-3">CUIL</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3">Salario Básico</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((empleado) => (
            <tr key={empleado.id} className="border-t border-white/[0.06] text-[13px] text-white/65 align-top">
              <td className="px-4 py-3">{`${empleado.apellido} ${empleado.nombre}`.trim() || empleado.nombre}</td>
              <td className="px-4 py-3">{empleado.cuil ?? '—'}</td>
              <td className="px-4 py-3">
                {editingId === empleado.id ? (
                  <input value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2 text-sm focus:outline-none focus:border-[#5448EE]/60" />
                ) : (empleado.categoriaLaboral ?? '—')}
              </td>
              <td className="px-4 py-3">
                {editingId === empleado.id ? (
                  <input type="number" value={salario} onChange={(e) => setSalario(e.target.value)} className="w-full max-w-[160px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2 text-sm focus:outline-none focus:border-[#5448EE]/60" />
                ) : (empleado.salarioBasico !== null ? formatCurrency(empleado.salarioBasico) : '—')}
              </td>
              <td className="px-4 py-3">
                {editingId === empleado.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => save(empleado.id)} disabled={isPending} className="bg-[#5448EE] hover:bg-[#4438DE] text-white btn-solid-text rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Guardar</button>
                    <button onClick={() => setEditingId(null)} className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Cancelar</button>
                  </div>
                ) : (
                  <button onClick={() => openEdit(empleado)} className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">Editar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
