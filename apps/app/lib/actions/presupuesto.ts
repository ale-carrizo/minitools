'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { recalcUserStorage } from '@/lib/storage'
import { todayAR } from '@/lib/date'
import {
  calcularTotales,
  type Cliente,
  type Presupuesto,
  type PresupuestoEstado,
  type PresupuestoInput,
  type PresupuestoItem,
  type PresupuestoServicioFrecuente,
  type PresupuestoTemplate,
} from '@/types/presupuesto'

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user.id
}

function todayDate() {
  return todayAR()
}

function maybeTrim(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function maybeNull(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function withVencido<T extends { estado: string; fechaVence: string | null }>(item: T) {
  if (item.estado === 'enviado' && item.fechaVence && item.fechaVence < todayDate()) {
    return { ...item, estado: 'vencido' as const }
  }

  return item
}

function toCliente(cliente: any): Cliente {
  return {
    id: cliente.id,
    userId: cliente.userId,
    nombre: cliente.nombre,
    empresa: cliente.empresa ?? null,
    email: cliente.email ?? null,
    telefono: cliente.telefono ?? null,
    direccion: cliente.direccion ?? null,
    cuit: cliente.cuit ?? null,
    notas: cliente.notas ?? null,
    activo: cliente.activo,
    createdAt: cliente.createdAt.toISOString(),
    updatedAt: cliente.updatedAt.toISOString(),
  }
}

function toPresupuestoItem(item: any): PresupuestoItem {
  return {
    id: item.id,
    presupuestoId: item.presupuestoId,
    orden: item.orden,
    descripcion: item.descripcion,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    subtotal: item.subtotal,
  }
}

function toServiciosFrecuentes(value: unknown): PresupuestoServicioFrecuente[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const raw = item as Record<string, unknown>
      const nombre = String(raw.nombre ?? '').trim()
      if (!nombre) return null

      return {
        id: String(raw.id ?? crypto.randomUUID()),
        nombre,
        descripcion: raw.descripcion ? String(raw.descripcion) : null,
        precioSugerido: Number(raw.precioSugerido ?? 0) || 0,
      }
    })
    .filter((item): item is PresupuestoServicioFrecuente => Boolean(item))
}

function toPresupuestoTemplate(template: any): PresupuestoTemplate {
  return {
    id: template.id,
    userId: template.userId,
    nombreComercial: template.nombreComercial ?? null,
    razonSocial: template.razonSocial ?? null,
    cuit: template.cuit ?? null,
    telefono: template.telefono ?? null,
    email: template.email ?? null,
    direccion: template.direccion ?? null,
    logoUrl: template.logoUrl ?? null,
    colorPrimario: template.colorPrimario ?? '#5448EE',
    mostrarIvaDefault: template.mostrarIvaDefault ?? true,
    diasValidezDefault: template.diasValidezDefault ?? 7,
    textoEncabezado: template.textoEncabezado ?? null,
    condicionesDefault: template.condicionesDefault ?? null,
    notasClienteDefault: template.notasClienteDefault ?? null,
    serviciosFrecuentes: toServiciosFrecuentes(template.serviciosFrecuentes),
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  }
}

function toPresupuesto(presupuesto: any): Presupuesto {
  const serialized = {
    id: presupuesto.id,
    userId: presupuesto.userId,
    clienteId: presupuesto.clienteId ?? null,
    numero: presupuesto.numero,
    titulo: presupuesto.titulo,
    estado: presupuesto.estado as PresupuestoEstado,
    fechaEmision: presupuesto.fechaEmision,
    fechaVence: presupuesto.fechaVence ?? null,
    moneda: presupuesto.moneda,
    descuento: presupuesto.descuento,
    iva: presupuesto.iva,
    notas: presupuesto.notas ?? null,
    notasCliente: presupuesto.notasCliente ?? null,
    subtotal: presupuesto.subtotal,
    totalFinal: presupuesto.totalFinal,
    logoUrl: presupuesto.logoUrl ?? null,
    pdfUrl: presupuesto.pdfUrl ?? null,
    enviadoAt: presupuesto.enviadoAt?.toISOString() ?? null,
    aceptadoAt: presupuesto.aceptadoAt?.toISOString() ?? null,
    rechazadoAt: presupuesto.rechazadoAt?.toISOString() ?? null,
    createdAt: presupuesto.createdAt.toISOString(),
    updatedAt: presupuesto.updatedAt.toISOString(),
    cliente: presupuesto.cliente ? toCliente(presupuesto.cliente) : null,
    items: (presupuesto.items ?? []).map(toPresupuestoItem),
  }

  return withVencido(serialized)
}

