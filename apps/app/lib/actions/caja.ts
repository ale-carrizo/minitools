'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type {
  CajaDia, CajaCobro, CajaDiaResumen,
  CajaCobroMedio, CajaCobroSource,
} from '@/types/caja'

// ── Helper ────────────────────────────────────────────────────────────────────
async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user.id
}

function toCajaDia(d: any): CajaDia {
  return {
    id:          d.id,
    userId:      d.userId,
    fecha:       d.fecha,
    cerrada:     d.cerrada,
    cerrada_at:  d.cerradaAt?.toISOString() ?? null,
    nota_cierre: d.notaCierre ?? null,
    total_cache: d.totalCache,
    created_at:  d.createdAt.toISOString(),
    updated_at:  d.updatedAt.toISOString(),
  }
}

function toCajaCobro(c: any): CajaCobro {
  return {
    id:              c.id,
    userId:          c.userId,
    dia_id:          c.diaId,
    monto:           c.monto,
    fecha_cobro:     c.fechaCobro,
    hora_cobro:      c.horaCobro    ?? null,
    medio:           c.medio        as CajaCobroMedio,
    source:          c.source       as CajaCobroSource,
    concepto:        c.concepto     ?? null,
    emisor_nombre:   c.emisorNombre ?? null,
    emisor_banco:    c.emisorBanco  ?? null,
    referencia:      c.referencia   ?? null,
    comprobante_url: c.comprobanteUrl ?? null,
    ia_raw:          c.iaRaw        as Record<string, any> | null,
    ia_confidence:   c.iaConfidence ?? null,
    ia_provider:     c.iaProvider   ?? null,
    ia_model:        c.iaModel      ?? null,
    mp_payment_id:   c.mpPaymentId  ?? null,
    mp_status:       c.mpStatus     ?? null,
    extracto_row:    c.extractoRow  as Record<string, any> | null,
    anulado:         c.anulado,
    anulado_at:      c.anuladoAt?.toISOString() ?? null,
    anulado_motivo:  c.anuladoMotivo ?? null,
    created_at:      c.createdAt.toISOString(),
    updated_at:      c.updatedAt.toISOString(),
  }
}

// ── Día ───────────────────────────────────────────────────────────────────────
export async function getCajaHoy(): Promise<CajaDia> {
  const userId = await getUserId()
  const fecha  = new Date().toISOString().split('T')[0]
  const dia    = await prisma.cajaDia.upsert({
    where:  { userId_fecha: { userId, fecha } },
    create: { userId, fecha },
    update: {},
  })
  return toCajaDia(dia)
}

export async function getCajaDia(fecha: string): Promise<CajaDia | null> {
  const userId = await getUserId()
  const dia    = await prisma.cajaDia.findUnique({
    where: { userId_fecha: { userId, fecha } },
  })
  return dia ? toCajaDia(dia) : null
}

export async function getResumenHoy(): Promise<CajaDiaResumen> {
  const userId = await getUserId()
  const fecha  = new Date().toISOString().split('T')[0]

  const dia = await prisma.cajaDia.upsert({
    where:  { userId_fecha: { userId, fecha } },
    create: { userId, fecha },
    update: {},
  })

  const cobrosRaw = await prisma.cajaCobro.findMany({
    where:   { diaId: dia.id, anulado: false },
    orderBy: { createdAt: 'desc' },
  })

  const cobros = cobrosRaw.map(toCajaCobro)
  const total  = cobros.reduce((acc, c) => acc + c.monto, 0)

  const por_source: CajaDiaResumen['por_source'] = { comprobante_ia: 0, extracto: 0, mercadopago: 0, manual: 0 }
  const por_medio:  CajaDiaResumen['por_medio']  = { transferencia: 0, efectivo: 0, mercadopago: 0, tarjeta_debito: 0, tarjeta_credito: 0, otro: 0 }

  cobros.forEach(c => {
    por_source[c.source] = (por_source[c.source] ?? 0) + c.monto
    por_medio[c.medio]   = (por_medio[c.medio]   ?? 0) + c.monto
  })

  return { dia: toCajaDia(dia), cobros, total, por_source, por_medio, cantidad: cobros.length }
}

export async function getHistorial(limit = 60): Promise<CajaDia[]> {
  const userId = await getUserId()
  const dias   = await prisma.cajaDia.findMany({
    where:   { userId },
    orderBy: { fecha: 'desc' },
    take:    limit,
  })
  return dias.map(toCajaDia)
}

