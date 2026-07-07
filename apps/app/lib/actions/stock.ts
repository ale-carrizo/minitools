'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { Producto, MovimientoStock, MovimientoTipo } from '@/types/stock'

// ── Helper ────────────────────────────────────────────────────────────────────
async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user.id
}

function toProducto(p: any): Producto {
  return {
    id:          p.id,
    userId:      p.userId,
    nombre:      p.nombre,
    sku:         p.sku         ?? null,
    categoria:   p.categoria   ?? null,
    descripcion: p.descripcion ?? null,
    precioCosto: p.precioCosto,
    precioVenta: p.precioVenta,
    stock:       p.stock,
    stockMinimo: p.stockMinimo,
    unidad:      p.unidad,
    activo:      p.activo,
    createdAt:   p.createdAt.toISOString(),
    updatedAt:   p.updatedAt.toISOString(),
  }
}

function toMovimiento(m: any): MovimientoStock {
  return {
    id:         m.id,
    userId:     m.userId,
    productoId: m.productoId,
    tipo:       m.tipo as MovimientoTipo,
    cantidad:   m.cantidad,
    stockAntes: m.stockAntes,
    motivo:     m.motivo ?? null,
    createdAt:  m.createdAt.toISOString(),
  }
}

// ── Queries ───────────────────────────────────────────────────────────────────
export async function getProductos(): Promise<Producto[]> {
  const userId = await getUserId()
  const items  = await prisma.producto.findMany({
    where:   { userId, activo: true },
    orderBy: { nombre: 'asc' },
  })
  return items.map(toProducto)
}

export async function getProducto(id: string): Promise<Producto | null> {
  const userId  = await getUserId()
  const item    = await prisma.producto.findFirst({ where: { id, userId } })
  return item ? toProducto(item) : null
}

export async function getAlertasStock(): Promise<Producto[]> {
  const userId = await getUserId()
  const items  = await prisma.producto.findMany({
    where:   { userId, activo: true },
    orderBy: { stock: 'asc' },
  })
  return items
    .map(toProducto)
    .filter(p => p.stock <= p.stockMinimo)
}

export async function getMovimientos(productoId: string): Promise<MovimientoStock[]> {
  const userId = await getUserId()
  const items  = await prisma.movimientoStock.findMany({
    where:   { productoId, userId },
    orderBy: { createdAt: 'desc' },
    take:    50,
  })
  return items.map(toMovimiento)
}

// ── Mutaciones ────────────────────────────────────────────────────────────────
interface ProductoPayload {
  nombre:      string
  sku?:        string
  categoria?:  string
  descripcion?: string
  precioCosto: number
  precioVenta: number
  stock:       number
  stockMinimo: number
  unidad:      string
}

export async function crearProducto(data: ProductoPayload): Promise<Producto> {
  const userId = await getUserId()

  if (!Number.isFinite(data.precioCosto) || data.precioCosto < 0) throw new Error('El precio de costo no es válido')
  if (!Number.isFinite(data.precioVenta) || data.precioVenta < 0) throw new Error('El precio de venta no es válido')
  if (!Number.isFinite(data.stock) || data.stock < 0) throw new Error('El stock no es válido')
  if (!Number.isFinite(data.stockMinimo) || data.stockMinimo < 0) throw new Error('El stock mínimo no es válido')

  const producto = await prisma.producto.create({
    data: {
      userId,
      nombre:      data.nombre.trim(),
      sku:         data.sku?.trim()        || null,
      categoria:   data.categoria?.trim()  || null,
      descripcion: data.descripcion?.trim() || null,
      precioCosto: data.precioCosto,
      precioVenta: data.precioVenta,
      stock:       data.stock,
      stockMinimo: data.stockMinimo,
      unidad:      data.unidad,
    },
  })

  // Registrar movimiento inicial si hay stock
  if (data.stock > 0) {
    await prisma.movimientoStock.create({
      data: {
        userId,
        productoId: producto.id,
        tipo:       'entrada',
        cantidad:   data.stock,
        stockAntes: 0,
        motivo:     'Stock inicial',
      },
    })
  }

  revalidatePath('/dashboard/stock')
  return toProducto(producto)
}

