'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { todayAR } from '@/lib/date'
import {
  CAMPOS_DEFAULT,
  MEDIOS_PAGO_DEFAULT,
  type CamposConfig,
  type LibretaCaja,
  type LibretaConfig,
  type LibretaVenta,
} from '@/types/libreta'

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user.id
}

function toConfig(raw: any | null, userId: string): LibretaConfig {
  if (!raw) {
    return {
      id: '', userId,
      controlarStock: true,
      campos: CAMPOS_DEFAULT,
      mediosPago: MEDIOS_PAGO_DEFAULT,
      createdAt: '', updatedAt: '',
    }
  }
  const incoming = JSON.parse(raw.camposConfig || '{}') as Partial<CamposConfig>
  const campos = { ...CAMPOS_DEFAULT }
  for (const key of Object.keys(campos) as (keyof CamposConfig)[]) {
    campos[key] = { ...campos[key], ...(incoming[key] || {}) }
  }
  const mediosPago = JSON.parse(raw.mediosPago || '[]')
  return {
    id: raw.id, userId: raw.userId,
    controlarStock: raw.controlarStock,
    campos,
    mediosPago: mediosPago.length ? mediosPago : MEDIOS_PAGO_DEFAULT,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  }
}

function toCaja(raw: any): LibretaCaja {
  return {
    id: raw.id, userId: raw.userId, fecha: raw.fecha,
    montoInicial: raw.montoInicial, nota: raw.nota ?? null,
    estado: raw.estado, efectivoContado: raw.efectivoContado ?? null,
    notaCierre: raw.notaCierre ?? null,
    abiertaAt: raw.abiertaAt.toISOString(),
    cerradaAt: raw.cerradaAt ? raw.cerradaAt.toISOString() : null,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  }
}

function toVenta(raw: any): LibretaVenta {
  return {
    id: raw.id, userId: raw.userId, cajaId: raw.cajaId,
    productoId: raw.productoId ?? null,
    concepto: raw.concepto, cantidad: raw.cantidad, precio: raw.precio, total: raw.total,
    medioPago: raw.medioPago ?? null, cliente: raw.cliente ?? null, nota: raw.nota ?? null,
    createdAt: raw.createdAt.toISOString(),
  }
}

// ── Configuración ─────────────────────────────────────────────────────────────

export async function getLibretaConfig(): Promise<LibretaConfig> {
  const userId = await getUserId()
  const config = await prisma.libretaConfig.findUnique({ where: { userId } })
  return toConfig(config, userId)
}

export async function guardarLibretaConfig(data: {
  controlarStock: boolean
  campos: CamposConfig
  mediosPago: string[]
}): Promise<void> {
  const userId = await getUserId()
  if (!data.mediosPago.length) throw new Error('Tiene que quedar al menos un tipo de pago')
  const camposConfig = JSON.stringify(data.campos)
  const mediosPago = JSON.stringify(data.mediosPago)
  await prisma.libretaConfig.upsert({
    where: { userId },
    create: { userId, controlarStock: data.controlarStock, camposConfig, mediosPago },
    update: { controlarStock: data.controlarStock, camposConfig, mediosPago },
  })
  revalidatePath('/dashboard/libreta')
}

// ── Caja ──────────────────────────────────────────────────────────────────────

export async function getCajaAbierta(): Promise<LibretaCaja | null> {
  const userId = await getUserId()
  const caja = await prisma.libretaCaja.findFirst({ where: { userId, estado: 'abierta' } })
  return caja ? toCaja(caja) : null
}

export async function abrirCaja(data: { fecha: string; montoInicial: number; nota?: string }): Promise<LibretaCaja> {
  const userId = await getUserId()
  const abierta = await prisma.libretaCaja.findFirst({ where: { userId, estado: 'abierta' } })
  if (abierta) throw new Error('Ya hay una caja abierta')
  const existente = await prisma.libretaCaja.findUnique({ where: { userId_fecha: { userId, fecha: data.fecha } } })
  if (existente) throw new Error('Ya existe una caja para esa fecha')
  const caja = await prisma.libretaCaja.create({
    data: {
      userId, fecha: data.fecha,
      montoInicial: data.montoInicial,
      nota: data.nota?.trim() || null,
      estado: 'abierta',
    },
  })
  revalidatePath('/dashboard/libreta')
  return toCaja(caja)
}

export async function cerrarCaja(id: string, data: { efectivoContado?: number; notaCierre?: string }): Promise<LibretaCaja> {
  const userId = await getUserId()
  const caja = await prisma.libretaCaja.findFirst({ where: { id, userId, estado: 'abierta' } })
  if (!caja) throw new Error('Caja no encontrada')
  const actualizada = await prisma.libretaCaja.update({
    where: { id },
    data: {
      estado: 'cerrada',
      cerradaAt: new Date(),
      efectivoContado: data.efectivoContado ?? null,
      notaCierre: data.notaCierre?.trim() || null,
    },
  })
  revalidatePath('/dashboard/libreta')
  return toCaja(actualizada)
}

