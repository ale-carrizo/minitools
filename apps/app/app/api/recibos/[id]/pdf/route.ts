import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ReciboPDF } from '@/app/components/sueldos/ReciboPDF'
import type { Concepto, Recibo, ReciboConfig } from '@/types/recibo'

const db = prisma as any

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const { id } = await params

  const [raw, rawConfig] = await Promise.all([
    db.recibo.findFirst({ where: { id, userId: session.user.id } }),
    db.reciboConfig.findUnique({ where: { userId: session.user.id } }),
  ])

  if (!raw) return new Response('Not found', { status: 404 })

  const recibo: Recibo = {
    ...raw,
    empModalidad: raw.empModalidad as any,
    estado: raw.estado as any,
    empCuil: raw.empCuil ?? null,
    empCargo: raw.empCargo ?? null,
    empFechaIngreso: raw.empFechaIngreso ?? null,
    nroFactura: raw.nroFactura ?? null,
    notas: raw.notas ?? null,
    empleadoId: raw.empleadoId ?? null,
    conceptos: raw.conceptos as Concepto[],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  }

  const config: ReciboConfig | null = rawConfig ? {
    ...rawConfig,
    domicilio: rawConfig.domicilio ?? null,
    localidad: rawConfig.localidad ?? null,
    actividad: rawConfig.actividad ?? null,
    createdAt: rawConfig.createdAt.toISOString(),
    updatedAt: rawConfig.updatedAt.toISOString(),
  } : null

  const buffer = await renderToBuffer(
    React.createElement(ReciboPDF, { recibo, config }) as React.ReactElement<DocumentProps>,
  )

  const filename = `recibo-${recibo.empNombre.replace(/\s+/g, '-')}-${recibo.periodo}.pdf`

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
