'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  calcularEstadoGarantia,
  calcularFechaVencimiento,
  type GarantiaProducto,
  type ReclamoEstado,
  type ReclamoGarantia,
} from '@/types/garantia'

const db = prisma as any

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user.id
}

function maybeNull(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toReclamo(raw: any): ReclamoGarantia {
  return {
    id: raw.id,
    userId: raw.userId,
    productoId: raw.productoId,
    fecha: raw.fecha,
    estado: raw.estado as ReclamoEstado,
    descripcion: raw.descripcion,
    resolucion: raw.resolucion ?? null,
    notas: raw.notas ?? null,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  }
}

function toGarantia(raw: any): GarantiaProducto {
  return {
    id: raw.id,
    userId: raw.userId,
    nombre: raw.nombre,
    marca: raw.marca ?? null,
    modelo: raw.modelo ?? null,
    nroSerie: raw.nroSerie ?? null,
    categoria: raw.categoria ?? null,
    proveedor: raw.proveedor ?? null,
    nroFactura: raw.nroFactura ?? null,
    fechaCompra: raw.fechaCompra ?? null,
    fechaVencimiento: raw.fechaVencimiento ?? null,
    mesesGarantia: raw.mesesGarantia ?? null,
    precioCompra: raw.precioCompra ?? null,
    notas: raw.notas ?? null,
    activo: raw.activo,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    reclamos: Array.isArray(raw.reclamos) ? raw.reclamos.map(toReclamo) : [],
  }
}

function resolveFechaVencimiento(data: { fechaCompra?: string; fechaVencimiento?: string; mesesGarantia?: number | null }) {
  if (data.fechaVencimiento?.trim()) return data.fechaVencimiento
  if (data.fechaCompra?.trim() && data.mesesGarantia && data.mesesGarantia > 0) {
    return calcularFechaVencimiento(data.fechaCompra, data.mesesGarantia)
  }
  return null
}

export async function getGarantias(): Promise<GarantiaProducto[]> {
  const userId = await getUserId()
  const garantias = await db.garantiaProducto.findMany({
    where: { userId, activo: true },
    include: { reclamos: { orderBy: { createdAt: 'desc' } } },
    orderBy: [{ fechaVencimiento: { sort: 'asc', nulls: 'last' } }],
  })
  return garantias.map(toGarantia)
}

export async function getGarantia(id: string): Promise<GarantiaProducto | null> {
  const userId = await getUserId()
  const garantia = await db.garantiaProducto.findFirst({
    where: { id, userId },
    include: { reclamos: { orderBy: { createdAt: 'desc' } } },
  })
  return garantia ? toGarantia(garantia) : null
}

export async function getAlertas(diasAlerta = 30): Promise<GarantiaProducto[]> {
  const garantias = await getGarantias()
  return garantias.filter((garantia) => {
    const estado = calcularEstadoGarantia(garantia.fechaVencimiento, diasAlerta)
    return estado === 'por_vencer' || estado === 'vencida'
  })
}

export async function crearGarantia(data: {
  nombre: string
  marca?: string
  modelo?: string
  nroSerie?: string
  categoria?: string
  proveedor?: string
  nroFactura?: string
  fechaCompra?: string
  fechaVencimiento?: string
  mesesGarantia?: number
  precioCompra?: number
  notas?: string
}): Promise<void> {
  const userId = await getUserId()
  const fechaVencimiento = resolveFechaVencimiento(data)

  await db.garantiaProducto.create({
    data: {
      userId,
      nombre: data.nombre.trim(),
      marca: maybeNull(data.marca),
      modelo: maybeNull(data.modelo),
      nroSerie: maybeNull(data.nroSerie),
      categoria: maybeNull(data.categoria),
      proveedor: maybeNull(data.proveedor),
      nroFactura: maybeNull(data.nroFactura),
      fechaCompra: maybeNull(data.fechaCompra),
      fechaVencimiento,
      mesesGarantia: data.mesesGarantia && data.mesesGarantia > 0 ? data.mesesGarantia : null,
      precioCompra: typeof data.precioCompra === 'number' && Number.isFinite(data.precioCompra) ? data.precioCompra : null,
      notas: maybeNull(data.notas),
    },
  })

  revalidatePath('/dashboard/garantias')
  redirect('/dashboard/garantias')
}

export async function editarGarantia(id: string, data: Partial<{
  nombre: string
  marca?: string
  modelo?: string
  nroSerie?: string
  categoria?: string
  proveedor?: string
  nroFactura?: string
  fechaCompra?: string
  fechaVencimiento?: string
  mesesGarantia?: number
  precioCompra?: number
  notas?: string
}>): Promise<void> {
  const userId = await getUserId()
  const actual = await db.garantiaProducto.findFirst({ where: { id, userId, activo: true } })
  if (!actual) throw new Error('Garantía no encontrada')

  const payload = {
    nombre: data.nombre ?? actual.nombre,
    marca: data.marca ?? actual.marca ?? undefined,
    modelo: data.modelo ?? actual.modelo ?? undefined,
    nroSerie: data.nroSerie ?? actual.nroSerie ?? undefined,
    categoria: data.categoria ?? actual.categoria ?? undefined,
    proveedor: data.proveedor ?? actual.proveedor ?? undefined,
    nroFactura: data.nroFactura ?? actual.nroFactura ?? undefined,
    fechaCompra: data.fechaCompra ?? actual.fechaCompra ?? undefined,
    fechaVencimiento: data.fechaVencimiento ?? actual.fechaVencimiento ?? undefined,
    mesesGarantia: data.mesesGarantia ?? actual.mesesGarantia ?? undefined,
    precioCompra: data.precioCompra ?? actual.precioCompra ?? undefined,
    notas: data.notas ?? actual.notas ?? undefined,
  }

  const fechaVencimiento = resolveFechaVencimiento(payload)

  await db.garantiaProducto.update({
    where: { id },
    data: {
      nombre: payload.nombre.trim(),
      marca: maybeNull(payload.marca),
      modelo: maybeNull(payload.modelo),
      nroSerie: maybeNull(payload.nroSerie),
      categoria: maybeNull(payload.categoria),
      proveedor: maybeNull(payload.proveedor),
      nroFactura: maybeNull(payload.nroFactura),
      fechaCompra: maybeNull(payload.fechaCompra),
      fechaVencimiento,
      mesesGarantia: payload.mesesGarantia && payload.mesesGarantia > 0 ? payload.mesesGarantia : null,
      precioCompra: typeof payload.precioCompra === 'number' && Number.isFinite(payload.precioCompra) ? payload.precioCompra : null,
      notas: maybeNull(payload.notas),
    },
  })

  revalidatePath('/dashboard/garantias')
  revalidatePath(`/dashboard/garantias/${id}`)
  redirect(`/dashboard/garantias/${id}`)
}

export async function eliminarGarantia(id: string): Promise<void> {
  const userId = await getUserId()
  const actual = await db.garantiaProducto.findFirst({ where: { id, userId, activo: true } })
  if (!actual) throw new Error('Garantía no encontrada')
  await db.garantiaProducto.update({ where: { id }, data: { activo: false } })
  revalidatePath('/dashboard/garantias')
  redirect('/dashboard/garantias')
}

export async function crearReclamo(data: {
  productoId: string
  fecha: string
  descripcion: string
  notas?: string
}): Promise<void> {
  const userId = await getUserId()
  const producto = await db.garantiaProducto.findFirst({
    where: { id: data.productoId, userId, activo: true },
  })
  if (!producto) throw new Error('Producto no encontrado')

  await db.reclamoGarantia.create({
    data: {
      userId,
      productoId: data.productoId,
      fecha: data.fecha,
      descripcion: data.descripcion.trim(),
      notas: maybeNull(data.notas),
      estado: 'abierto',
    },
  })

  revalidatePath('/dashboard/garantias')
  revalidatePath(`/dashboard/garantias/${data.productoId}`)
}

export async function actualizarReclamo(id: string, data: {
  estado?: ReclamoEstado
  resolucion?: string
  notas?: string
}): Promise<void> {
  const userId = await getUserId()
  const actual = await db.reclamoGarantia.findFirst({ where: { id, userId } })
  if (!actual) throw new Error('Reclamo no encontrado')

  await db.reclamoGarantia.update({
    where: { id },
    data: {
      estado: data.estado ?? undefined,
      resolucion: data.resolucion === undefined ? undefined : maybeNull(data.resolucion),
      notas: data.notas === undefined ? undefined : maybeNull(data.notas),
    },
  })

  revalidatePath('/dashboard/garantias')
  revalidatePath(`/dashboard/garantias/${actual.productoId}`)
}

export async function eliminarReclamo(id: string, productoId: string): Promise<void> {
  const userId = await getUserId()
  const actual = await db.reclamoGarantia.findFirst({ where: { id, userId, productoId } })
  if (!actual) throw new Error('Reclamo no encontrado')
  await db.reclamoGarantia.delete({ where: { id } })
  revalidatePath('/dashboard/garantias')
  revalidatePath(`/dashboard/garantias/${productoId}`)
}
