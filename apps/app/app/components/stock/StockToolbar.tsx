'use client'

import { useState } from 'react'
import Link from 'next/link'
import ImportarProductosCard from './ImportarProductosCard'

export default function StockToolbar({ count }: { count: number }) {
  const [showImport, setShowImport] = useState(false)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] text-white/40">{count} producto{count !== 1 ? 's' : ''} en inventario</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowImport((v) => !v)}
            className={`px-4 py-2 text-[12px] font-medium rounded-xl border transition-colors ${
              showImport
                ? 'border-[#5448EE]/60 bg-[#5448EE]/15 text-[#8880F5]'
                : 'border-white/10 text-white/70 hover:border-white/20 hover:text-white'
            }`}
          >
            Importar Excel
          </button>
          <Link
            href="/dashboard/stock/nuevo"
            className="px-4 py-2 text-[12px] font-medium bg-[#5448EE] hover:bg-[#4438DE] text-[#ffffff] rounded-xl transition-colors"
          >
            + Agregar producto
          </Link>
        </div>
      </div>

      {showImport && (
        <div className="mb-1">
          <ImportarProductosCard />
        </div>
      )}
    </div>
  )
}
