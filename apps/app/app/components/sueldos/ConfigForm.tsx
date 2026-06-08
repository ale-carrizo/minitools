'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { guardarConfig } from '@/lib/actions/recibo'
import type { ReciboConfig } from '@/types/recibo'

export default function ConfigForm({ config }: { config: ReciboConfig | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    razonSocial: config?.razonSocial ?? '',
    cuit: config?.cuit ?? '',
    domicilio: config?.domicilio ?? '',
    localidad: config?.localidad ?? '',
    actividad: config?.actividad ?? '',
  })

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      try {
        await guardarConfig({
          razonSocial: form.razonSocial,
          cuit: form.cuit,
          domicilio: form.domicilio || undefined,
          localidad: form.localidad || undefined,
          actividad: form.actividad || undefined,
        })
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'No se pudo guardar la configuración')
      }
    })
  }

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 space-y-4">
      {!config ? (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-[13px] text-yellow-300">
          Completá los datos de tu empresa para que aparezcan en los recibos.
        </div>
      ) : null}

      <div>
        <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Razón social / Nombre</label>
        <input
          value={form.razonSocial}
          onChange={(e) => setForm((prev) => ({ ...prev, razonSocial: e.target.value }))}
          className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
        />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">CUIT</label>
        <input
          value={form.cuit}
          onChange={(e) => setForm((prev) => ({ ...prev, cuit: e.target.value }))}
          placeholder="20-12345678-9"
          className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
        />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Domicilio</label>
        <input
          value={form.domicilio}
          onChange={(e) => setForm((prev) => ({ ...prev, domicilio: e.target.value }))}
          className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
        />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Localidad</label>
        <input
          value={form.localidad}
          onChange={(e) => setForm((prev) => ({ ...prev, localidad: e.target.value }))}
          className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
        />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Actividad / Rubro</label>
        <input
          value={form.actividad}
          onChange={(e) => setForm((prev) => ({ ...prev, actividad: e.target.value }))}
          className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
        />
      </div>

      {error ? <p className="text-[12px] text-red-400">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || !form.razonSocial.trim() || !form.cuit.trim()}
        className="bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium disabled:opacity-50"
      >
        {isPending ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </div>
  )
}