function normalizeInput(data: PresupuestoInput) {
  const items = data.items
    .map((item, index) => ({
      orden: item.orden ?? index + 1,
      descripcion: item.descripcion.trim(),
      cantidad: Number(item.cantidad),
      precioUnitario: Number(item.precioUnitario),
    }))
    .filter((item) => item.descripcion)

  if (!data.titulo.trim()) throw new Error('El titulo es obligatorio')
  if (items.length === 0) throw new Error('Agrega al menos un item')
  if (items.some((item) => !Number.isFinite(item.cantidad) || item.cantidad <= 0)) throw new Error('La cantidad de cada item debe ser mayor a cero')
  if (items.some((item) => !Number.isFinite(item.precioUnitario) || item.precioUnitario < 0)) throw new Error('El precio unitario no es válido')
  if (!Number.isFinite(Number(data.descuento)) || Number(data.descuento) < 0) throw new Error('El descuento no es válido')
  if (!Number.isFinite(Number(data.iva)) || Number(data.iva) < 0) throw new Error('El IVA no es válido')

  return {
    clienteId: maybeTrim(data.clienteId),
    titulo: data.titulo.trim(),
    fechaEmision: data.fechaEmision,
    fechaVence: maybeTrim(data.fechaVence),
    moneda: data.moneda,
    descuento: Number(data.descuento),
    iva: Number(data.iva),
    notas: maybeTrim(data.notas),
    notasCliente: maybeTrim(data.notasCliente),
    items,
  }
}

function normalizeTemplateInput(data: {
  nombreComercial?: string
  razonSocial?: string
  cuit?: string
  telefono?: string
  email?: string
  direccion?: string
  logoUrl?: string
  colorPrimario?: string
  mostrarIvaDefault?: boolean
  diasValidezDefault?: number
  textoEncabezado?: string
  condicionesDefault?: string
  notasClienteDefault?: string
  serviciosFrecuentes?: Array<{
    id?: string
    nombre: string
    descripcion?: string
    precioSugerido?: number
  }>
}) {
  return {
    nombreComercial: maybeNull(data.nombreComercial),
    razonSocial: maybeNull(data.razonSocial),
    cuit: maybeNull(data.cuit),
    telefono: maybeNull(data.telefono),
    email: maybeNull(data.email),
    direccion: maybeNull(data.direccion),
    logoUrl: maybeNull(data.logoUrl),
    colorPrimario: maybeTrim(data.colorPrimario) ?? '#5448EE',
    mostrarIvaDefault: Boolean(data.mostrarIvaDefault),
    diasValidezDefault: Math.max(0, Number(data.diasValidezDefault ?? 7) || 0),
    textoEncabezado: maybeNull(data.textoEncabezado),
    condicionesDefault: maybeNull(data.condicionesDefault),
    notasClienteDefault: maybeNull(data.notasClienteDefault),
    serviciosFrecuentes: (data.serviciosFrecuentes ?? [])
      .map((item) => ({
        id: item.id?.trim() || crypto.randomUUID(),
        nombre: item.nombre.trim(),
        descripcion: maybeNull(item.descripcion),
        precioSugerido: Number(item.precioSugerido ?? 0) || 0,
      }))
      .filter((item) => item.nombre),
  }
}

function buildItemsCreateMany(
  items: Array<{ orden: number; descripcion: string; cantidad: number; precioUnitario: number }>,
) {
  return items.map((item, index) => ({
    orden: index + 1,
    descripcion: item.descripcion,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    subtotal: item.cantidad * item.precioUnitario,
  }))
}

function getEstadoPatch(nuevoEstado: PresupuestoEstado) {
  const now = new Date()

  if (nuevoEstado === 'enviado') {
    return { estado: 'enviado', enviadoAt: now }
  }

  if (nuevoEstado === 'aceptado') {
    return { estado: 'aceptado', aceptadoAt: now }
  }

  if (nuevoEstado === 'rechazado') {
    return { estado: 'rechazado', rechazadoAt: now }
  }

  return {
    estado: 'borrador',
    enviadoAt: null,
    aceptadoAt: null,
    rechazadoAt: null,
  }
}