// ── Cobros ────────────────────────────────────────────────────────────────────
interface RegistrarCobroPayload {
  monto:            number
  fecha_cobro:      string
  hora_cobro?:      string
  medio:            CajaCobroMedio
  source:           CajaCobroSource
  concepto?:        string
  emisor_nombre?:   string
  emisor_banco?:    string
  referencia?:      string
  comprobante_url?: string
  ia_raw?:          Record<string, any>
  ia_confidence?:   number
  ia_provider?:     string
  ia_model?:        string
  mp_payment_id?:   string
  mp_status?:       string
  extracto_row?:    Record<string, any>
}

export async function registrarCobro(payload: RegistrarCobroPayload): Promise<CajaCobro> {
  const userId = await getUserId()
  const fecha  = payload.fecha_cobro

  const cobro = await prisma.$transaction(async (tx) => {
    const dia = await tx.cajaDia.upsert({
      where:  { userId_fecha: { userId, fecha } },
      create: { userId, fecha },
      update: {},
    })

    if (dia.cerrada) throw new Error(`La caja del ${fecha} ya está cerrada`)

    const cobro = await tx.cajaCobro.create({
      data: {
        userId,
        diaId:          dia.id,
        monto:          payload.monto,
        fechaCobro:     payload.fecha_cobro,
        horaCobro:      payload.hora_cobro     ?? null,
        medio:          payload.medio,
        source:         payload.source,
        concepto:       payload.concepto        ?? null,
        emisorNombre:   payload.emisor_nombre   ?? null,
        emisorBanco:    payload.emisor_banco    ?? null,
        referencia:     payload.referencia      ?? null,
        comprobanteUrl: payload.comprobante_url ?? null,
        iaRaw:          payload.ia_raw          ?? null,
        iaConfidence:   payload.ia_confidence   ?? null,
        iaProvider:     payload.ia_provider     ?? null,
        iaModel:        payload.ia_model        ?? null,
        mpPaymentId:    payload.mp_payment_id   ?? null,
        mpStatus:       payload.mp_status       ?? null,
        extractoRow:    payload.extracto_row    ?? null,
      },
    })

    await tx.cajaDia.update({
      where: { id: dia.id },
      data:  { totalCache: { increment: payload.monto } },
    })

    return cobro
  })

  revalidatePath('/dashboard/caja')
  return toCajaCobro(cobro)
}

export async function registrarCobrosLote(cobros: RegistrarCobroPayload[]): Promise<number> {
  let importados = 0
  for (const cobro of cobros) {
    try {
      await registrarCobro(cobro)
      importados++
    } catch (err: any) {
      // ignorar duplicados de MP (unique mp_payment_id)
      if (!err.message?.includes('cerrada') && !err.message?.includes('unique')) {
        console.error('[registrarCobrosLote]', err.message)
      }
    }
  }
  revalidatePath('/dashboard/caja')
  return importados
}

export async function anularCobro(id: string, motivo?: string): Promise<void> {
  const userId = await getUserId()

  const cobro = await prisma.cajaCobro.findFirst({
    where:   { id, userId },
    include: { dia: true },
  })

  if (!cobro)          throw new Error('Cobro no encontrado')
  if (cobro.dia.cerrada) throw new Error('No se puede anular un cobro de una caja cerrada')

  await prisma.$transaction([
    prisma.cajaCobro.update({
      where: { id },
      data:  { anulado: true, anuladoAt: new Date(), anuladoMotivo: motivo ?? null },
    }),
    prisma.cajaDia.update({
      where: { id: cobro.diaId },
      data:  { totalCache: { decrement: cobro.monto } },
    }),
  ])

  revalidatePath('/dashboard/caja')
}

// ── Cierre ────────────────────────────────────────────────────────────────────
export async function cerrarCaja(fecha: string, nota?: string): Promise<CajaDia> {
  const userId = await getUserId()

  const dia = await prisma.cajaDia.findUnique({
    where: { userId_fecha: { userId, fecha } },
  })

  if (!dia)        throw new Error('No existe caja para esa fecha')
  if (dia.cerrada) throw new Error('La caja ya está cerrada')

  const updated = await prisma.cajaDia.update({
    where: { id: dia.id },
    data:  { cerrada: true, cerradaAt: new Date(), notaCierre: nota ?? null },
  })

  revalidatePath('/dashboard/caja')
  return toCajaDia(updated)
}