// ── Ventas ────────────────────────────────────────────────────────────────────

export async function getVentasDeCaja(cajaId: string): Promise<LibretaVenta[]> {
  const userId = await getUserId()
  const caja = await prisma.libretaCaja.findFirst({ where: { id: cajaId, userId } })
  if (!caja) throw new Error('Caja no encontrada')
  const ventas = await prisma.libretaVenta.findMany({
    where: { cajaId, userId },
    orderBy: { createdAt: 'desc' },
  })
  return ventas.map(toVenta)
}

export async function crearVenta(data: {
  cajaId:     string
  productoId?: string | null
  concepto:   string
  cantidad:   number
  precio:     number
  medioPago?: string
  cliente?:   string
  nota?:      string
  descontarStock?: boolean
}): Promise<LibretaVenta> {
  const userId = await getUserId()
  const concepto = data.concepto.trim()
  if (!concepto) throw new Error('Ingresá el concepto o mercadería')
  if (!Number.isFinite(data.cantidad) || data.cantidad <= 0) throw new Error('La cantidad debe ser mayor a cero')
  if (!Number.isFinite(data.precio) || data.precio < 0) throw new Error('El precio no es válido')

  const venta = await prisma.$transaction(async (tx) => {
    const caja = await tx.libretaCaja.findFirst({ where: { id: data.cajaId, userId, estado: 'abierta' } })
    if (!caja) throw new Error('La caja no está abierta')

    if (data.descontarStock && data.productoId) {
      const producto = await tx.producto.findFirst({ where: { id: data.productoId, userId, activo: true } })
      if (!producto) throw new Error('Producto no encontrado')
      const cantidadEntera = Math.round(data.cantidad)
      const updated = await tx.producto.updateMany({
        where: { id: producto.id, userId, stock: { gte: cantidadEntera } },
        data: { stock: { decrement: cantidadEntera } },
      })
      if (updated.count === 0) throw new Error(`Stock insuficiente para ${producto.nombre} (disponible: ${producto.stock})`)
      await tx.movimientoStock.create({
        data: {
          userId, productoId: producto.id, tipo: 'salida',
          cantidad: cantidadEntera, stockAntes: producto.stock, motivo: 'Venta (Libreta de ventas)',
        },
      })
    }

    return tx.libretaVenta.create({
      data: {
        userId, cajaId: data.cajaId,
        productoId: data.productoId || null,
        concepto, cantidad: data.cantidad, precio: data.precio,
        total: data.cantidad * data.precio,
        medioPago: data.medioPago?.trim() || null,
        cliente: data.cliente?.trim() || null,
        nota: data.nota?.trim() || null,
      },
    })
  })

  revalidatePath('/dashboard/libreta')
  if (data.descontarStock && data.productoId) revalidatePath('/dashboard/stock')
  return toVenta(venta)
}

// ── Historial y reportes ─────────────────────────────────────────────────────

export async function getHistorialCajas(desde?: string, hasta?: string): Promise<(LibretaCaja & { totalVentas: number; tickets: number })[]> {
  const userId = await getUserId()
  const where: any = { userId }
  if (desde && hasta) where.fecha = { gte: desde, lte: hasta }
  else if (desde) where.fecha = desde
  const cajas = await prisma.libretaCaja.findMany({
    where, include: { ventas: true },
    orderBy: { fecha: 'desc' },
  })
  return cajas.map((c) => ({
    ...toCaja(c),
    totalVentas: c.ventas.reduce((sum, v) => sum + v.total, 0),
    tickets: c.ventas.length,
  }))
}

export async function getReporteMes(mes: string): Promise<{
  total: number
  tickets: number
  stockBajo: number
  porMedioPago: Record<string, number>
  topProductos: Record<string, number>
}> {
  const userId = await getUserId()
  const [ventas, productos] = await Promise.all([
    prisma.libretaVenta.findMany({ where: { userId, caja: { fecha: { startsWith: mes } } } }),
    prisma.producto.findMany({ where: { userId, activo: true }, select: { stock: true, stockMinimo: true } }),
  ])
  const stockBajo = productos.filter((p) => p.stock <= p.stockMinimo).length
  const total = ventas.reduce((sum, v) => sum + v.total, 0)
  const porMedioPago: Record<string, number> = {}
  const topProductos: Record<string, number> = {}
  for (const v of ventas) {
    const medio = v.medioPago || 'Sin dato'
    porMedioPago[medio] = (porMedioPago[medio] || 0) + v.total
    topProductos[v.concepto] = (topProductos[v.concepto] || 0) + v.cantidad
  }
  return { total, tickets: ventas.length, stockBajo, porMedioPago, topProductos }
}
