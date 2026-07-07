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

  const users = await prisma.user.findMany({ select: { id: true } })

  let totalProcesados = 0

  for (const user of users) {
    const turnos = await db.turno.findMany({
      where: {
        userId: user.id,
        fecha: manana,
        estado: { in: ['pendiente', 'confirmado'] },
        recordatorioEnviado: false,
        clienteTel: { not: null },
      },
      include: { servicio: true, empleado: true },
      orderBy: { horaInicio: 'asc' },
    })

    if (turnos.length === 0) continue

    // Punto de integración con proveedor de WhatsApp (Twilio, Wati, Meta Cloud API):
    // por cada turno de ESTE usuario, generar el mensaje y enviarlo con las
    // credenciales/número de WhatsApp que correspondan a su negocio antes de
    // marcarlo como enviado.
    for (const turno of turnos) {
      generarMensajeRecordatorio(turno)
    }

    await db.turno.updateMany({
      where: { userId: user.id, id: { in: turnos.map((t: { id: string }) => t.id) } },
      data: { recordatorioEnviado: true },
    })

    totalProcesados += turnos.length
  }

  return NextResponse.json({
    ok: true,
    fecha: manana,
    usuarios: users.length,
    procesados: totalProcesados,
  })
}
