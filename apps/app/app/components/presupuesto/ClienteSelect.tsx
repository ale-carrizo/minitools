'use client'

import { useMemo, useState, useTransition } from 'react'
import { crearCliente } from '@/lib/actions/presupuesto'
import type { Cliente } from '@/types/presupuesto'

interface Props {
  clientes: Cliente[]
  value: string
  onChange: (value: string) => void
  onCreated: (cliente: Cliente) => void
}

export default function ClienteSelect({ clientes, value, onChange, onCreated }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [nuevo, setNuevo] = useState({
    nombre: '',
    empresa: '',
    email: '',
  })

  const filtrados = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return clientes
    return clientes.filter((cliente) =>
      [cliente.nombre, cliente.empresa, cliente.email]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(search)),
    )
  }, [clientes, query])

  function handleCreate() {
    setError(null)
    startTransition(async () => {
      try {
        const cliente = await crearCliente({
          nombre: nuevo.nombre,
          empresa: nuevo.empresa || undefined,
          email: nuevo.email || undefined,
        })
        onCreated(cliente)
        onChange(cliente.id)
        setNuevo({ nombre: '', empresa: '', email: '' })
        setOpen(false)
      } catch (err: any) {
        setError(err.message ?? 'No se pudo crear el cliente')
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cliente..."
          className="flex-1 rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-white/[0.09] px-3 py-2.5 text-[12px] font-medium text-[#8880F5] hover:border-[#5448EE]/50 hover:text-white"
        >
          Crear cliente
        </button>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white focus:border-[#5448EE]/60 focus:outline-none"
      >
        <option value="">Sin cliente</option>
        {filtrados.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.nombre}{cliente.empresa ? ` · ${cliente.empresa}` : ''}
          </option>
        ))}
      </select>

      {open ? (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={nuevo.nombre}
              onChange={(e) => setNuevo((prev) => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre *"
              className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
            />
            <input
              value={nuevo.empresa}
              onChange={(e) => setNuevo((prev) => ({ ...prev, empresa: e.target.value }))}
              placeholder="Empresa"
              className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
            />
            <input
              value={nuevo.email}
              onChange={(e) => setNuevo((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
              className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
            />
          </div>
          {error ? <p className="mt-3 text-[12px] text-red-400">{error}</p> : null}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/10 px-3 py-2 text-[12px] text-white/50 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isPending || !nuevo.nombre.trim()}
              className="rounded-xl bg-[#5448EE] px-3 py-2 text-[12px] font-medium text-white btn-solid-text hover:bg-[#4438DE] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Creando...' : 'Guardar cliente'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
