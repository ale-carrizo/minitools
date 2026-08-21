import { NextRequest, NextResponse } from 'next/server'
import { marcarVencidosYGenerarCuotas } from '@/lib/actions/socios'
import { prisma } from '@/lib/prisma'
import { checkCronSecret } from '@/lib/cron-auth'

export async function GET(req: NextRequest) {
  const unauthorized = checkCronSecret(req)
  if (unauthorized) return unauthorized

  const users = await prisma.user.findMany({ select: { id: true } })

  let totalMarcados = 0
  for (const user of users) {
    const { marcados } = await marcarVencidosYGenerarCuotas(user.id)
    totalMarcados += marcados
  }

  return NextResponse.json({ ok: true, marcados: totalMarcados, usuarios: users.length })
}
