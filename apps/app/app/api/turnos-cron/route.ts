import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { offsetFecha } from '@/types/turno'

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
    select: { id: true, clienteNombre: true, clienteTel: true },
  })

  for (const turno of turnos) {
    await db.turno.update({
      where: { id: turno.id },
      data: { recordatorioEnviado: true },
    })
  }

  return NextResponse.json({
    ok: true,
    fecha: manana,
    procesados: turnos.length,
  })
}
