'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { ModulosVisibles, ReportesConfig, ReportesResumen } from '@/types/reportes'
import { MODULOS_DEFAULT } from '@/types/reportes'
import { todayAR } from '@/lib/date'

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user.id
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function rangoDias(desde: string, hasta: string): string[] {
  const dias: string[] = []
  let cursor = desde
  while (cursor <= hasta) {
    dias.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return dias
}

// ── Configuración ─────────────────────────────────────────────────────────────

export async function getReportesConfig(): Promise<ReportesConfig> {
  const userId = await getUserId()
  const raw = await prisma.reportesConfig.findUnique({ where: { userId } })
  if (!raw) {
    return { id: '', userId, modulos: MODULOS_DEFAULT, createdAt: '', updatedAt: '' }
  }
  return {
    id: raw.id, userId: raw.userId,
    modulos: { ...MODULOS_DEFAULT, ...JSON.parse(raw.modulos) },
    createdAt: raw.createdAt.toISOString(), updatedAt: raw.updatedAt.toISOString(),
  }
}

export async function guardarReportesConfig(modulos: ModulosVisibles): Promise<void> {
  const userId = await getUserId()
  const json = JSON.stringify(modulos)
  await prisma.reportesConfig.upsert({
    where: { userId },
    create: { userId, modulos: json },
    update: { modulos: json },
  })
  revalidatePath('/dashboard/reportes')
}

// ── Resumen ───────────────────────────────────────────────────────────────────

export async function getReportesResumen(desde: string, hasta: string): Promise<ReportesResumen> {
  const userId = await getUserId()
  const hoy = todayAR()

  const [
    cobrosCaja, ventasLibreta, facturas, presupuestos, socios, cobrosProgramados, tareas,
  ] = await Promise.all([
    prisma.cajaCobro.findMany({
      where: { userId, anulado: false, fechaCobro: { gte: desde, lte: hasta } },
      select: { monto: true, fechaCobro: true },
    }),
    prisma.libretaVenta.findMany({
      where: { userId, caja: { fecha: { gte: desde, lte: hasta } } },
      select: { total: true, caja: { select: { fecha: true } } },
    }),
    prisma.factura.findMany({
      where: { userId, estado: 'emitida', fecha: { gte: desde, lte: hasta } },
      select: { total: true, tipo: true, fecha: true },
    }),
    prisma.presupuesto.findMany({
      where: { userId, fechaEmision: { gte: desde, lte: hasta } },
      select: { estado: true, totalFinal: true },
    }),
    prisma.socio.findMany({ where: { userId, estado: 'activo' }, select: { id: true } }),
    prisma.cobroProgramado.findMany({
      where: { userId, estado: { not: 'cancelado' }, fechaVencimiento: { gte: desde, lte: hasta } },
      select: { estado: true, monto: true, fechaVencimiento: true },
    }),
    prisma.tarea.findMany({ where: { userId }, select: { archivada: true, fechaVenc: true } }),
  ])

  // Ventas
  const ventas = {
    caja: { total: cobrosCaja.reduce((s, c) => s + c.monto, 0), tickets: cobrosCaja.length },
    libreta: { total: ventasLibreta.reduce((s, v) => s + v.total, 0), tickets: ventasLibreta.length },
    facturador: {
      total: facturas.filter((f) => f.tipo === 'factura_c').reduce((s, f) => s + f.total, 0)
           - facturas.filter((f) => f.tipo === 'nc_c').reduce((s, f) => s + f.total, 0),
      comprobantes: facturas.length,
    },
  }

  // Presupuestos
  const porEstadoPresupuesto: Record<string, { cantidad: number; monto: number }> = {}
  for (const p of presupuestos) {
    if (!porEstadoPresupuesto[p.estado]) porEstadoPresupuesto[p.estado] = { cantidad: 0, monto: 0 }
    porEstadoPresupuesto[p.estado].cantidad += 1
    porEstadoPresupuesto[p.estado].monto += p.totalFinal
  }
  const presupuestosResumen = {
    totalMonto: presupuestos.reduce((s, p) => s + p.totalFinal, 0),
    porEstado: porEstadoPresupuesto,
  }

  // Clientes (Mini CRM)
  const porEstadoCobro: Record<string, { cantidad: number; monto: number }> = {}
  for (const c of cobrosProgramados) {
    if (!porEstadoCobro[c.estado]) porEstadoCobro[c.estado] = { cantidad: 0, monto: 0 }
    porEstadoCobro[c.estado].cantidad += 1
    porEstadoCobro[c.estado].monto += c.monto
  }
  const clientesResumen = {
    activos: socios.length,
    pendienteMonto: cobrosProgramados.filter((c) => c.estado === 'pendiente' || c.estado === 'vencido' || c.estado === 'pospuesto').reduce((s, c) => s + c.monto, 0),
    vencenHoyMonto: cobrosProgramados.filter((c) => c.fechaVencimiento === hoy).reduce((s, c) => s + c.monto, 0),
    porEstado: porEstadoCobro,
  }

  // Tareas — sin campo de responsable en el modelo, se omite esa métrica.
  const tareasResumen = {
    abiertas: tareas.filter((t) => !t.archivada).length,
    vencenHoy: tareas.filter((t) => !t.archivada && t.fechaVenc === hoy).length,
    vencidas: tareas.filter((t) => !t.archivada && t.fechaVenc && t.fechaVenc < hoy).length,
    completadas: tareas.filter((t) => t.archivada).length,
  }

  // Evolución diaria combinada (caja + libreta + facturador), para el gráfico
  const porDia = new Map<string, number>()
  for (const dia of rangoDias(desde, hasta)) porDia.set(dia, 0)
  for (const c of cobrosCaja) porDia.set(c.fechaCobro, (porDia.get(c.fechaCobro) ?? 0) + c.monto)
  for (const v of ventasLibreta) {
    const fecha = v.caja.fecha
    porDia.set(fecha, (porDia.get(fecha) ?? 0) + v.total)
  }
  for (const f of facturas) {
    const signo = f.tipo === 'nc_c' ? -1 : 1
    porDia.set(f.fecha, (porDia.get(f.fecha) ?? 0) + signo * f.total)
  }
  const evolucionDiaria = Array.from(porDia.entries()).map(([fecha, total]) => ({ fecha, total })).sort((a, b) => a.fecha.localeCompare(b.fecha))

  return {
    desde, hasta,
    ventas,
    presupuestos: presupuestosResumen,
    clientes: clientesResumen,
    tareas: tareasResumen,
    evolucionDiaria,
  }
}
