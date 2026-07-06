'use client'

import { useSyncExternalStore, useEffect, useCallback } from 'react'
import { loadCustomNames, saveCustomNames, getAppLabel, type CustomAppNames } from '@/lib/apps-config'

let shared: CustomAppNames = {}
const listeners = new Set<() => void>()
function subscribe(cb: () => void) { listeners.add(cb); return () => { listeners.delete(cb) } }
function getSnapshot(): CustomAppNames { return shared }
function getServerSnapshot(): CustomAppNames { return {} }

function notify() { listeners.forEach(fn => fn()) }

export function useAppNames() {
  const names = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    shared = loadCustomNames()
    notify()
  }, [])

  const setLabel = useCallback((slug: string, label: string) => {
    shared = { ...shared, [slug]: label.trim() ? label.trim() : '' }
    saveCustomNames(shared)
    notify()
  }, [])

  const resetLabel = useCallback((slug: string) => {
    const next = { ...shared }
    delete next[slug]
    shared = next
    saveCustomNames(shared)
    notify()
  }, [])

  const resetAll = useCallback(() => {
    shared = {}
    saveCustomNames(shared)
    notify()
  }, [])

  const getLabel = useCallback((slug: string) => getAppLabel(slug, shared), [])

  return { names, setLabel, resetLabel, resetAll, getLabel }
}
