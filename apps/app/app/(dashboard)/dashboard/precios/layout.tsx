'use client'

import PreciosShell from '@/app/components/precios/PreciosShell'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PreciosShell>{children}</PreciosShell>
}
