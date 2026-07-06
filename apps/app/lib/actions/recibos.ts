'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ReciboCobro } from '@/types/recibos'

const db = prisma as any

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user.id
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
  monto: number
  concepto: string
  medioPago?: string
  notas?: string
}): Promise<ReciboCobro> {
  const userId = await getUserId()
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
  monto: number
  concepto: string
  medioPago?: string
  notas?: string
}): Promise<ReciboCobro> {
  const userId = await getUserId()
  const row = await db.reciboCobro.updateMany({
    where: { id, userId },
    data,
  })
  revalidatePath('/dashboard/recibos')
  return toRecibo({ ...row, ...data, id, userId })
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
    monto: row.monto,
    concepto: row.concepto,
    medioPago: row.medioPago ?? null,
    notas: row.notas ?? null,
    createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt,
  }
}
