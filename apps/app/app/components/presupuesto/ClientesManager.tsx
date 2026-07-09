'use client'

import { useState, useTransition } from 'react'
import { crearCliente, editarCliente, eliminarCliente } from '@/lib/actions/presupuesto'
import type { Cliente } from '@/types/presupuesto'

export default function ClientesManager({ initialClientes }: { initialClientes: Cliente[] }) {
  const [clientes, setClientes] = useState(initialClientes)
  const [draft, setDraft] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function saveCliente() {
    setError(null)
    startTransition(async () => {
      try {
        if (editingId) {
          const updated = await editarCliente(editingId, draft)
          setClientes((prev) => prev.map((cliente) => cliente.id === editingId ? updated : cliente))
        } else {
          const created = await crearCliente(draft)
          setClientes((prev) => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)))
        }

        setDraft({ nombre: '', empresa: '', email: '', telefono: '' })
        setEditingId(null)
      } catch (err: any) {
        setError(err.message ?? 'No se pudo guardar el cliente')
      }
    })
  }

  function startEdit(cliente: Cliente) {
    setEditingId(cliente.id)
    setDraft({
      nombre: cliente.nombre,
      empresa: cliente.empresa ?? '',
      email: cliente.email ?? '',
      telefono: cliente.telefono ?? '',
    })
  }

  function handleDelete(id: string) {
    setError(null)
    startTransition(async () => {
      try {
        await eliminarCliente(id)
        setClientes((prev) => prev.filter((cliente) => cliente.id !== id))
      } catch (err: any) {
        setError(err.message ?? 'No se pudo eliminar el cliente')
      }
    })
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">
          {editingId ? 'Editar cliente' : 'Nuevo cliente'}
        </p>
        <div className="space-y-3">
          {(['nombre', 'empresa', 'email', 'telefono'] as const).map((field) => (
            <input
              key={field}
              value={draft[field]}
              onChange={(e) => setDraft((prev) => ({ ...prev, [field]: e.target.value }))}
              placeholder={field === 'nombre' ? 'Nombre *' : field[0].toUpperCase() + field.slice(1)}
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
            />
          ))}
        </div>
        {error ? <p className="mt-3 text-[12px] text-red-400">{error}</p> : null}
        <div className="mt-4 flex gap-2">
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setDraft({ nombre: '', empresa: '', email: '', telefono: '' })
              }}
              className="rounded-xl border border-white/10 px-3 py-2 text-[12px] text-white/50 hover:text-white"
            >
              Cancelar
            </button>
          ) : null}
          <button
            type="button"
            onClick={saveCliente}
            disabled={isPending || !draft.nombre.trim()}
            className="flex-1 rounded-xl bg-[#5448EE] px-3 py-2 text-[12px] font-medium text-white hover:bg-[#4438DE] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear cliente'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_auto] border-b border-white/[0.06] px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/25">
          <span>Nombre</span>
          <span>Empresa</span>
          <span>Email</span>
          <span />
        </div>
        {clientes.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-white/30">No hay clientes cargados.</div>
        ) : (
          clientes.map((cliente) => (
            <div key={cliente.id} className="grid grid-cols-[1.2fr_1fr_1fr_auto] items-center border-b border-white/[0.04] px-5 py-4 text-[13px]">
              <div>
                <p className="font-medium text-white">{cliente.nombre}</p>
                {cliente.telefono ? <p className="text-[11px] text-white/30">{cliente.telefono}</p> : null}
              </div>
              <span className="text-white/45">{cliente.empresa ?? '—'}</span>
              <span className="text-white/45">{cliente.email ?? '—'}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => startEdit(cliente)} className="text-[12px] text-[#8880F5] hover:text-white">Editar</button>
                <button type="button" onClick={() => handleDelete(cliente.id)} className="text-[12px] text-red-400 hover:text-red-300">Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