export async function editarProducto(id: string, data: Partial<ProductoPayload>): Promise<Producto> {
  const userId = await getUserId()

  if (data.precioCosto !== undefined && (!Number.isFinite(data.precioCosto) || data.precioCosto < 0)) throw new Error('El precio de costo no es válido')
  if (data.precioVenta !== undefined && (!Number.isFinite(data.precioVenta) || data.precioVenta < 0)) throw new Error('El precio de venta no es válido')
  if (data.stockMinimo !== undefined && (!Number.isFinite(data.stockMinimo) || data.stockMinimo < 0)) throw new Error('El stock mínimo no es válido')

  const producto = await prisma.producto.findFirst({ where: { id, userId } })
  if (!producto) throw new Error('Producto no encontrado')

  const updated = await prisma.producto.update({
    where: { id },
    data: {
      nombre:      data.nombre?.trim(),
      sku:         data.sku?.trim()         || null,
      categoria:   data.categoria?.trim()   || null,
      descripcion: data.descripcion?.trim() || null,
      precioCosto: data.precioCosto,
      precioVenta: data.precioVenta,
      stockMinimo: data.stockMinimo,
      unidad:      data.unidad,
    },
  })

  revalidatePath('/dashboard/stock')
  return toProducto(updated)
}

export async function eliminarProducto(id: string): Promise<void> {
  const userId = await getUserId()
  await prisma.producto.update({
    where: { id, userId },
    data:  { activo: false },
  })
  revalidatePath('/dashboard/stock')
}

export async function registrarMovimiento(
  productoId: string,
  tipo: MovimientoTipo,
  cantidad: number,
  motivo?: string,
): Promise<Producto> {
  const userId = await getUserId()

  if (!Number.isFinite(cantidad) || cantidad <= 0) throw new Error('La cantidad debe ser mayor a cero')

  const producto = await prisma.$transaction(async (tx) => {
    const p = await tx.producto.findFirst({ where: { id: productoId, userId } })
    if (!p) throw new Error('Producto no encontrado')

    let nuevoStock: number
    if (tipo === 'entrada') nuevoStock = p.stock + cantidad
    else if (tipo === 'salida') {
      const updated = await tx.producto.updateMany({
        where: { id: productoId, userId, stock: { gte: cantidad } },
        data: { stock: { decrement: cantidad } },
      })
      if (updated.count === 0) throw new Error(`Stock insuficiente (disponible: ${p.stock})`)
      nuevoStock = p.stock - cantidad
    } else {
      // ajuste: cantidad es el nuevo valor absoluto
      nuevoStock = cantidad
    }

    await tx.movimientoStock.create({
      data: { userId, productoId, tipo, cantidad, stockAntes: p.stock, motivo: motivo || null },
    })

    if (tipo !== 'salida') {
      await tx.producto.update({
        where: { id: productoId },
        data:  { stock: nuevoStock },
      })
    }

    return tx.producto.findFirstOrThrow({ where: { id: productoId, userId } })
  })

  revalidatePath('/dashboard/stock')
  revalidatePath(`/dashboard/stock/${productoId}`)
  return toProducto(producto)
}

export async function importarProductos(rows: Array<{
  nombre?: string
  sku?: string
  categoria?: string
  descripcion?: string
  precioCosto?: number
  precioVenta?: number
  stock?: number
  stockMinimo?: number
  unidad?: string
}>): Promise<{ creados: number }> {
  const userId = await getUserId()
  const sanitized = rows
    .map((row) => ({
      nombre: row.nombre?.trim() ?? '',
      sku: row.sku?.trim() || null,
      categoria: row.categoria?.trim() || null,
      descripcion: row.descripcion?.trim() || null,
      precioCosto: Number(row.precioCosto ?? 0),
      precioVenta: Number(row.precioVenta ?? 0),
      stock: Number(row.stock ?? 0),
      stockMinimo: Number(row.stockMinimo ?? 0),
      unidad: row.unidad?.trim() || 'unidad',
    }))
    .filter((row) => row.nombre)

  if (sanitized.length === 0) throw new Error('No se encontraron filas válidas para importar')

  await prisma.$transaction(async (tx) => {
    for (const row of sanitized) {
      const producto = await tx.producto.create({
        data: {
          userId,
          nombre: row.nombre,
          sku: row.sku,
          categoria: row.categoria,
          descripcion: row.descripcion,
          precioCosto: row.precioCosto,
          precioVenta: row.precioVenta,
          stock: row.stock,
          stockMinimo: row.stockMinimo,
          unidad: row.unidad,
        },
      })

      if (row.stock > 0) {
        await tx.movimientoStock.create({
          data: {
            userId,
            productoId: producto.id,
            tipo: 'entrada',
            cantidad: row.stock,
            stockAntes: 0,
            motivo: 'Importación inicial',
          },
        })
      }
    }
  })

  revalidatePath('/dashboard/stock')
  return { creados: sanitized.length }
}
