import { prisma } from '@/lib/prisma'

/**
 * Devuelve el template "en uso" del usuario. Si ninguno está marcado como
 * activo (ej. usuarios migrados desde el esquema 1-template-por-usuario),
 * se auto-cura marcando el más antiguo como activo.
 */
export async function getActiveTemplate(userId: string) {
  const activo = await prisma.presupuestoTemplate.findFirst({ where: { userId, activo: true } })
  if (activo) return activo

  const fallback = await prisma.presupuestoTemplate.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })
  if (!fallback) return null

  return prisma.presupuestoTemplate.update({ where: { id: fallback.id }, data: { activo: true } })
}