function isValidTransition(actual: PresupuestoEstado, next: PresupuestoEstado) {
  if (actual === 'vencido') return next === 'borrador'
  if (next === 'borrador') return true
  if (actual === 'borrador' && next === 'enviado') return true
  if (actual === 'enviado' && (next === 'aceptado' || next === 'rechazado')) return true
  return false
}

export async function getClientes(): Promise<Cliente[]> {
  const userId = await getUserId()
  const clientes = await prisma.cliente.findMany({
    where: { userId, activo: true },
    orderBy: { nombre: 'asc' },
  })

  return clientes.map(toCliente)
}

export async function getPresupuestoTemplate(): Promise<PresupuestoTemplate | null> {
  const userId = await getUserId()
  const template = await prisma.presupuestoTemplate.findUnique({
    where: { userId },
  })

  return template ? toPresupuestoTemplate(template) : null
}

export async function guardarPresupuestoTemplate(data: {
  nombreComercial?: string
  razonSocial?: string
  cuit?: string
  telefono?: string
  email?: string
  direccion?: string
  logoUrl?: string
  colorPrimario?: string
  mostrarIvaDefault?: boolean
  diasValidezDefault?: number
  textoEncabezado?: string
  condicionesDefault?: string
  notasClienteDefault?: string
  serviciosFrecuentes?: Array<{
    id?: string
    nombre: string
    descripcion?: string
    precioSugerido?: number
  }>
}): Promise<PresupuestoTemplate> {
  const userId = await getUserId()
  const payload = normalizeTemplateInput(data)

  const template = await prisma.presupuestoTemplate.upsert({
    where: { userId },
    update: payload,
    create: {
      userId,
      ...payload,
    },
  })

  await recalcUserStorage(userId)
  revalidatePath('/dashboard/presupuestos')
  revalidatePath('/dashboard/presupuestos/nuevo')
  revalidatePath('/dashboard/presupuestos/template')

  return toPresupuestoTemplate(template)
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const userId = await getUserId()
  const cliente = await prisma.cliente.findFirst({
    where: { id, userId, activo: true },
  })

  return cliente ? toCliente(cliente) : null
}

export async function crearCliente(data: {
  nombre: string
  empresa?: string
  email?: string
  telefono?: string
  direccion?: string
  cuit?: string
  notas?: string
}): Promise<Cliente> {
  const userId = await getUserId()

  if (!data.nombre.trim()) throw new Error('El nombre es obligatorio')

  const cliente = await prisma.cliente.create({
    data: {
      userId,
      nombre: data.nombre.trim(),
      empresa: maybeTrim(data.empresa),
      email: maybeTrim(data.email),
      telefono: maybeTrim(data.telefono),
      direccion: maybeTrim(data.direccion),
      cuit: maybeTrim(data.cuit),
      notas: maybeTrim(data.notas),
    },
  })

  revalidatePath('/dashboard/presupuestos')
  revalidatePath('/dashboard/presupuestos/clientes')
  return toCliente(cliente)
}

export async function editarCliente(
  id: string,
  data: Partial<{
    nombre: string
    empresa?: string
    email?: string
    telefono?: string
    direccion?: string
    cuit?: string
    notas?: string
  }>,
): Promise<Cliente> {
  const userId = await getUserId()
  const existente = await prisma.cliente.findFirst({
    where: { id, userId, activo: true },
  })

  if (!existente) throw new Error('Cliente no encontrado')

  const cliente = await prisma.cliente.update({
    where: { id },
    data: {
      nombre: data.nombre?.trim() || existente.nombre,
      empresa: data.empresa === undefined ? undefined : maybeNull(data.empresa),
      email: data.email === undefined ? undefined : maybeNull(data.email),
      telefono: data.telefono === undefined ? undefined : maybeNull(data.telefono),
      direccion: data.direccion === undefined ? undefined : maybeNull(data.direccion),
      cuit: data.cuit === undefined ? undefined : maybeNull(data.cuit),
      notas: data.notas === undefined ? undefined : maybeNull(data.notas),
    },
  })

  revalidatePath('/dashboard/presupuestos')
  revalidatePath('/dashboard/presupuestos/clientes')
  return toCliente(cliente)
}

