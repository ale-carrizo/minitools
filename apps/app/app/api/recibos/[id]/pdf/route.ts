import { auth } from '@/auth'
import { getRecibo } from '@/lib/actions/recibos'
import { ReciboCobroPDF } from '@/app/components/recibos/ReciboCobroPDF'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const { id } = await params
  const recibo = await getRecibo(id)
  if (!recibo || recibo.userId !== session.user.id) {
    return new Response('Not found', { status: 404 })
  }

  const buffer = await renderToBuffer(
    React.createElement(ReciboCobroPDF, { recibo }) as React.ReactElement<DocumentProps>,
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="recibo-${recibo.numero}.pdf"`,
    },
  })
}
