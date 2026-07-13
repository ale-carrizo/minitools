'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { registrarVenta } from '@/lib/actions/stock'
import type { Producto } from '@/types/stock'
import VentaItemsPicker, { nuevoVentaItem, buildVentaItemsPayload, type VentaItem } from './VentaItemsPicker'

export default function VentasClient({ productos }: { productos: Producto[] }) {
  const router = useRouter()
  const [items, setItems] = useState<VentaItem[]>([nuevoVentaItem()])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError('')
    setSuccess('')
    const payload = buildVentaItemsPayload(items)
    if (payload.length === 0) {
      setError('Agregá al menos un producto')
      return
    }
    startTransition(async () => {
      try {
        await registrarVenta(payload.map((item) => ({ productoId: item.producto_id, cantidad: item.cantidad })))
        setItems([nuevoVentaItem()])
        setSuccess('Venta registrada — stock actualizado')
        router.refresh()
        setTimeout(() => setSuccess(''), 3000)
      } catch (err: any) {
        setError(err.message ?? 'No se pudo registrar la venta')
      }
    })
  }

  if (productos.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] py-16 text-center">
        <p className="text-white/60 text-[14px] mb-1">Todavía no cargaste productos</p>
        <p className="text-white/30 text-[12px]">Agregá productos en Inventario para poder registrar ventas.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-[12px] text-white/40">Registrá una venta para descontar stock automáticamente. No queda registrada en Caja — si también cobraste, registrala ahí.</p>

      <VentaItemsPicker productos={productos} items={items} onChange={setItems} />

      {error && <p className="text-[12px] text-red-400">{error}</p>}
      {success && <p className="text-[12px] text-emerald-400">{success}</p>}

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full py-2.5 text-[13px] font-semibold text-white btn-solid-text bg-[#5448EE] rounded-xl hover:bg-[#4438DE] disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Registrando...' : 'Registrar venta'}
      </button>
    </div>
  )
}