export async function eliminarCliente(id: string): Promise<void> {
  const userId = await getUserId()
  await prisma.cliente.updateMany({
    where: { id, userId },
    data: { activo: false },
  })

  revalidatePath('/dashboard/presupuestos')
  revalidatePath('/dashboard/presupuestos/clientes')
}

export async function getPresupuestos(): Promise<Presupuesto[]> {
  const userId = await getUserId()
  const presupuestos = await prisma.presupuesto.findMany({
    where: { userId },
    include: {
      cliente: true,
      items: { orderBy: { orden: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return presupuestos.map(toPresupuesto)
}

export async function getPresupuesto(id: string): Promise<Presupuesto | null> {
  const userId = await getUserId()
  const presupuesto = await prisma.presupuesto.findFirst({
    where: { id, userId },
    include: {
      cliente: true,
      items: { orderBy: { orden: 'asc' } },
    },
  })

  return presupuesto ? toPresupuesto(presupuesto) : null
}

export async function getProximoNumero(): Promise<number> {
  const userId = await getUserId()
  const ultimo = await prisma.presupuesto.findFirst({
    where: { userId },
    orderBy: { numero: 'desc' },
  })

  return (ultimo?.numero ?? 0) + 1
}

export async function crearPresupuesto(data: PresupuestoInput): Promise<Presupuesto> {
  const userId = await getUserId()
  const payload = normalizeInput(data)
  const totals = calcularTotales(payload.items, payload.descuento, payload.iva)

  async function attempt(): Promise<Presupuesto> {
    return prisma.$transaction(async (tx) => {
      const ultimo = await tx.presupuesto.findFirst({
        where: { userId },
        orderBy: { numero: 'desc' },
      })
      const numero = (ultimo?.numero ?? 0) + 1

      const presupuesto = await tx.presupuesto.create({
        data: {
          userId,
          clienteId: payload.clienteId ?? null,
          numero,
          titulo: payload.titulo,
          estado: 'borrador',
          fechaEmision: payload.fechaEmision,
          fechaVence: payload.fechaVence ?? null,
          moneda: payload.moneda,
          descuento: payload.descuento,
          iva: payload.iva,
          notas: payload.notas,
          notasCliente: payload.notasCliente,
          subtotal: totals.subtotal,
          totalFinal: totals.totalFinal,
        },
        include: {
          cliente: true,
          items: { orderBy: { orden: 'asc' } },
        },
      })

      await tx.presupuestoItem.createMany({
        data: buildItemsCreateMany(payload.items).map((item) => ({
          ...item,
          presupuestoId: presupuesto.id,
        })),
      })

      const result = await tx.presupuesto.findUniqueOrThrow({
        where: { id: presupuesto.id },
        include: {
          cliente: true,
          items: { orderBy: { orden: 'asc' } },
        },
      })
      return result as unknown as Presupuesto
    })
  }

  let created: Presupuesto
  try {
    created = await attempt()
  } catch (err: any) {
    if (err?.code === 'P2002') {
      try {
        created = await attempt()
      } catch {
        throw new Error('No se pudo generar el número de presupuesto, intentá de nuevo')
      }
    } else {
      throw err
    }
  }

  revalidatePath('/dashboard/presupuestos')
  return created
}

export async function editarPresupuesto(id: string, data: PresupuestoInput): Promise<Presupuesto> {
  const userId = await getUserId()
  const actual = await prisma.presupuesto.findFirst({
    where: { id, userId },
  })

  if (!actual) throw new Error('Presupuesto no encontrado')
  if (actual.estado !== 'borrador') throw new Error('Solo se pueden editar borradores')

  const payload = normalizeInput(data)
  const totals = calcularTotales(payload.items, payload.descuento, payload.iva)

  const updated = await prisma.$transaction(async (tx) => {
    await tx.presupuestoItem.deleteMany({
      where: { presupuestoId: id },
    })

    await tx.presupuesto.update({
      where: { id },
      data: {
        clienteId: payload.clienteId ?? null,
        titulo: payload.titulo,
        fechaEmision: payload.fechaEmision,
        fechaVence: payload.fechaVence ?? null,
        moneda: payload.moneda,
        descuento: payload.descuento,
        iva: payload.iva,
        notas: payload.notas ?? null,
        notasCliente: payload.notasCliente ?? null,
        subtotal: totals.subtotal,
        totalFinal: totals.totalFinal,
      },
    })

    await tx.presupuestoItem.createMany({
      data: buildItemsCreateMany(payload.items).map((item) => ({
        ...item,
        presupuestoId: id,
      })),
    })

    return tx.presupuesto.findUniqueOrThrow({
      where: { id },
      include: {
        cliente: true,
        items: { orderBy: { orden: 'asc' } },
      },
    })
  })

  revalidatePath('/dashboard/presupuestos')
  revalidatePath(`/dashboard/presupuestos/${id}`)
  return toPresupuesto(updated)
}

export async function cambiarEstado(id: string, nuevoEstado: PresupuestoEstado): Promise<Presupuesto> {
  const userId = await getUserId()
  const actualRaw = await prisma.presupuesto.findFirst({
    where: { id, userId },
    include: {
      cliente: true,
      items: { orderBy: { orden: 'asc' } },
    },
  })

  if (!actualRaw) throw new Error('Presupuesto no encontrado')

  const actual = toPresupuesto(actualRaw)
  if (!isValidTransition(actual.estado, nuevoEstado)) {
    throw new Error('Transicion de estado no valida')
  }

  const updated = await prisma.presupuesto.update({
    where: { id },
    data: getEstadoPatch(nuevoEstado),
    include: {
      cliente: true,
      items: { orderBy: { orden: 'asc' } },
    },
  })

  revalidatePath('/dashboard/presupuestos')
  revalidatePath(`/dashboard/presupuestos/${id}`)
  return toPresupuesto(updated)
}

export async function duplicarPresupuesto(id: string): Promise<Presupuesto> {
  const userId = await getUserId()
  const actual = await prisma.presupuesto.findFirst({
    where: { id, userId },
    include: {
      cliente: true,
      items: { orderBy: { orden: 'asc' } },
    },
  })

  if (!actual) throw new Error('Presupuesto no encontrado')
  const source = actual

  async function attempt(): Promise<Presupuesto> {
    return prisma.$transaction(async (tx) => {
      const ultimo = await tx.presupuesto.findFirst({
        where: { userId },
        orderBy: { numero: 'desc' },
      })
      const numero = (ultimo?.numero ?? 0) + 1

      const created = await tx.presupuesto.create({
        data: {
          userId,
          clienteId: source.clienteId,
          numero,
          titulo: `${source.titulo} (copia)`,
          estado: 'borrador',
          fechaEmision: todayDate(),
          fechaVence: source.fechaVence,
          moneda: source.moneda,
          descuento: source.descuento,
          iva: source.iva,
          notas: source.notas,
          notasCliente: source.notasCliente,
          subtotal: source.subtotal,
          totalFinal: source.totalFinal,
          logoUrl: source.logoUrl,
          pdfUrl: null,
        },
      })

      await tx.presupuestoItem.createMany({
        data: source.items.map((item) => ({
          presupuestoId: created.id,
          orden: item.orden,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.subtotal,
        })),
      })

      const result = await tx.presupuesto.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          cliente: true,
          items: { orderBy: { orden: 'asc' } },
        },
      })
      return result as unknown as Presupuesto
    })
  }

  let duplicado: Presupuesto
  try {
    duplicado = await attempt()
  } catch (err: any) {
    if (err?.code === 'P2002') {
      try {
        duplicado = await attempt()
      } catch {
        throw new Error('No se pudo generar el número de presupuesto, intentá de nuevo')
      }
    } else {
      throw err
    }
  }

  await recalcUserStorage(userId)
  revalidatePath('/dashboard/presupuestos')
  redirect(`/dashboard/presupuestos/${duplicado.id}/editar`)
}

export async function eliminarPresupuesto(id: string): Promise<void> {
  const userId = await getUserId()
  const actual = await prisma.presupuesto.findFirst({
    where: { id, userId },
  })

  if (!actual) throw new Error('Presupuesto no encontrado')
  if (actual.estado !== 'borrador') throw new Error('Solo se pueden eliminar borradores')

  await prisma.presupuesto.delete({
    where: { id },
  })

  revalidatePath('/dashboard/presupuestos')
}
