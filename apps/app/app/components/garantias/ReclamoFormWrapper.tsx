'use client'

import { useState } from 'react'
import ReclamoForm from './ReclamoForm'

export default function ReclamoFormWrapper({ productoId }: { productoId: string }) {
  const [show, setShow] = useState(false)

  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="w-full bg-[#5448EE] hover:bg-[#4438DE] text-white btn-solid-text rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors"
      >
        + Registrar reclamo
      </button>
    )
  }

  return <ReclamoForm productoId={productoId} onDone={() => setShow(false)} />
}
