import { auth } from '@/auth'
import { getFactura, getFacturadorConfig } from '@/lib/actions/facturador'
import { FacturaPDF } from '@/app/components/facturador/FacturaPDF'
import { Arca, CbteTipo, DocTipo } from '@ramiidv/arca-facturacion'
import QRCode from 'qrcode'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import type { DocTipoCliente } from '@/types/facturador'

const DOC_TIPO_MAP: Record<DocTipoCliente, number> = {
  cuit: DocTipo.CUIT,
  dni: DocTipo.DNI,
  consumidor_final: DocTipo.CONSUMIDOR_FINAL,
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const { id } = await params
  const factura = await getFactura(id)
  const config = await getFacturadorConfig()

  if (!factura.cae) return new Response('Comprobante sin CAE', { status: 400 })

  const qrUrl = Arca.generateQRUrl({
    fecha: factura.fecha,
    cuit: Number(config.cuit),
    ptoVta: factura.puntoVenta,
    tipoCmp: factura.tipo === 'nc_c' ? CbteTipo.NOTA_CREDITO_C : CbteTipo.FACTURA_C,
    nroCmp: factura.numero,
    importe: factura.total,
    moneda: 'PES',
    ctz: 1,
    tipoDocRec: DOC_TIPO_MAP[factura.clienteDocTipo],
    nroDocRec: factura.clienteDocNro ? Number(factura.clienteDocNro.replace(/\D/g, '')) : 0,
    codAut: Number(factura.cae),
  })
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 200 })

  const buffer = await renderToBuffer(
    React.createElement(FacturaPDF, { factura, config, qrDataUrl }) as React.ReactElement<DocumentProps>,
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="factura-${factura.puntoVenta}-${factura.numero}.pdf"`,
    },
  })
}
