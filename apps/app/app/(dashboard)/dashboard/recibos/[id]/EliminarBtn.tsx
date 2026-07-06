'use client'

import { useRouter } from 'next/navigation'
import { eliminarRecibo } from '@/lib/actions/recibos'

export function EliminarBtn({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('¿Eliminar este recibo?')) return
    await eliminarRecibo(id)
    router.push('/dashboard/recibos')
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-xl border border-red-500/20 px-3 py-2 text-[12px] text-red-400 hover:bg-red-500/10 transition-colors"
    >
      Eliminar
    </button>
  )
}
