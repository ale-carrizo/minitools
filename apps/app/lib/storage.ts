import { prisma } from '@/lib/prisma'

const GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000 // 1 mes

/** Tamaño real en bytes de un data-URL base64. URLs externas (http/https) no suman. */
export function estimateFileBytes(dataUrl: string | null | undefined): number {
  if (!dataUrl) return 0
  const match = dataUrl.match(/^data:[^;]+;base64,(.+)$/)
  if (!match) return 0
  const base64 = match[1]
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.ceil((base64.length * 3) / 4) - padding
}

/** Suma los bytes de todos los adjuntos (JSON [{url,...}]) de una tarea. */
function estimateAdjuntosBytes(adjuntosJson: string | null | undefined): number {
  if (!adjuntosJson) return 0
  try {
    const adjuntos = JSON.parse(adjuntosJson) as Array<{ url?: string }>
    return adjuntos.reduce((sum, a) => sum + estimateFileBytes(a.url), 0)
  } catch {
    return 0
  }
}

/** Recalcula el storage usado por un usuario a partir de todos los campos "archivo" conocidos. */
export async function recalcUserStorage(userId: string) {
  const [reciboConfig, template, presupuestos, tareas] = await Promise.all([
    prisma.reciboConfig.findUnique({ where: { userId }, select: { logoUrl: true } }),
    prisma.presupuestoTemplate.findUnique({ where: { userId }, select: { logoUrl: true } }),
    prisma.presupuesto.findMany({ where: { userId }, select: { logoUrl: true } }),
    prisma.tarea.findMany({ where: { userId }, select: { adjuntos: true } }),
  ])

  const total =
    estimateFileBytes(reciboConfig?.logoUrl) +
    estimateFileBytes(template?.logoUrl) +
    presupuestos.reduce((sum, p) => sum + estimateFileBytes(p.logoUrl), 0) +
    tareas.reduce((sum, t) => sum + estimateAdjuntosBytes(t.adjuntos), 0)

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { storageLimitBytes: true, storageExceededAt: true },
  })

  const overLimit = total > user.storageLimitBytes
  const storageExceededAt = overLimit
    ? (user.storageExceededAt ?? new Date())
    : null

  await prisma.user.update({
    where: { id: userId },
    data: { storageUsedBytes: total, storageExceededAt },
  })

  return { usedBytes: total, limitBytes: user.storageLimitBytes, overLimit }
}

export async function getUserStorageInfo(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { storageUsedBytes: true, storageLimitBytes: true, storageExceededAt: true },
  })
  const daysRemaining = user.storageExceededAt
    ? Math.max(0, Math.ceil((GRACE_PERIOD_MS - (Date.now() - user.storageExceededAt.getTime())) / (24 * 60 * 60 * 1000)))
    : null
  return {
    usedBytes: user.storageUsedBytes,
    limitBytes: user.storageLimitBytes,
    percent: Math.min(100, (user.storageUsedBytes / user.storageLimitBytes) * 100),
    exceededAt: user.storageExceededAt,
    daysRemaining,
  }
}

/**
 * Para usuarios que superaron el límite hace más de 30 días: borra los logos de
 * presupuestos más antiguos primero (protege ReciboConfig/PresupuestoTemplate,
 * que son la marca activa del usuario) hasta volver a estar bajo el límite.
 */
export async function enforceStorageLimits() {
  const cutoff = new Date(Date.now() - GRACE_PERIOD_MS)
  const users = await prisma.user.findMany({
    where: { storageExceededAt: { lte: cutoff } },
    select: { id: true, storageLimitBytes: true },
  })

  const results: { userId: string; freedBytes: number; deletedCount: number }[] = []

  for (const user of users) {
    const presupuestos = await prisma.presupuesto.findMany({
      where: { userId: user.id, logoUrl: { not: null } },
      select: { id: true, logoUrl: true },
      orderBy: { createdAt: 'asc' },
    })

    let { usedBytes } = await recalcUserStorage(user.id)
    let freedBytes = 0
    let deletedCount = 0

    for (const p of presupuestos) {
      if (usedBytes <= user.storageLimitBytes) break
      const size = estimateFileBytes(p.logoUrl)
      await prisma.presupuesto.update({ where: { id: p.id }, data: { logoUrl: null } })
      usedBytes -= size
      freedBytes += size
      deletedCount++
    }

    await recalcUserStorage(user.id)
    results.push({ userId: user.id, freedBytes, deletedCount })
  }

  return results
}
