import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recalcUserStorage, enforceStorageLimits } from '@/lib/storage'

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Cron no configurado' }, { status: 500 })
  }
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
