'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  CONFIG_DEFAULT,
  seSuperponen,
  sumarMinutos,
  type EmpleadoTurno,
  type Turno,
  type TurnoConfig,
  type TurnoEstado,
  type TurnoServicio,
} from '@/types/turno'

const db = prisma as any

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user.id
}

function maybeNull(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toConfig(raw: any | null, userId: string): TurnoConfig {
  if (!raw) {
    return {
      id: '',
      userId,
      ...CONFIG_DEFAULT,
      createdAt: '',
      updatedAt: '',
    }
  }

  return {
    id: raw.id,
    userId: raw.userId,
    horaInicio: raw.horaInicio,
    horaFin: raw.horaFin,
    intervalo: raw.intervalo,
    diasHabiles: JSON.parse(raw.diasHabiles),
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  }
}

function toServicio(raw: any): TurnoServicio {
  return {
    id: raw.id,
    userId: raw.userId,
    nombre: raw.nombre,
    duracion: raw.duracion,
    precio: raw.precio,
    color: raw.color,
    activo: raw.activo,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  }
}

function toEmpleado(raw: any): EmpleadoTurno {
  return {
    id: raw.id,
    userId: raw.userId,
    nombre: raw.nombre,
    apellido: raw.apellido ?? null,
  }
}

function toTurno(raw: any): Turno {
  return {
    id: raw.id,
    userId: raw.userId,
    servicioId: raw.servicioId ?? null,
    empleadoId: raw.empleadoId ?? null,
    clienteNombre: raw.clienteNombre,
    clienteTel: raw.clienteTel ?? null,
    clienteEmail: raw.clienteEmail ?? null,
    fecha: raw.fecha,
    horaInicio: raw.horaInicio,
    horaFin: raw.horaFin,
    duracion: raw.duracion,
    precio: raw.precio,
    senia: raw.senia ?? 0,
    seniaPagada: raw.seniaPagada ?? false,
    estado: raw.estado as TurnoEstado,
    notas: raw.notas ?? null,
    proximoRecordatorio: raw.proximoRecordatorio ?? null,
    recordatorioEnviado: raw.recordatorioEnviado ?? false,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    servicio: raw.servicio ? toServicio(raw.servicio) : null,
    empleado: raw.empleado ? toEmpleado(raw.empleado) : null,
  }
}

async function verificarSuperposicion(
  userId: string,
  fecha: string,
  nuevo: { horaInicio: string; horaFin: string; empleadoId?: string | null },
  excludeId?: string,
) {
  const turnos = await db.turno.findMany({
    where: {
      userId,
      fecha,
      estado: { not: 'cancelado' },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    orderBy: { horaInicio: 'asc' },
  })

  const conflicto = turnos.find((turno: any) => {
    if (!seSuperponen(nuevo, turno)) return false
    // Sin empleado asignado: se considera que comparte el mismo recurso físico.
    if (!nuevo.empleadoId || !turno.empleadoId) return true
    // Mismo empleado: conflicto. Distinto empleado: válido.
    return nuevo.empleadoId === turno.empleadoId
  })

  if (conflicto) {
    const mensaje = nuevo.empleadoId && conflicto.empleadoId && nuevo.empleadoId === conflicto.empleadoId
      ? 'Horario no disponible para este empleado'
      : 'Horario no disponible'
    throw new Error(mensaje)
  }
}

export async function getConfig(): Promise<TurnoConfig> {
  const userId = await getUserId()
  const config = await db.turnoConfig.findUnique({ where: { userId } })
  return toConfig(config, userId)
}

export async function guardarConfig(data: {
  horaInicio: string
  horaFin: string
  intervalo: number
  diasHabiles: number[]
}): Promise<void> {
  const userId = await getUserId()
  await db.turnoConfig.upsert({
    where: { userId },
    create: {
      userId,
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      intervalo: data.intervalo,
      diasHabiles: JSON.stringify(data.diasHabiles),
    },
    update: {
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      intervalo: data.intervalo,
      diasHabiles: JSON.stringify(data.diasHabiles),
    },
  })

  revalidatePath('/dashboard/turnos')
  revalidatePath('/dashboard/turnos/config')
}

export async function getServicios(): Promise<TurnoServicio[]> {
  const userId = await getUserId()
  const servicios = await db.turnoServicio.findMany({
    where: { userId, activo: true },
    orderBy: { nombre: 'asc' },
  })
  return servicios.map(toServicio)
}

export async function getEmpleados(): Promise<EmpleadoTurno[]> {
  const userId = await getUserId()
  const empleados = await db.empleado.findMany({
    where: { userId, activo: true },
    orderBy: [{ nombre: 'asc' }, { apellido: 'asc' }],
  })
  return empleados.map(toEmpleado)
}

export async function crearServicio(data: {
  nombre: string
  duracion: number
  precio?: number
  color?: string
}): Promise<TurnoServicio> {
  const userId = await getUserId()
  const servicio = await db.turnoServicio.create({
    data: {
      userId,
      nombre: data.nombre.trim(),
      duracion: data.duracion,
      precio: data.precio ?? 0,
      color: data.color ?? '#5448EE',
    },
  })
  revalidatePath('/dashboard/turnos')
  revalidatePath('/dashboard/turnos/servicios')
  return toServicio(servicio)
}

export async function editarServicio(id: string, data: Partial<{
  nombre: string
  duracion: number
  precio: number
  color: string
}>): Promise<TurnoServicio> {
  const userId = await getUserId()
  const actual = await db.turnoServicio.findFirst({ where: { id, userId, activo: true } })
  if (!actual) throw new Error('Servicio no encontrado')

  const servicio = await db.turnoServicio.update({
    where: { id },
    data: {
      nombre: data.nombre?.trim() ?? undefined,
      duracion: data.duracion ?? undefined,
      precio: data.precio ?? undefined,
      color: data.color ?? undefined,
    },
  })

  revalidatePath('/dashboard/turnos')
  revalidatePath('/dashboard/turnos/servicios')
  return toServicio(servicio)
}

export async function eliminarServicio(id: string): Promise<void> {
  const userId = await getUserId()
  const actual = await db.turnoServicio.findFirst({ where: { id, userId, activo: true } })
  if (!actual) throw new Error('Servicio no encontrado')
  await db.turnoServicio.update({ where: { id }, data: { activo: false } })
  revalidatePath('/dashboard/turnos')
  revalidatePath('/dashboard/turnos/servicios')
}

export async function getTurnos(fecha: string): Promise<Turno[]> {
  const userId = await getUserId()
  const turnos = await db.turno.findMany({
    where: { userId, fecha, estado: { not: 'cancelado' } },
    include: { servicio: true, empleado: true },
    orderBy: { horaInicio: 'asc' },
  })
  return turnos.map(toTurno)
}

export async function getTurnosSemana(desde: string, hasta: string): Promise<Turno[]> {
  const userId = await getUserId()
  const turnos = await db.turno.findMany({
    where: { userId, fecha: { gte: desde, lte: hasta }, estado: { not: 'cancelado' } },
    include: { servicio: true, empleado: true },
    orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
  })
  return turnos.map(toTurno)
}

export async function getTurno(id: string): Promise<Turno | null> {
  const userId = await getUserId()
  const turno = await db.turno.findFirst({
    where: { id, userId },
    include: { servicio: true, empleado: true },
  })
  return turno ? toTurno(turno) : null
}

export async function crearTurno(data: {
  servicioId?: string
  empleadoId?: string
  clienteNombre: string
  clienteTel?: string
  clienteEmail?: string
  fecha: string
  horaInicio: string
  duracion: number
  precio?: number
  senia?: number
  notas?: string
}): Promise<void> {
  const userId = await getUserId()
  const empleadoId = data.empleadoId?.trim() || null
  const horaFin = sumarMinutos(data.horaInicio, data.duracion)
  await verificarSuperposicion(userId, data.fecha, { horaInicio: data.horaInicio, horaFin, empleadoId })

  await db.turno.create({
    data: {
      userId,
      servicioId: data.servicioId?.trim() || null,
      empleadoId,
      clienteNombre: data.clienteNombre.trim(),
      clienteTel: maybeNull(data.clienteTel),
      clienteEmail: maybeNull(data.clienteEmail),
      fecha: data.fecha,
      horaInicio: data.horaInicio,
      horaFin,
      duracion: data.duracion,
      precio: data.precio ?? 0,
      senia: data.senia ?? 0,
      notas: maybeNull(data.notas),
      estado: 'pendiente',
    },
  })

  revalidatePath('/dashboard/turnos')
  redirect(`/dashboard/turnos?fecha=${data.fecha}`)
}

export async function editarTurno(id: string, data: Partial<{
  servicioId?: string
  empleadoId?: string
  clienteNombre: string
  clienteTel?: string
  clienteEmail?: string
  fecha: string
  horaInicio: string
  duracion: number
  precio?: number
  senia?: number
  seniaPagada?: boolean
  notas?: string
}>): Promise<void> {
  const userId = await getUserId()
  const actual = await db.turno.findFirst({ where: { id, userId }, include: { servicio: true, empleado: true } })
  if (!actual) throw new Error('Turno no encontrado')

  const fecha = data.fecha ?? actual.fecha
  const horaInicio = data.horaInicio ?? actual.horaInicio
  const duracion = data.duracion ?? actual.duracion
  const empleadoId = data.empleadoId === undefined ? actual.empleadoId : (data.empleadoId.trim() || null)
  const horaFin = sumarMinutos(horaInicio, duracion)

  if (
    fecha !== actual.fecha ||
    horaInicio !== actual.horaInicio ||
    duracion !== actual.duracion ||
    empleadoId !== actual.empleadoId
  ) {
    await verificarSuperposicion(userId, fecha, { horaInicio, horaFin, empleadoId }, id)
  }

  await db.turno.update({
    where: { id },
    data: {
      servicioId: data.servicioId === undefined ? undefined : (data.servicioId.trim() || null),
      empleadoId,
      clienteNombre: data.clienteNombre?.trim() ?? undefined,
      clienteTel: data.clienteTel === undefined ? undefined : maybeNull(data.clienteTel),
      clienteEmail: data.clienteEmail === undefined ? undefined : maybeNull(data.clienteEmail),
      fecha,
      horaInicio,
      horaFin,
      duracion,
      precio: data.precio ?? undefined,
      senia: data.senia === undefined ? undefined : data.senia,
      seniaPagada: data.seniaPagada === undefined ? undefined : data.seniaPagada,
      notas: data.notas === undefined ? undefined : maybeNull(data.notas),
    },
  })

  revalidatePath('/dashboard/turnos')
  revalidatePath(`/dashboard/turnos/${id}`)
  redirect(`/dashboard/turnos/${id}`)
}

export async function cambiarEstado(id: string, estado: TurnoEstado, proximoRecordatorio?: string): Promise<void> {
  const userId = await getUserId()
  const actual = await db.turno.findFirst({ where: { id, userId } })
  if (!actual) throw new Error('Turno no encontrado')

  const updateData: any = { estado }
  if (estado === 'completado' && proximoRecordatorio?.trim()) {
    updateData.proximoRecordatorio = proximoRecordatorio.trim()
  }

  await db.turno.update({ where: { id }, data: updateData })
  revalidatePath('/dashboard/turnos')
  revalidatePath(`/dashboard/turnos/${id}`)
}

export async function eliminarTurno(id: string): Promise<void> {
  const userId = await getUserId()
  const actual = await db.turno.findFirst({ where: { id, userId } })
  if (!actual) throw new Error('Turno no encontrado')
  await db.turno.delete({ where: { id } })
  revalidatePath('/dashboard/turnos')
  redirect('/dashboard/turnos')
}

export async function getRecordatoriosPendientes(fecha: string): Promise<Turno[]> {
  const userId = await getUserId()
  const turnos = await db.turno.findMany({
    where: {
      userId,
      fecha,
      estado: { in: ['pendiente', 'confirmado'] },
      recordatorioEnviado: false,
      clienteTel: { not: null },
    },
    include: { servicio: true, empleado: true },
    orderBy: { horaInicio: 'asc' },
  })
  return turnos.map(toTurno)
}

export async function marcarRecordatorioEnviado(id: string): Promise<void> {
  const userId = await getUserId()
  const actual = await db.turno.findFirst({ where: { id, userId } })
  if (!actual) throw new Error('Turno no encontrado')
  await db.turno.update({ where: { id }, data: { recordatorioEnviado: true } })
  revalidatePath('/dashboard/turnos')
  revalidatePath(`/dashboard/turnos/${id}`)
}

export async function getStatsSemana(desde: string, hasta: string): Promise<{
  total: number
  confirmados: number
  cancelados: number
  ingresoEstimado: number
}> {
  const userId = await getUserId()
  const turnos = await db.turno.findMany({
    where: { userId, fecha: { gte: desde, lte: hasta } },
  })

  return {
    total: turnos.length,
    confirmados: turnos.filter((turno: any) => turno.estado === 'confirmado').length,
    cancelados: turnos.filter((turno: any) => turno.estado === 'cancelado').length,
    ingresoEstimado: turnos
      .filter((turno: any) => turno.estado !== 'cancelado')
      .reduce((sum: number, turno: any) => sum + turno.precio, 0),
  }
}
