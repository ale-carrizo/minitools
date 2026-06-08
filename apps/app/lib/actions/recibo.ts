'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { Concepto, Modalidad, Recibo, ReciboConfig } from '@/types/recibo'

const db = prisma as any

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user.id
}

function maybeTrim(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function maybeNull(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toConfig(raw: any): ReciboConfig {
  return {
    id: raw.id,
    userId: raw.userId,
    razonSocial: raw.razonSocial,
    cuit: raw.cuit,
    domicilio: raw.domicilio ?? null,
    localidad: raw.localidad ?? null,
    actividad: raw.actividad ?? null,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  }
}

function toRecibo(raw: any): Recibo {
  return {
    id: raw.id,
    userId: raw.userId,
    empleadoId: raw.empleadoId ?? null,
    empNombre: raw.empNombre,
    empCuil: raw.empCuil ?? null,
    empCargo: raw.empCargo ?? null,
    empFechaIngreso: raw.empFechaIngreso ?? null,
    empModalidad: raw.empModalidad as Modalidad,
    periodo: raw.periodo,
    fechaPago: raw.fechaPago,
    conceptos: raw.conceptos as Concepto[],
    totalHaberes: raw.totalHaberes,
    totalDeducciones: raw.totalDeducciones,
    netoAPagar: raw.netoAPagar,
    nroFactura: raw.nroFactura ?? null,
    estado: raw.estado as 'borrador' | 'emitido',
    notas: raw.notas ?? null,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  }
}

function calcularTotales(conceptos: Concepto[]) {
  const totalHaberes = conceptos.filter((c) => c.tipo === 'haber').reduce((sum, c) => sum + c.monto, 0)
  const totalDeducciones = conceptos.filter((c) => c.tipo === 'deduccion').reduce((sum, c) => sum + c.monto, 0)
  return { totalHaberes, totalDeducciones, netoAPagar: totalHaberes - totalDeducciones }
}

export async function getConfig(): Promise<ReciboConfig | null> {
  const userId = await getUserId()
  const config = await db.reciboConfig.findUnique({ where: { userId } })
  return config ? toConfig(config) : null
}

export async function guardarConfig(data: {
  razonSocial: string
  cuit: string
  domicilio?: string
  localidad?: string
  actividad?: string
}): Promise<ReciboConfig> {
  const userId = await getUserId()
  const config = await db.reciboConfig.upsert({
    where: { userId },
    create: {
      userId,
      razonSocial: data.razonSocial.trim(),
      cuit: data.cuit.trim(),
      domicilio: maybeTrim(data.domicilio),
      localidad: maybeTrim(data.localidad),
      actividad: maybeTrim(data.actividad),
    },
    update: {
      razonSocial: data.razonSocial.trim(),
      cuit: data.cuit.trim(),
      domicilio: data.domicilio === undefined ? undefined : maybeNull(data.domicilio),
      localidad: data.localidad === undefined ? undefined : maybeNull(data.localidad),
      actividad: data.actividad === undefined ? undefined : maybeNull(data.actividad),
    },
  })
  revalidatePath('/dashboard/sueldos')
  revalidatePath('/dashboard/sueldos/config')
  return toConfig(config)
}

export async function getRecibos(): Promise<Recibo[]> {
  const userId = await getUserId()
  const recibos = await db.recibo.findMany({
    where: { userId },
    orderBy: [{ periodo: 'desc' }, { empNombre: 'asc' }],
  })
  return recibos.map(toRecibo)
}

export async function getRecibo(id: string): Promise<Recibo | null> {
  const userId = await getUserId()
  const recibo = await db.recibo.findFirst({ where: { id, userId } })
  return recibo ? toRecibo(recibo) : null
}

async function ensureReciboUnico(userId: string, empleadoId: string | null | undefined, periodo: string, excludeId?: string) {
  const existing = await db.recibo.findFirst({
    where: {
      userId,
      empleadoId: empleadoId ?? null,
      periodo,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  })

  if (existing) throw new Error('Ya existe un recibo para ese empleado y período')
}

export async function crearRecibo(data: {
  empleadoId?: string
  empNombre: string
  empCuil?: string
  empCargo?: string
  empFechaIngreso?: string
  empModalidad: Modalidad
  periodo: string
  fechaPago: string
  conceptos: Concepto[]
  nroFactura?: string
  notas?: string
}): Promise<void> {
  const userId = await getUserId()
  await ensureReciboUnico(userId, data.empleadoId, data.periodo)
  const totals = calcularTotales(data.conceptos)

  await db.recibo.create({
    data: {
      userId,
      empleadoId: maybeTrim(data.empleadoId) ?? null,
      empNombre: data.empNombre.trim(),
      empCuil: maybeTrim(data.empCuil),
      empCargo: maybeTrim(data.empCargo),
      empFechaIngreso: maybeTrim(data.empFechaIngreso),
      empModalidad: data.empModalidad,
      periodo: data.periodo,
      fechaPago: data.fechaPago,
      conceptos: data.conceptos,
      totalHaberes: totals.totalHaberes,
      totalDeducciones: totals.totalDeducciones,
      netoAPagar: totals.netoAPagar,
      nroFactura: maybeTrim(data.nroFactura),
      notas: maybeTrim(data.notas),
      estado: 'borrador',
    },
  })

  revalidatePath('/dashboard/sueldos')
  redirect('/dashboard/sueldos')
}

export async function editarRecibo(id: string, data: Partial<{
  empleadoId?: string
  empNombre: string
  empCuil?: string
  empCargo?: string
  empFechaIngreso?: string
  empModalidad: Modalidad
  periodo: string
  fechaPago: string
  conceptos: Concepto[]
  nroFactura?: string
  notas?: string
}>): Promise<void> {
  const userId = await getUserId()
  const actual = await db.recibo.findFirst({ where: { id, userId } })
  if (!actual) throw new Error('Recibo no encontrado')
  if (actual.estado !== 'borrador') throw new Error('Solo se pueden editar borradores')

  const payload = {
    empleadoId: data.empleadoId ?? actual.empleadoId ?? undefined,
    empNombre: data.empNombre ?? actual.empNombre,
    empCuil: data.empCuil ?? actual.empCuil ?? undefined,
    empCargo: data.empCargo ?? actual.empCargo ?? undefined,
    empFechaIngreso: data.empFechaIngreso ?? actual.empFechaIngreso ?? undefined,
    empModalidad: data.empModalidad ?? actual.empModalidad,
    periodo: data.periodo ?? actual.periodo,
    fechaPago: data.fechaPago ?? actual.fechaPago,
    conceptos: data.conceptos ?? (actual.conceptos as Concepto[]),
    nroFactura: data.nroFactura ?? actual.nroFactura ?? undefined,
    notas: data.notas ?? actual.notas ?? undefined,
  }

  await ensureReciboUnico(userId, payload.empleadoId, payload.periodo, id)
  const totals = calcularTotales(payload.conceptos)

  await db.recibo.update({
    where: { id },
    data: {
      empleadoId: maybeTrim(payload.empleadoId) ?? null,
      empNombre: payload.empNombre.trim(),
      empCuil: maybeTrim(payload.empCuil),
      empCargo: maybeTrim(payload.empCargo),
      empFechaIngreso: maybeTrim(payload.empFechaIngreso),
      empModalidad: payload.empModalidad,
      periodo: payload.periodo,
      fechaPago: payload.fechaPago,
      conceptos: payload.conceptos,
      totalHaberes: totals.totalHaberes,
      totalDeducciones: totals.totalDeducciones,
      netoAPagar: totals.netoAPagar,
      nroFactura: maybeTrim(payload.nroFactura),
      notas: maybeTrim(payload.notas),
    },
  })

  revalidatePath('/dashboard/sueldos')
  revalidatePath(`/dashboard/sueldos/${id}`)
  redirect(`/dashboard/sueldos/${id}`)
}

export async function emitirRecibo(id: string): Promise<void> {
  const userId = await getUserId()
  const actual = await db.recibo.findFirst({ where: { id, userId } })
  if (!actual) throw new Error('Recibo no encontrado')
  await db.recibo.update({ where: { id }, data: { estado: 'emitido' } })
  revalidatePath('/dashboard/sueldos')
  revalidatePath(`/dashboard/sueldos/${id}`)
}

export async function eliminarRecibo(id: string): Promise<void> {
  const userId = await getUserId()
  const actual = await db.recibo.findFirst({ where: { id, userId } })
  if (!actual) throw new Error('Recibo no encontrado')
  if (actual.estado !== 'borrador') throw new Error('Solo se pueden eliminar borradores')
  await db.recibo.delete({ where: { id } })
  revalidatePath('/dashboard/sueldos')
  redirect('/dashboard/sueldos')
}

export async function duplicarRecibo(id: string, nuevoPeriodo: string): Promise<void> {
  const userId = await getUserId()
  const actual = await db.recibo.findFirst({ where: { id, userId } })
  if (!actual) throw new Error('Recibo no encontrado')

  await ensureReciboUnico(userId, actual.empleadoId ?? undefined, nuevoPeriodo)

  const nuevo = await db.recibo.create({
    data: {
      userId,
      empleadoId: actual.empleadoId ?? null,
      empNombre: actual.empNombre,
      empCuil: actual.empCuil,
      empCargo: actual.empCargo,
      empFechaIngreso: actual.empFechaIngreso,
      empModalidad: actual.empModalidad,
      periodo: nuevoPeriodo,
      fechaPago: actual.fechaPago,
      conceptos: actual.conceptos,
      totalHaberes: actual.totalHaberes,
      totalDeducciones: actual.totalDeducciones,
      netoAPagar: actual.netoAPagar,
      nroFactura: actual.nroFactura,
      notas: actual.notas,
      estado: 'borrador',
    },
  })

  revalidatePath('/dashboard/sueldos')
  redirect(`/dashboard/sueldos/${nuevo.id}`)
}

export async function getEmpleadosParaRecibo(): Promise<Array<{ id: string; nombre: string; cargo: string | null }>> {
  const userId = await getUserId()
  try {
    const empleados = await db.empleado.findMany({
      where: { userId, activo: true },
      select: { id: true, nombre: true, cargo: true },
      orderBy: { nombre: 'asc' },
    })
    return empleados.map((empleado: any) => ({
      id: empleado.id,
      nombre: empleado.nombre,
      cargo: empleado.cargo ?? null,
    }))
  } catch {
    return []
  }
}
