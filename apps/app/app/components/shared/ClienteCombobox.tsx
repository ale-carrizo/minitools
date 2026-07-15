'use client'

import { useEffect, useRef, useState } from 'react'
import type { ClienteSugerido } from '@/lib/actions/clientes-sugeridos'

interface Props {
  sugerencias: ClienteSugerido[]
  value: string
  onChange: (nombre: string) => void
  onSeleccionar?: (cliente: ClienteSugerido) => void
  placeholder?: string
  className?: string
}

export default function ClienteCombobox({ sugerencias, value, onChange, onSeleccionar, placeholder, className }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [])

  const q = value.trim().toLowerCase()
  const filtrados = (q ? sugerencias.filter((c) => c.nombre.toLowerCase().includes(q)) : sugerencias).slice(0, 8)

  const inputCls = className ?? 'w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60'

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? 'Nombre del cliente'}
        className={inputCls}
      />
      {open && filtrados.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-white/[0.10] light:border-black/[0.10] bg-[#1A1830] light:bg-[#ffffff] shadow-xl">
          {filtrados.map((c) => (
            <button
              key={`${c.origen}-${c.id}`}
              type="button"
              onClick={() => { onSeleccionar?.(c); onChange(c.nombre); setOpen(false) }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] text-white hover:bg-white/[0.06] transition-colors"
            >
              <span className="truncate">{c.nombre}</span>
              {c.telefono && <span className="flex-shrink-0 text-white/30 text-[11px]">{c.telefono}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
