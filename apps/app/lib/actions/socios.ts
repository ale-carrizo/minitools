'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { avatarColor } from '@/types/socios'
import type { Socio, CobroProgramado, CobroFrecuencia } from '@/types/socios'

// ── Auth helper ───────────────────────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')
  return session.user.id
}

// ── Helpers internos ──────────────────────────────────────────────────────────

function toDate(iso: string): Date {
  return new Date(iso + 'T00:00:00')
}

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function mapSocio(raw: any): Socio {
  return {
    id:              raw.id,
    userId:          raw.userId,
    nombre:          raw.nombre,
    telefono:        raw.telefono,
    email:           raw.email,
    notas:           raw.notas,
    avatarColor:     raw.avatarColor,
    estado:          raw.estado,
    frecuencia:      raw.frecuencia,
    monto:           raw.monto,
    diaVencimiento:  raw.diaVencimiento,
    concepto:        raw.concepto,
    mensajeTemplate: raw.mensajeTemplate,
    totalCobrado:    raw.totalCobrado,
    deudaTotal:      raw.deudaTotal,
    createdAt:       raw.createdAt?.toISOString?.() ?? raw.createdAt,
    updatedAt:       raw.updatedAt?.toISOString?.() ?? raw.updatedAt,
    cobros:          raw.cobros?.map(mapCobro),
    proximoCobro:    raw.proximoCobro ? mapCobro(raw.proximoCobro) : undefined,
  }
}

function mapCobro(raw: any): CobroProgramado {
  return {
    id:               raw.id,
    userId:           raw.userId,
    socioId:          raw.socioId,
    monto:            raw.monto,
    fechaVencimiento: raw.fechaVencimiento,
    estado:           raw.estado,
    concepto:         raw.concepto,
    fechaPago:        raw.fechaPago,
    medioPago:        raw.medioPago,
    notaPago:         raw.notaPago,
    comprobanteUrl:   raw.comprobanteUrl ?? null,
    fechaOriginal:    raw.fechaOriginal,
    vecesPospuesto:   raw.vecesPospuesto,
    createdAt:        raw.createdAt?.toISOString?.() ?? raw.createdAt,
    updatedAt:        raw.updatedAt?.toISOString?.() ?? raw.updatedAt,
    socio:            raw.socio
      ? { nombre: raw.socio.nombre, telefono: raw.socio.telefono, mensajeTemplate: raw.socio.mensajeTemplate, avatarColor: raw.socio.avatarColor }
      : undefined,
  }
}

// ── Generación de cuotas (equivale a generar_cuotas() SQL) ───────────────────

async function generarCuotas(
  userId: string,
  socio: { id: string; frecuencia: CobroFrecuencia; monto: number; diaVencimiento: number | null; concepto: string | null },
  desde: Date = new Date(),
  cantidad = 3
) {
  if (socio.frecuencia === 'unico') return

  const hoyStr = dateStr(desde)
  let fecha = new Date(desde)
  fecha.setHours(0, 0, 0, 0)

  for (let i = 0; i < cantidad; i++) {
    if (socio.frecuencia === 'mensual') {
      const dia = socio.diaVencimiento ?? 1
      fecha = new Date(fecha.getFullYear(), fecha.getMonth(), dia)
      if (dateStr(fecha) < hoyStr) {
        fecha = new Date(fecha.getFullYear(), fecha.getMonth() + 1, dia)
      }
    } else if (socio.frecuencia === 'quincenal') {
      fecha = new Date(fecha.getTime() + 15 * 86400000)
    } else if (socio.frecuencia === 'semanal') {
      fecha = new Date(fecha.getTime() + 7 * 86400000)
    }

    const fechaStr = dateStr(fecha)

    const exists = await prisma.cobroProgramado.findFirst({
      where: { socioId: socio.id, fechaVencimiento: fechaStr, estado: { not: 'cancelado' } },
    })
    if (!exists) {
      await prisma.cobroProgramado.create({
        data: {
          userId,
          socioId:          socio.id,
          monto:            socio.monto,
          fechaVencimiento: fechaStr,
          estado:           'pendiente',
          concepto:         socio.concepto,
        },
      })
    }

    if (socio.frecuencia === 'mensual') {
      fecha = new Date(fecha.getFullYear(), fecha.getMonth() + 1, socio.diaVencimiento ?? 1)
    }
  }
}

