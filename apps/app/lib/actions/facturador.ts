'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { encrypt, decrypt } from '@/lib/crypto'
import { Arca, CbteTipo, DocTipo, CondicionIva } from '@ramiidv/arca-facturacion'
import type {
  CondicionIvaEmisor, DocTipoCliente, Factura, FacturaItem, FacturadorConfig,
} from '@/types/facturador'

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user.id
}

function toConfig(raw: any | null, userId: string): FacturadorConfig {
  if (!raw) {
    return {
      id: '', userId,
      cuit: '', razonSocial: '', condicionIva: 'monotributo',
      puntoVenta: 1, tieneCertificado: false, produccion: false, conectado: false,
      ultimaVerificacion: null, createdAt: '', updatedAt: '',
    }
  }
  return {
    id: raw.id, userId: raw.userId,
    cuit: raw.cuit, razonSocial: raw.razonSocial,
    condicionIva: raw.condicionIva,
    puntoVenta: raw.puntoVenta,
    tieneCertificado: Boolean(raw.certificado && raw.clavePrivada),
    produccion: raw.produccion,
    conectado: raw.conectado,
    ultimaVerificacion: raw.ultimaVerificacion ? raw.ultimaVerificacion.toISOString() : null,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  }
}

function toFactura(raw: any): Factura {
  return {
    id: raw.id, userId: raw.userId,
    tipo: raw.tipo, puntoVenta: raw.puntoVenta, numero: raw.numero, fecha: raw.fecha,
    clienteNombre: raw.clienteNombre, clienteDocTipo: raw.clienteDocTipo, clienteDocNro: raw.clienteDocNro ?? null,
    condicionVenta: raw.condicionVenta,
    items: JSON.parse(raw.items) as FacturaItem[],
    neto: raw.neto, total: raw.total,
    cae: raw.cae ?? null, caeVencimiento: raw.caeVencimiento ?? null,
    estado: raw.estado, errorMsg: raw.errorMsg ?? null,
    facturaOrigenId: raw.facturaOrigenId ?? null,
    createdAt: raw.createdAt.toISOString(), updatedAt: raw.updatedAt.toISOString(),
  }
}

async function getArcaClient(userId: string): Promise<{ arca: InstanceType<typeof Arca>; config: any }> {
  const config = await prisma.facturadorConfig.findUnique({ where: { userId } })
  if (!config || !config.certificado || !config.clavePrivada) {
    throw new Error('Conectá ARCA primero desde Configuración')
  }
  const arca = new Arca({
    cuit: Number(config.cuit.replace(/\D/g, '')),
    cert: decrypt(config.certificado),
    key: decrypt(config.clavePrivada),
    production: config.produccion,
  })
  return { arca, config }
}

const DOC_TIPO_MAP: Record<DocTipoCliente, number> = {
  cuit: DocTipo.CUIT,
  dni: DocTipo.DNI,
  consumidor_final: DocTipo.CONSUMIDOR_FINAL,
}

const CONDICION_IVA_CLIENTE_MAP: Record<string, number> = {
  consumidor_final: CondicionIva.CONSUMIDOR_FINAL,
  monotributista: CondicionIva.MONOTRIBUTISTA,
  responsable_inscripto: CondicionIva.RESPONSABLE_INSCRIPTO,
  exento: CondicionIva.EXENTO,
}

// ── Configuración ─────────────────────────────────────────────────────────────

export async function getFacturadorConfig(): Promise<FacturadorConfig> {
  const userId = await getUserId()
  const config = await prisma.facturadorConfig.findUnique({ where: { userId } })
  return toConfig(config, userId)
}

