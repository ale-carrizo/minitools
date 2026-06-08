'use client'

import { useCallback, useEffect, useState } from 'react'
import type { HistorialItem } from '@/types/precios'

const KEY = 'zimple_precios_historial'
const MAX = 20

export function useHistorial() {
  const [items, setItems] = useState<HistorialItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  const agregar = useCallback((item: Omit<HistorialItem, 'id' | 'fecha'>) => {
    setItems((prev) => {
      const next = [
        { ...item, id: crypto.randomUUID(), fecha: new Date().toISOString() },
        ...prev,
      ].slice(0, MAX)

      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {}

      return next
    })
  }, [])

  const limpiar = useCallback(() => {
    setItems([])
    try {
      localStorage.removeItem(KEY)
    } catch {}
  }, [])

  return { items, agregar, limpiar }
}
