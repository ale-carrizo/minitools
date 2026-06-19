'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { Tablero, Columna, Tarea, Prioridad } from '@/types/tareas'

async function uid() {
  const s = await auth()
  if (!s?.user?.id) throw new Error('No autenticado')
  return s.user.id
}

function mapTarea(r: any): Tarea {
  return {
    id: r.id, columnaId: r.columnaId, userId: r.userId,
    titulo: r.titulo, descripcion: r.descripcion,
    prioridad: r.prioridad as Prioridad,
    etiquetas: JSON.parse(r.etiquetas ?? '[]'),
    checklist: JSON.parse(r.checklist ?? '[]'),
    fechaVenc: r.fechaVenc, portada: r.portada,
    orden: r.orden, archivada: r.archivada,
    createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
    updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt,
  }
}

function mapColumna(r: any): Columna {
  return {
    id: r.id, tableroId: r.tableroId, nombre: r.nombre,
    orden: r.orden, color: r.color, limiteWip: r.limiteWip,
    tareas: (r.tareas ?? []).filter((t: any) => !t.archivada).sort((a: any, b: any) => a.orden - b.orden).map(mapTarea),
  }
}

function mapTablero(r: any): Tablero {
  return {
    id: r.id, userId: r.userId, nombre: r.nombre,
    descripcion: r.descripcion, color: r.color,
    columnas: (r.columnas ?? []).sort((a: any, b: any) => a.orden - b.orden).map(mapColumna),
    createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
    updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt,
  }
}

// ── Tableros ──────────────────────────────────────────────────────────────────

export async function getTableros(): Promise<Tablero[]> {
  const userId = await uid()
  const rows = await prisma.tablero.findMany({
    where: { userId },
    include: { columnas: { include: { tareas: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(mapTablero)
}

export async function getTablero(id: string): Promise<Tablero> {
  const userId = await uid()
  const r = await prisma.tablero.findFirst({
    where: { id, userId },
    include: { columnas: { include: { tareas: true } } },
  })
  if (!r) throw new Error('Tablero no encontrado')
  return mapTablero(r)
}

export async function createTablero(data: {
  nombre:      string
  descripcion?: string
  color?:      string
  columnas:    { nombre: string; color: string }[]
}): Promise<Tablero> {
  const userId = await uid()
  const r = await prisma.tablero.create({
    data: {
      userId,
      nombre:      data.nombre,
      descripcion: data.descripcion ?? null,
      color:       data.color ?? '#5448EE',
      columnas: {
        create: data.columnas.slice(0, 8).map((c, i) => ({
          nombre: c.nombre,
          color:  c.color,
          orden:  i,
        })),
      },
    },
    include: { columnas: { include: { tareas: true } } },
  })
  revalidatePath('/dashboard/tareas')
  return mapTablero(r)
}

export async function updateTablero(id: string, data: { nombre?: string; descripcion?: string; color?: string }): Promise<void> {
  const userId = await uid()
  await prisma.tablero.updateMany({ where: { id, userId }, data })
  revalidatePath('/dashboard/tareas')
}

export async function deleteTablero(id: string): Promise<void> {
  const userId = await uid()
  await prisma.tablero.deleteMany({ where: { id, userId } })
  revalidatePath('/dashboard/tareas')
}

// ── Columnas ──────────────────────────────────────────────────────────────────

export async function addColumna(tableroId: string, nombre: string, color: string): Promise<Columna> {
  const userId = await uid()
  const board = await prisma.tablero.findFirst({ where: { id: tableroId, userId }, include: { columnas: true } })
  if (!board) throw new Error('No autorizado')
  if (board.columnas.length >= 8) throw new Error('Máximo 8 columnas')
  const r = await prisma.columna.create({
    data: { tableroId, nombre, color, orden: board.columnas.length },
    include: { tareas: true },
  })
  revalidatePath(`/dashboard/tareas/${tableroId}`)
  return mapColumna(r)
}

export async function updateColumna(id: string, data: { nombre?: string; color?: string; limiteWip?: number | null }): Promise<void> {
  await prisma.columna.update({ where: { id }, data })
  revalidatePath('/dashboard/tareas')
}

export async function deleteColumna(id: string, tableroId: string): Promise<void> {
  await prisma.columna.delete({ where: { id } })
  revalidatePath(`/dashboard/tareas/${tableroId}`)
}

export async function reorderColumnas(tableroId: string, ids: string[]): Promise<void> {
  await Promise.all(ids.map((id, orden) => prisma.columna.update({ where: { id }, data: { orden } })))
  revalidatePath(`/dashboard/tareas/${tableroId}`)
}

// ── Tareas ────────────────────────────────────────────────────────────────────

export async function createTarea(data: {
  columnaId:   string
  titulo:      string
  prioridad?:  Prioridad
  fechaVenc?:  string
  portada?:    string
}): Promise<Tarea> {
  const userId = await uid()
  const count = await prisma.tarea.count({ where: { columnaId: data.columnaId } })
  const r = await prisma.tarea.create({
    data: {
      userId,
      columnaId:  data.columnaId,
      titulo:     data.titulo,
      prioridad:  data.prioridad ?? 'media',
      fechaVenc:  data.fechaVenc ?? null,
      portada:    data.portada ?? null,
      orden:      count,
    },
  })
  revalidatePath('/dashboard/tareas')
  return mapTarea(r)
}

export async function updateTarea(id: string, data: Partial<{
  titulo:      string
  descripcion: string | null
  prioridad:   Prioridad
  etiquetas:   string      // JSON
  checklist:   string      // JSON
  fechaVenc:   string | null
  portada:     string | null
  columnaId:   string
  orden:       number
  archivada:   boolean
}>): Promise<Tarea> {
  const r = await prisma.tarea.update({ where: { id }, data: { ...data, updatedAt: new Date() } })
  revalidatePath('/dashboard/tareas')
  return mapTarea(r)
}

export async function deleteTarea(id: string): Promise<void> {
  await prisma.tarea.delete({ where: { id } })
  revalidatePath('/dashboard/tareas')
}

export async function moverTarea(tareaId: string, destColumnaId: string, destOrden: number, tableroId: string): Promise<void> {
  // Shift tareas en destino
  await prisma.tarea.updateMany({
    where: { columnaId: destColumnaId, orden: { gte: destOrden }, archivada: false },
    data: { orden: { increment: 1 } },
  })
  await prisma.tarea.update({
    where: { id: tareaId },
    data: { columnaId: destColumnaId, orden: destOrden, updatedAt: new Date() },
  })
  revalidatePath(`/dashboard/tareas/${tableroId}`)
}
