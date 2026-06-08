'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { eliminarGarantia } from '@/lib/actions/garantia'

export default function GarantiaActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!window.confirm('¿Eliminar esta garantía?')) return
    startTransition(async () => {
      await eliminarGarantia(id)
    })
  }

  return (
    <div className="space-y-2">
      <Link href={`/dashboard/garantias/${id}/editar`} className="block text-center border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
        Editar
      </Link>
      <button type="button" onClick={handleDelete} disabled={isPending} className="w-full border border-red-500/20 hover:border-red-500/35 text-red-300 hover:text-red-200 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors disabled:opacity-70">
        {isPending ? 'Eliminando...' : 'Eliminar'}
      </button>
    </div>
  )
}
