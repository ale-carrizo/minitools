'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { recalcUserStorage, estimateFileBytes } from '@/lib/storage'
import type { ReciboCobro, ReciboCobroConfig } from '@/types/recibos'

const db = prisma as any

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user.id
}

const MAX_LOGO_BYTES = 3 * 1024 * 1024 // 3MB
const TIPOS_LOGO_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp']

function verificarLogoBase64(dataUrl: string): boolean {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return false
  const mime = match[1]
  if (!TIPOS_LOGO_PERMITIDOS.includes(mime)) return false
  const buffer = Buffer.from(match[2].slice(0, 24), 'base64')
  const head = buffer.subarray(0, 12)
  switch (mime) {
    case 'image/jpeg':
      return head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF
    case 'image/png':
      return head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47 &&
             head[4] === 0x0D && head[5] === 0x0A && head[6] === 0x1A && head[7] === 0x0A
    case 'image/webp':
      return head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
             head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50
    default:
      return false
  }
}

export async function getReciboCobroConfig(): Promise<ReciboCobroConfig | null> {
  const userId = await getUserId()
  const row = await db.reciboCobroConfig.findUnique({ where: { userId } })
  if (!row) return null
  return {
    id: row.id,
    userId: row.userId,
    emisorNombre: row.emisorNombre ?? null,
    emisorDoc: row.emisorDoc ?? null,
    emisorDireccion: row.emisorDireccion ?? null,
    logoUrl: row.logoUrl ?? null,
  }
}

export async function guardarReciboCobroConfig(data: {
  emisorNombre?: string
  emisorDoc?: string
  emisorDireccion?: string
  logoUrl?: string
}): Promise<ReciboCobroConfig> {
  const userId = await getUserId()

  if (data.logoUrl && data.logoUrl.trim()) {
    if (estimateFileBytes(data.logoUrl) > MAX_LOGO_BYTES) throw new Error('El logo no puede superar los 3MB')
    if (!verificarLogoBase64(data.logoUrl)) throw new Error('El logo no es una imagen válida (PNG, JPG o WebP)')
  }

  const payload = {
    emisorNombre: data.emisorNombre?.trim() || null,
    emisorDoc: data.emisorDoc?.trim() || null,
    emisorDireccion: data.emisorDireccion?.trim() || null,
    logoUrl: data.logoUrl?.trim() || null,
  }

  const row = await db.reciboCobroConfig.upsert({
    where: { userId },
    update: payload,
    create: { userId, ...payload },
  })

  await recalcUserStorage(userId)
  revalidatePath('/dashboard/recibos')
  revalidatePath('/dashboard/recibos/nuevo')

  return {
    id: row.id,
    userId: row.userId,
    emisorNombre: row.emisorNombre ?? null,
    emisorDoc: row.emisorDoc ?? null,
    emisorDireccion: row.emisorDireccion ?? null,
    logoUrl: row.logoUrl ?? null,
  }
}

export async function getRecibos(): Promise<ReciboCobro[]> {
  const userId = await getUserId()
  const rows = await db.reciboCobro.findMany({
    where: { userId },
    orderBy: [{ fecha: 'desc' }, { numero: 'desc' }],
  })
  return rows.map(toRecibo)
}

export async function getRecibo(id: string): Promise<ReciboCobro | null> {
  const userId = await getUserId()
  const row = await db.reciboCobro.findFirst({ where: { id, userId } })
  if (!row) return null
  return toRecibo(row)
}

export async function crearRecibo(data: {
  fecha: string
  emisorNombre: string
  emisorDoc?: string
  emisorDireccion?: string
  receptorNombre?: string
  receptorDoc?: string
  receptorTelefono?: string
  monto: number
  concepto: string
  medioPago?: string
  notas?: string
}): Promise<ReciboCobro> {
  const userId = await getUserId()
  if (!Number.isFinite(data.monto) || data.monto < 0) throw new Error('Monto inválido')

  const last = await db.reciboCobro.findFirst({
    where: { userId },
    orderBy: { numero: 'desc' },
    select: { numero: true },
  })
  const numero = (last?.numero ?? 0) + 1

  const row = await db.reciboCobro.create({
    data: { ...data, userId, numero },
  })

  revalidatePath('/dashboard/recibos')
  return toRecibo(row)
}

export async function editarRecibo(id: string, data: {
  fecha: string
  emisorNombre: string
  emisorDoc?: string
  emisorDireccion?: string
  receptorNombre?: string
  receptorDoc?: string
  receptorTelefono?: string
  monto: number
  concepto: string
  medioPago?: string
  notas?: string
}): Promise<ReciboCobro> {
  const userId = await getUserId()
  if (!Number.isFinite(data.monto) || data.monto < 0) throw new Error('Monto inválido')

  const row = await db.reciboCobro.update({
    where: { id, userId },
    data,
  })
  revalidatePath('/dashboard/recibos')
  return toRecibo(row)
}

export async function eliminarRecibo(id: string) {
  const userId = await getUserId()
  await db.reciboCobro.deleteMany({ where: { id, userId } })
  revalidatePath('/dashboard/recibos')
}

export async function getNextNumero(): Promise<number> {
  const userId = await getUserId()
  const last = await db.reciboCobro.findFirst({
    where: { userId },
    orderBy: { numero: 'desc' },
    select: { numero: true },
  })
  return (last?.numero ?? 0) + 1
}

function toRecibo(row: any): ReciboCobro {
  return {
    id: row.id,
    userId: row.userId,
    numero: row.numero,
    fecha: row.fecha,
    emisorNombre: row.emisorNombre,
    emisorDoc: row.emisorDoc ?? null,
    emisorDireccion: row.emisorDireccion ?? null,
    receptorNombre: row.receptorNombre ?? null,
    receptorDoc: row.receptorDoc ?? null,
    receptorTelefono: row.receptorTelefono ?? null,
    monto: row.monto,
    concepto: row.concepto,
    medioPago: row.medioPago ?? null,
    notas: row.notas ?? null,
    createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt,
  }
}
