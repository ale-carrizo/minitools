import { NextRequest, NextResponse } from 'next/server'
import { marcarVencidosYGenerarCuotas } from '@/lib/actions/socios'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const users = await prisma.user.findMany({ select: { id: true } })

  let totalMarcados = 0
  for (const user of users) {
    const { marcados } = await marcarVencidosYGenerarCuotas(user.id)
    totalMarcados += marcados
  }

  return NextResponse.json({ ok: true, marcados: totalMarcados, usuarios: users.length })
}
