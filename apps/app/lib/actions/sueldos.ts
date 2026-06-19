'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { ReciboConfig } from '@/types/recibo'

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')
  return session.user.id
}

export async function getReciboConfig(): Promise<ReciboConfig | null> {
  const userId = await getUserId()
  const raw = await prisma.reciboConfig.findUnique({ where: { userId } })
  if (!raw) return null
  return {
    id:          raw.id,
    userId:      raw.userId,
    razonSocial: raw.razonSocial,
    cuit:        raw.cuit,
    domicilio:   raw.domicilio,
    logoUrl:     raw.logoUrl ?? null,
  }
}

export async function saveReciboConfig(data: {
  razonSocial: string
  cuit?:       string
  domicilio?:  string
  logoUrl?:    string
}): Promise<ReciboConfig> {
  const userId = await getUserId()
  const raw = await prisma.reciboConfig.upsert({
    where:  { userId },
    update: { ...data, updatedAt: new Date() },
    create: { userId, razonSocial: data.razonSocial, cuit: data.cuit ?? null, domicilio: data.domicilio ?? null, logoUrl: data.logoUrl ?? null },
  })
  revalidatePath('/dashboard/sueldos')
  return { id: raw.id, userId: raw.userId, razonSocial: raw.razonSocial, cuit: raw.cuit, domicilio: raw.domicilio, logoUrl: raw.logoUrl ?? null }
}
