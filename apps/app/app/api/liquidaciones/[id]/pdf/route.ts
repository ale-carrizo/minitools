import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import { auth } from '@/auth'
import { getLiquidacion } from '@/lib/actions/liquidacion'
import { LiquidacionPDF } from '@/app/components/liquidacion/LiquidacionPDF'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const { id } = await params
  const liquidacion = await getLiquidacion(id)
  if (!liquidacion || liquidacion.userId !== session.user.id) {
    return new Response('Not found', { status: 404 })
  }

  const buffer = await renderToBuffer(
    React.createElement(LiquidacionPDF, { liquidacion }) as React.ReactElement<DocumentProps>,
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="liquidacion-${liquidacion.periodo}.pdf"`,
    },
  })
}