export async function guardarDatosFiscales(data: {
  cuit: string
  razonSocial: string
  condicionIva: CondicionIvaEmisor
  puntoVenta: number
  produccion: boolean
}): Promise<void> {
  const userId = await getUserId()
  const cuitLimpio = data.cuit.replace(/\D/g, '')
  if (cuitLimpio.length !== 11) throw new Error('El CUIT debe tener 11 dígitos')
  if (!data.razonSocial.trim()) throw new Error('Ingresá la razón social')
  if (!Number.isFinite(data.puntoVenta) || data.puntoVenta < 1) throw new Error('Punto de venta inválido')

  await prisma.facturadorConfig.upsert({
    where: { userId },
    create: {
      userId, cuit: cuitLimpio, razonSocial: data.razonSocial.trim(),
      condicionIva: data.condicionIva, puntoVenta: data.puntoVenta, produccion: data.produccion,
    },
    update: {
      cuit: cuitLimpio, razonSocial: data.razonSocial.trim(),
      condicionIva: data.condicionIva, puntoVenta: data.puntoVenta, produccion: data.produccion,
      conectado: false, // cambiar CUIT/ambiente invalida la conexión probada
    },
  })
  revalidatePath('/dashboard/facturador')
}

/** Sube certificado + clave (PEM) y prueba la conexión contra ARCA (serverStatus). */
export async function conectarCertificado(data: { certificado: string; clavePrivada: string }): Promise<void> {
  const userId = await getUserId()
  const config = await prisma.facturadorConfig.findUnique({ where: { userId } })
  if (!config) throw new Error('Completá primero los datos fiscales')

  if (!data.certificado.includes('BEGIN CERTIFICATE')) throw new Error('El archivo no parece un certificado (.crt) válido')
  if (!data.clavePrivada.includes('PRIVATE KEY')) throw new Error('El archivo no parece una clave privada (.key) válida')

  const arca = new Arca({
    cuit: Number(config.cuit),
    cert: data.certificado,
    key: data.clavePrivada,
    production: config.produccion,
  })

  // Prueba real de conexión: pide estado del servidor autenticado.
  await arca.serverStatus()
  await arca.getPuntosVenta()

  await prisma.facturadorConfig.update({
    where: { userId },
    data: {
      certificado: encrypt(data.certificado),
      clavePrivada: encrypt(data.clavePrivada),
      conectado: true,
      ultimaVerificacion: new Date(),
    },
  })
  revalidatePath('/dashboard/facturador')
}

export async function getPuntosVentaArca(): Promise<{ numero: number; descripcion: string }[]> {
  const userId = await getUserId()
  const { arca } = await getArcaClient(userId)
  const puntos = await arca.getPuntosVenta()
  return puntos.map((p: any) => ({ numero: p.Nro, descripcion: p.EmisionTipo ?? '' }))
}

// ── Facturas ──────────────────────────────────────────────────────────────────

export async function getFacturas(): Promise<Factura[]> {
  const userId = await getUserId()
  const rows = await prisma.factura.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 200 })
  return rows.map(toFactura)
}

export async function getFactura(id: string): Promise<Factura> {
  const userId = await getUserId()
  const raw = await prisma.factura.findFirst({ where: { id, userId } })
  if (!raw) throw new Error('Comprobante no encontrado')
  return toFactura(raw)
}

