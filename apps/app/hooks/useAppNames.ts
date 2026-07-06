'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadCustomNames, saveCustomNames, getAppLabel, type CustomAppNames } from '@/lib/apps-config'

export function useAppNames() {
  const [names, setNames] = useState<CustomAppNames>({})

  useEffect(() => {
    setNames(loadCustomNames())
  }, [])

  const setLabel = useCallback((slug: string, label: string) => {
    setNames(prev => {
      const next = { ...prev, [slug]: label.trim() ? label.trim() : '' }
      saveCustomNames(next)
      return next
    })
  }, [])

  const resetLabel = useCallback((slug: string) => {
    setNames(prev => {
      const next = { ...prev }
      delete next[slug]
      saveCustomNames(next)
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    setNames({})
    saveCustomNames({})
  }, [])

  const getLabel = useCallback((slug: string) => getAppLabel(slug, names), [names])

  return { names, setLabel, resetLabel, resetAll, getLabel }
}
