import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Usado por Railway para saber si el contenedor nuevo ya está listo antes
// de apagar el viejo (deploy sin downtime). Sin esto, Railway apaga el
// contenedor anterior y recién después arranca el nuevo, dejando una
// ventana real sin nada respondiendo.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[health] DB check failed', error)
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
