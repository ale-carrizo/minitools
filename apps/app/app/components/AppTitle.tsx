'use client'

import { useAppNames } from '@/hooks/useAppNames'

interface Props {
  slug: string
  fallback: string
}

export default function AppTitle({ slug, fallback }: Props) {
  const { names } = useAppNames()
  return <>{names[slug]?.trim() || fallback}</>
}
