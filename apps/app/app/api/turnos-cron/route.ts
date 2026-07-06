import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generarMensajeRecordatorio, offsetFecha } from '@/types/turno'

const db = prisma as any

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hoy = new Date().toISOString().slice(0, 10)
  const manana = offsetFecha(hoy, 1)

  const turnos = await db.turno.findMany({
    where: {
      fecha: manana,
      estado: { in: ['pendiente', 'confirmado'] },
      recordatorioEnviado: false,
      clienteTel: { not: null },
    },
    include: { servicio: true, empleado: true, user: { select: { id: true } } },
    orderBy: { horaInicio: 'asc' },
  })

  // En un entorno productivo este es el punto de integración con un proveedor de
  // WhatsApp (Twilio, Wati, Meta Cloud API, etc.). Por ahora generamos el mensaje
  // y marcamos el recordatorio como enviado para que no se vuelva a procesar.
  const enviados: { id: string; cliente: string; telefono: string; mensaje: string }[] = []

  for (const turno of turnos) {
    const mensaje = generarMensajeRecordatorio(turno)
    await db.turno.update({
      where: { id: turno.id },
      data: { recordatorioEnviado: true },
    })
    enviados.push({
      id: turno.id,
      cliente: turno.clienteNombre,
      telefono: turno.clienteTel,
      mensaje,
    })
  }

  return NextResponse.json({
    ok: true,
    fecha: manana,
    procesados: enviados.length,
    enviados,
  })
}
