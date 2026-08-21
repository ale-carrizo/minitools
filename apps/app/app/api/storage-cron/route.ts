import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recalcUserStorage, enforceStorageLimits } from '@/lib/storage'
import { checkCronSecret } from '@/lib/cron-auth'

export async function GET(req: NextRequest) {
  const unauthorized = checkCronSecret(req)
  if (unauthorized) return unauthorized

  const users = await prisma.user.findMany({ select: { id: true } })
  for (const user of users) {
    await recalcUserStorage(user.id)
  }

  const enforced = await enforceStorageLimits()

  return NextResponse.json({
    ok: true,
    usuariosRevisados: users.length,
    usuariosConLimpieza: enforced.length,
    detalle: enforced,
  })
}
