import { NextRequest, NextResponse } from 'next/server'
import { secureCompare } from '@/lib/crypto'

/** Chequeo compartido por los endpoints /api/*-cron. Devuelve una respuesta
 * de error si el secreto falta o no matchea, o null si está todo bien. */
export function checkCronSecret(req: NextRequest): NextResponse | null {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Cron no configurado' }, { status: 500 })
  }
  const secret = req.nextUrl.searchParams.get('secret')
  if (!secret || !secureCompare(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
