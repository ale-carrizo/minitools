'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export interface ClienteSugerido {
  id: string
  nombre: string
  telefono: string | null
  origen: 'socio' | 'presupuesto'
}

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')
  return session.user.id
}

/**
 * Combina los clientes ya cargados en Socios (Clientes y Pagos) y en
 * Presupuestos para sugerirlos en el autocompletado de Turnos, Recibos,
 * Kanban y el propio Presupuestos. No crea ninguna relación nueva en la
 * base — es solo una lista de sugerencias de solo lectura.
 */
export async function getClientesSugeridos(): Promise<ClienteSugerido[]> {
  const userId = await getUserId()

  const [socios, clientes] = await Promise.all([
    prisma.socio.findMany({
      where: { userId, estado: { in: ['activo', 'suspendido'] } },
      select: { id: true, nombre: true, telefono: true },
      orderBy: { nombre: 'asc' },
    }),
    prisma.cliente.findMany({
      where: { userId, activo: true },
      select: { id: true, nombre: true, telefono: true },
      orderBy: { nombre: 'asc' },
    }),
  ])

  const combinados: ClienteSugerido[] = [
    ...socios.map((s) => ({ id: s.id, nombre: s.nombre, telefono: s.telefono, origen: 'socio' as const })),
    ...clientes.map((c) => ({ id: c.id, nombre: c.nombre, telefono: c.telefono, origen: 'presupuesto' as const })),
  ]

  // Puede ser la misma persona cargada en las dos apps — deduplicar por
  // nombre + teléfono (normalizado) para no sugerirla dos veces.
  const vistos = new Set<string>()
  const dedup: ClienteSugerido[] = []
  for (const c of combinados) {
    const clave = `${c.nombre.trim().toLowerCase()}|${(c.telefono ?? '').replace(/\D/g, '')}`
    if (vistos.has(clave)) continue
    vistos.add(clave)
    dedup.push(c)
  }

  return dedup.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}