// ── SOCIOS ────────────────────────────────────────────────────────────────────

export async function getSocios(opts?: { search?: string; estado?: string }): Promise<Socio[]> {
  const userId = await getUserId()

  const estados = opts?.estado ? [opts.estado] : ['activo', 'suspendido']

  const rows = await prisma.socio.findMany({
    where: {
      userId,
      estado: { in: estados },
      ...(opts?.search ? { nombre: { contains: opts.search, mode: 'insensitive' } } : {}),
    },
    include: {
      cobros: {
        where: { estado: { in: ['pendiente', 'vencido', 'pospuesto'] } },
        orderBy: { fechaVencimiento: 'asc' },
        take: 1,
      },
    },
    orderBy: { nombre: 'asc' },
  })

  return rows.map((s: any) => mapSocio({ ...s, proximoCobro: s.cobros[0] ?? null, cobros: undefined }))
}

export async function getSocio(id: string): Promise<Socio> {
  const userId = await getUserId()

  const raw = await prisma.socio.findFirst({
    where: { id, userId },
    include: {
      cobros: { orderBy: { fechaVencimiento: 'desc' } },
    },
  })
  if (!raw) throw new Error('Socio no encontrado')

  const proximoCobro = raw.cobros
    .filter((c: any) => ['pendiente', 'vencido', 'pospuesto'].includes(c.estado))
    .sort((a: any, b: any) => a.fechaVencimiento.localeCompare(b.fechaVencimiento))[0] ?? null

  return mapSocio({ ...raw, proximoCobro })
}

export async function createSocio(data: {
  nombre: string
  telefono: string
  email?: string | null
  notas?: string | null
  frecuencia: CobroFrecuencia
  monto: number
  diaVencimiento?: number | null
  concepto?: string | null
  mensajeTemplate: string
  estado: 'activo'
}): Promise<Socio> {
  const userId = await getUserId()

  if (!Number.isFinite(data.monto) || data.monto < 0) throw new Error('Monto inválido')

  const socio = await prisma.socio.create({
    data: {
      userId,
      avatarColor: avatarColor(data.nombre),
      nombre:          data.nombre,
      telefono:        data.telefono,
      email:           data.email ?? null,
      notas:           data.notas ?? null,
      frecuencia:      data.frecuencia,
      monto:           data.monto,
      diaVencimiento:  data.diaVencimiento ?? null,
      concepto:        data.concepto ?? null,
      mensajeTemplate: data.mensajeTemplate,
      estado:          data.estado,
    },
  })

  if (data.frecuencia !== 'unico') {
    await generarCuotas(userId, { ...socio, frecuencia: socio.frecuencia as CobroFrecuencia }, new Date(), 3)
  }

  revalidatePath('/dashboard/socios')
  return mapSocio(socio)
}

export async function updateSocio(id: string, data: Partial<{
  nombre: string
  telefono: string
  email: string | null
  notas: string | null
  frecuencia: CobroFrecuencia
  monto: number
  diaVencimiento: number | null
  concepto: string | null
  mensajeTemplate: string
  estado: string
}>): Promise<Socio> {
  const userId = await getUserId()

  if (data.monto !== undefined && (!Number.isFinite(data.monto) || data.monto < 0)) throw new Error('Monto inválido')

  const socio = await prisma.socio.update({
    where: { id, userId },
    data: { ...data, updatedAt: new Date() },
  })

  revalidatePath('/dashboard/socios')
  return mapSocio(socio)
}

