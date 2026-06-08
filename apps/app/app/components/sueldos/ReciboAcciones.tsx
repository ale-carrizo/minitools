'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { duplicarRecibo, eliminarRecibo, emitirRecibo } from '@/lib/actions/recibo'
import type { Recibo } from '@/types/recibo'

export default function ReciboAcciones({ recibo }: { recibo: Recibo }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [duplicarOpen, setDuplicarOpen] = useState(false)
  const [nuevoPeriodo, setNuevoPeriodo] = useState(recibo.periodo)
  const [isPending, startTransition] = useTransition()

  function run(task: () => Promise<void>) {
    setError(null)
    startTransition(async () => {
      try {
        await task()
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'No se pudo completar la acción')
      }
    })
  }

  return (
    <div className="space-y-3">
      {recibo.estado === 'borrador' ? (
        <>
          <Link href={`/dashboard/sueldos/${recibo.id}/editar`} className="block border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-4 py-2.5 text-center text-[13px] font-medium">
            Editar
          </Link>
          <button type="button" onClick={() => run(() => emitirRecibo(recibo.id))} disabled={isPending} className="w-full bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium disabled:opacity-50">
            Emitir recibo
          </button>
          <button
            type="button"
            onClick={() => {
              if (!window.confirm('¿Eliminar este recibo?')) return
              run(() => eliminarRecibo(recibo.id))
            }}
            disabled={isPending}
            className="w-full border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl px-4 py-2.5 text-[13px] font-medium disabled:opacity-50"
          >
            Eliminar
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setDuplicarOpen((prev) => !prev)}
            className="w-full border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium"
          >
            Duplicar para nuevo período
          </button>
          {duplicarOpen ? (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3">
              <input
                type="month"
                value={nuevoPeriodo}
                onChange={(e) => setNuevoPeriodo(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
              />
              <button type="button" onClick={() => run(() => duplicarRecibo(recibo.id, nuevoPeriodo))} disabled={isPending} className="w-full bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium disabled:opacity-50">
                Confirmar duplicado
              </button>
            </div>
          ) : null}
        </>
      )}

      <a href={`/api/recibos/${recibo.id}/pdf`} target="_blank" className="block border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-4 py-2.5 text-center text-[13px] font-medium">
        Descargar PDF
      </a>

      {error ? <p className="text-[12px] text-red-400">{error}</p> : null}
    </div>
  )
}
