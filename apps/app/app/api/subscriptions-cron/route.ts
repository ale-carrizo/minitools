import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSubscription } from '@/lib/mercadopago'

// Corre periódicamente (ver socios-cron para el mismo patrón de pinger externo).
// Un trial vencido sin tarjeta autorizada en MP pierde acceso: se marca EXPIRED
// y se suspende al usuario (mismo flag que ya bloquea el login).
export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Cron no configurado' }, { status: 500 })
  }
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const vencidas = await prisma.subscription.findMany({
    where: { status: 'TRIAL', trialEndsAt: { lt: new Date() } },
  })

  let suspendidos = 0
  let activados = 0

  for (const sub of vencidas) {
    // Si hay preapproval en MP, chequeamos el estado real antes de suspender
    // — un webhook perdido no debería tumbar a alguien que sí pagó.
    let autorizadaEnMp = false
    if (sub.mpPreapprovalId) {
      try {
        const mpSub = await getSubscription(sub.mpPreapprovalId)
        autorizadaEnMp = mpSub.status === 'authorized'
      } catch {
        // Si MP falla, no asumimos nada — no suspendemos por un error transitorio.
        continue
      }
    }

    if (autorizadaEnMp) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'ACTIVE', startDate: new Date() },
      })
      activados++
    } else {
      await prisma.$transaction([
        prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRED', endDate: new Date() },
        }),
        prisma.user.update({
          where: { id: sub.userId },
          data: { suspended: true, suspendedAt: new Date() },
        }),
      ])
      suspendidos++
    }
  }

  return NextResponse.json({ ok: true, revisadas: vencidas.length, suspendidos, activados })
}