export async function crearFacturaC(data: {
  clienteNombre:  string
  clienteDocTipo: DocTipoCliente
  clienteDocNro?: string
  clienteCondicionIva?: 'consumidor_final' | 'monotributista' | 'responsable_inscripto' | 'exento'
  condicionVenta: string
  items: { concepto: string; cantidad: number; precio: number }[]
}): Promise<Factura> {
  const userId = await getUserId()
  const { arca, config } = await getArcaClient(userId)

  const itemsLimpios = data.items
    .map((i) => ({ concepto: i.concepto.trim(), cantidad: Number(i.cantidad), precio: Number(i.precio) }))
    .filter((i) => i.concepto && i.cantidad > 0 && i.precio >= 0)
  if (itemsLimpios.length === 0) throw new Error('Agregá al menos un ítem')
  if (!data.clienteDocNro && data.clienteDocTipo !== 'consumidor_final') {
    throw new Error('Ingresá el número de documento del cliente')
  }

  const neto = itemsLimpios.reduce((sum, i) => sum + i.cantidad * i.precio, 0)
  const docTipo = DOC_TIPO_MAP[data.clienteDocTipo]
  const docNro = data.clienteDocTipo === 'consumidor_final' ? 0 : Number((data.clienteDocNro ?? '').replace(/\D/g, ''))
  const condicionIva = CONDICION_IVA_CLIENTE_MAP[data.clienteCondicionIva ?? 'consumidor_final']

  let result
  try {
    result = await arca.facturar({
      ptoVta: config.puntoVenta,
      cbteTipo: CbteTipo.FACTURA_C,
      docTipo,
      docNro,
      condicionIva,
      items: itemsLimpios.map((i) => ({ neto: i.cantidad * i.precio })),
    })
  } catch (err: any) {
    throw new Error(err?.message || 'ARCA rechazó la factura')
  }

  if (!result.aprobada) {
    const obs = result.observaciones?.map((o) => o.msg).join(' · ') || 'Rechazada por ARCA'
    throw new Error(obs)
  }

  const itemsGuardar: FacturaItem[] = itemsLimpios.map((i) => ({
    concepto: i.concepto, cantidad: i.cantidad, precio: i.precio, total: i.cantidad * i.precio,
  }))

  const factura = await prisma.factura.create({
    data: {
      userId,
      tipo: 'factura_c',
      puntoVenta: config.puntoVenta,
      numero: result.cbteNro,
      fecha: new Date().toISOString().slice(0, 10),
      clienteNombre: data.clienteNombre.trim(),
      clienteDocTipo: data.clienteDocTipo,
      clienteDocNro: data.clienteDocTipo === 'consumidor_final' ? null : (data.clienteDocNro ?? null),
      condicionVenta: data.condicionVenta,
      items: JSON.stringify(itemsGuardar),
      neto,
      total: result.importes.total,
      cae: result.cae ?? null,
      caeVencimiento: result.caeVencimiento ?? null,
      estado: 'emitida',
    },
  })

  revalidatePath('/dashboard/facturador')
  return toFactura(factura)
}

export async function crearNotaCreditoC(facturaOrigenId: string): Promise<Factura> {
  const userId = await getUserId()
  const { arca, config } = await getArcaClient(userId)

  const origen = await prisma.factura.findFirst({ where: { id: facturaOrigenId, userId, tipo: 'factura_c' } })
  if (!origen) throw new Error('Comprobante original no encontrado')

  const items = JSON.parse(origen.items) as FacturaItem[]

  let result
  try {
    result = await arca.notaCredito({
      ptoVta: config.puntoVenta,
      comprobanteOriginal: { tipo: CbteTipo.FACTURA_C, ptoVta: origen.puntoVenta, nro: origen.numero },
      docTipo: DOC_TIPO_MAP[origen.clienteDocTipo as DocTipoCliente],
      docNro: origen.clienteDocTipo === 'consumidor_final' ? 0 : Number((origen.clienteDocNro ?? '').replace(/\D/g, '')),
      items: items.map((i) => ({ neto: i.total })),
    })
  } catch (err: any) {
    throw new Error(err?.message || 'ARCA rechazó la nota de crédito')
  }

  if (!result.aprobada) {
    const obs = result.observaciones?.map((o) => o.msg).join(' · ') || 'Rechazada por ARCA'
    throw new Error(obs)
  }

  const nc = await prisma.factura.create({
    data: {
      userId,
      tipo: 'nc_c',
      puntoVenta: config.puntoVenta,
      numero: result.cbteNro,
      fecha: new Date().toISOString().slice(0, 10),
      clienteNombre: origen.clienteNombre,
      clienteDocTipo: origen.clienteDocTipo,
      clienteDocNro: origen.clienteDocNro,
      condicionVenta: origen.condicionVenta,
      items: origen.items,
      neto: origen.neto,
      total: result.importes.total,
      cae: result.cae ?? null,
      caeVencimiento: result.caeVencimiento ?? null,
      estado: 'emitida',
      facturaOrigenId: origen.id,
    },
  })

  revalidatePath('/dashboard/facturador')
  return toFactura(nc)
}
