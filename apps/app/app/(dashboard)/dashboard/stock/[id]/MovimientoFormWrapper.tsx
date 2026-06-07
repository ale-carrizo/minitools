'use client'

import { useRouter } from 'next/navigation'
import MovimientoForm from '@/app/components/stock/MovimientoForm'
import type { Producto } from '@/types/stock'

export default function MovimientoFormWrapper({ producto }: { producto: Producto }) {
  const router = useRouter()
  return (
    <MovimientoForm
      producto={producto}
      onDone={() => router.refresh()}
    />
  )
}