export async function deleteSocio(id: string): Promise<void> {
  const userId = await getUserId()
  await prisma.socio.updateMany({
    where: { id, userId },
    data: { estado: 'inactivo' },
  })
  revalidatePath('/dashboard/socios')
}

// ── COBROS ────────────────────────────────────────────────────────────────────

export async function getCobrosHoy(): Promise<{
  vencidos:          CobroProgramado[]
  estaSemana:        CobroProgramado[]
  totalVencido:      number
  totalEstaSemana:   number
}> {
  const userId = await getUserId()
  const hoy    = dateStr(new Date())
  const en7    = dateStr(new Date(Date.now() + 7 * 86400000))

  const [vencidosRaw, proximosRaw] = await Promise.all([
    prisma.cobroProgramado.findMany({
      where:   { userId, estado: 'vencido' },
      select: {
        id: true, userId: true, socioId: true, monto: true, fechaVencimiento: true, estado: true,
        concepto: true, fechaPago: true, medioPago: true, notaPago: true,
        fechaOriginal: true, vecesPospuesto: true, createdAt: true, updatedAt: true,
        socio: { select: { nombre: true, telefono: true, mensajeTemplate: true, avatarColor: true } },
      },
      orderBy: { fechaVencimiento: 'asc' },
      take:    50,
    }),
    prisma.cobroProgramado.findMany({
      where:   { userId, estado: { in: ['pendiente', 'pospuesto'] }, fechaVencimiento: { gte: hoy, lte: en7 } },
      select: {
        id: true, userId: true, socioId: true, monto: true, fechaVencimiento: true, estado: true,
        concepto: true, fechaPago: true, medioPago: true, notaPago: true,
        fechaOriginal: true, vecesPospuesto: true, createdAt: true, updatedAt: true,
        socio: { select: { nombre: true, telefono: true, mensajeTemplate: true, avatarColor: true } },
      },
      orderBy: { fechaVencimiento: 'asc' },
      take:    50,
    }),
  ])

  const v = vencidosRaw.map(mapCobro)
  const p = proximosRaw.map(mapCobro)

  return {
    vencidos:        v,
    estaSemana:      p,
    totalVencido:    v.reduce((a, c) => a + c.monto, 0),
    totalEstaSemana: p.reduce((a, c) => a + c.monto, 0),
  }
}

export async function pagarCobro(
  cobroId:        string,
  medioPago?:     string,
  nota?:          string,
  comprobanteUrl?: string
): Promise<CobroProgramado> {
  const userId = await getUserId()

  const cobro = await prisma.cobroProgramado.findFirst({ where: { id: cobroId, userId } })
  if (!cobro) throw new Error('Cobro no encontrado')
  if (cobro.estado === 'pagado') return mapCobro(cobro)

  const result = await prisma.$transaction(async (tx) => {
    // Update condicional: si dos requests llegan casi al mismo tiempo, solo una
    // gana la transición pendiente→pagado; la otra ve count=0 y no duplica el pago.
    const { count } = await tx.cobroProgramado.updateMany({
      where: { id: cobroId, userId, estado: { not: 'pagado' } },
      data: {
        estado:    'pagado',
        fechaPago: dateStr(new Date()),
        medioPago: medioPago ?? null,
        notaPago:  nota ?? null,
        comprobanteUrl: comprobanteUrl ?? null,
      },
    })
    if (count === 0) {
      const actual = await tx.cobroProgramado.findFirstOrThrow({ where: { id: cobroId, userId } })
      return mapCobro(actual)
    }
    const updated = await tx.cobroProgramado.findFirstOrThrow({ where: { id: cobroId, userId } })

    const socio = await tx.socio.findUnique({ where: { id: cobro.socioId } })
    if (socio) {
      await tx.socio.update({
        where: { id: cobro.socioId },
        data: {
          totalCobrado: socio.totalCobrado + cobro.monto,
          deudaTotal:   Math.max(0, socio.deudaTotal - cobro.monto),
        },
      })
    }

    return mapCobro(updated)
  })

  revalidatePath('/dashboard/socios')
  revalidatePath('/dashboard/socios/cobros')
  return result
}

