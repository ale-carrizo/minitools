import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { auth } from '@/auth'
import { PresupuestoPDF } from '@/app/components/presupuesto/PresupuestoPDF'
import { prisma } from '@/lib/prisma'
import { type Presupuesto } from '@/types/presupuesto'
import type { DocumentProps } from '@react-pdf/renderer'

function serializePresupuesto(raw: any): Presupuesto {
  return {
    id: raw.id,
    userId: raw.userId,
    clienteId: raw.clienteId ?? null,
    numero: raw.numero,
    titulo: raw.titulo,
    estado: raw.estado,
    fechaEmision: raw.fechaEmision,
    fechaVence: raw.fechaVence ?? null,
    moneda: raw.moneda,
    descuento: raw.descuento,
    iva: raw.iva,
    notas: raw.notas ?? null,
    notasCliente: raw.notasCliente ?? null,
    subtotal: raw.subtotal,
    totalFinal: raw.totalFinal,
    logoUrl: raw.logoUrl ?? null,
    pdfUrl: raw.pdfUrl ?? null,
    enviadoAt: raw.enviadoAt?.toISOString() ?? null,
    aceptadoAt: raw.aceptadoAt?.toISOString() ?? null,
    rechazadoAt: raw.rechazadoAt?.toISOString() ?? null,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    cliente: raw.cliente ? {
      id: raw.cliente.id,
      userId: raw.cliente.userId,
      nombre: raw.cliente.nombre,
      empresa: raw.cliente.empresa ?? null,
      email: raw.cliente.email ?? null,
      telefono: raw.cliente.telefono ?? null,
      direccion: raw.cliente.direccion ?? null,
      cuit: raw.cliente.cuit ?? null,
      notas: raw.cliente.notas ?? null,
      activo: raw.cliente.activo,
      createdAt: raw.cliente.createdAt.toISOString(),
      updatedAt: raw.cliente.updatedAt.toISOString(),
    } : null,
    items: raw.items.map((item: any) => ({
      id: item.id,
      presupuestoId: item.presupuestoId,
      orden: item.orden,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal,
    })),
  }
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id } = await params
  const presupuesto = await prisma.presupuesto.findFirst({
    where: { id, userId: session.user.id },
    include: {
      cliente: true,
      items: { orderBy: { orden: 'asc' } },
    },
  })

  if (!presupuesto) {
    return new Response('Not found', { status: 404 })
  }

  const buffer = await renderToBuffer(
    React.createElement(PresupuestoPDF, {
      presupuesto: serializePresupuesto(presupuesto),
      emisorNombre: session.user.name,
    }) as React.ReactElement<DocumentProps>,
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="presupuesto-${presupuesto.numero}.pdf"`,
    },
  })
}