export async function posponerCobro(cobroId: string, nuevaFecha: string): Promise<CobroProgramado> {
  const userId = await getUserId()

  const cobro = await prisma.cobroProgramado.findFirst({ where: { id: cobroId, userId } })
  if (!cobro) throw new Error('Cobro no encontrado')

  const updated = await prisma.cobroProgramado.update({
    where: { id: cobroId },
    data: {
      estado:           'pospuesto',
      fechaOriginal:    cobro.fechaOriginal ?? cobro.fechaVencimiento,
      fechaVencimiento: nuevaFecha,
      vecesPospuesto:   cobro.vecesPospuesto + 1,
    },
  })

  revalidatePath('/dashboard/socios')
  revalidatePath('/dashboard/socios/cobros')
  return mapCobro(updated)
}

export async function agregarCobroPuntual(opts: {
  socioId:          string
  monto:            number
  fechaVencimiento: string
  concepto?:        string
}): Promise<CobroProgramado> {
  const userId = await getUserId()

  if (!Number.isFinite(opts.monto) || opts.monto < 0) throw new Error('Monto inválido')

  const cobro = await prisma.cobroProgramado.create({
    data: {
      userId,
      socioId:          opts.socioId,
      monto:            opts.monto,
      fechaVencimiento: opts.fechaVencimiento,
      estado:           'pendiente',
      concepto:         opts.concepto ?? null,
    },
  })

  revalidatePath('/dashboard/socios')
  revalidatePath('/dashboard/socios/cobros')
  return mapCobro(cobro)
}

// ── Stats generales ───────────────────────────────────────────────────────────

export async function getSociosStats() {
  const userId = await getUserId()

  const [socios, cobradoMesRaw] = await Promise.all([
    prisma.socio.findMany({ where: { userId }, select: { estado: true, deudaTotal: true } }),
    prisma.cobroProgramado.findMany({
      where: {
        userId,
        estado:    'pagado',
        fechaPago: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0] },
      },
      select: { monto: true },
    }),
  ])

  return {
    total:      socios.length,
    activos:    socios.filter(s => s.estado === 'activo').length,
    conDeuda:   socios.filter(s => s.deudaTotal > 0).length,
    deudaTotal: socios.reduce((a, s) => a + s.deudaTotal, 0),
    cobradoMes: cobradoMesRaw.reduce((a, c) => a + c.monto, 0),
  }
}

// ── Cron: marcar vencidos + generar cuotas futuras ────────────────────────────

export async function marcarVencidosYGenerarCuotas(userId: string): Promise<{ marcados: number }> {
  const hoy = dateStr(new Date())

  const pendientes = await prisma.cobroProgramado.findMany({
    where: { userId, estado: { in: ['pendiente', 'pospuesto'] }, fechaVencimiento: { lt: hoy } },
    include: { socio: true },
  })

  for (const cobro of pendientes) {
    await prisma.cobroProgramado.update({
      where: { id: cobro.id },
      data: { estado: 'vencido' },
    })
    await prisma.socio.update({
      where: { id: cobro.socioId },
      data: { deudaTotal: { increment: cobro.monto } },
    })
  }

  // Generar cuotas futuras para socios con menos de 2 pendientes
  const socios = await prisma.socio.findMany({
    where: { userId, estado: 'activo', frecuencia: { not: 'unico' } },
  })
  for (const s of socios) {
    const pendientesCount = await prisma.cobroProgramado.count({
      where: { socioId: s.id, estado: { in: ['pendiente', 'pospuesto'] } },
    })
    if (pendientesCount < 2) {
      await generarCuotas(userId, { ...s, frecuencia: s.frecuencia as CobroFrecuencia }, new Date(), 3)
    }
  }

  return { marcados: pendientes.length }
}
