'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  calcularHoras,
  detectarEstado,
  PALETA_EMPLEADO,
  type AsistenciaEstado,
  type Empleado,
  type RegistroAsistencia,
} from '@/types/asistencia'

const db = prisma as any

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user.id
}

function maybeTrim(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function maybeNull(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

// Paleta rotativa para diferenciar empleados por color en la agenda de turnos.

async function siguienteColor(userId: string): Promise<string> {
  const total = await db.empleado.count({ where: { userId } })
  return PALETA_EMPLEADO[total % PALETA_EMPLEADO.length]
}

function toEmpleado(empleado: any): Empleado {
  return {
    id: empleado.id,
    userId: empleado.userId,
    nombre: empleado.nombre,
    apellido: empleado.apellido ?? null,
    cargo: empleado.cargo ?? null,
    turnoInicio: empleado.turnoInicio ?? null,
    turnoFin: empleado.turnoFin ?? null,
    tolerancia: empleado.tolerancia,
    color: empleado.color ?? '#5448EE',
    activo: empleado.activo,
    createdAt: empleado.createdAt.toISOString(),
    updatedAt: empleado.updatedAt.toISOString(),
  }
}

function toRegistro(registro: any): RegistroAsistencia {
  return {
    id: registro.id,
    userId: registro.userId,
    empleadoId: registro.empleadoId,
    fecha: registro.fecha,
    horaEntrada: registro.horaEntrada ?? null,
    horaSalida: registro.horaSalida ?? null,
    horasTrabajadas: registro.horasTrabajadas ?? null,
    estado: registro.estado as AsistenciaEstado,
    notas: registro.notas ?? null,
    createdAt: registro.createdAt.toISOString(),
    updatedAt: registro.updatedAt.toISOString(),
    empleado: registro.empleado ? toEmpleado(registro.empleado) : null,
  }
}

export async function getEmpleados(): Promise<Empleado[]> {
  const userId = await getUserId()
  const empleados = await db.empleado.findMany({
    where: { userId, activo: true },
    orderBy: { nombre: 'asc' },
  })
  return empleados.map(toEmpleado)
}

export async function getEmpleado(id: string): Promise<Empleado | null> {
  const userId = await getUserId()
  const empleado = await db.empleado.findFirst({ where: { id, userId } })
  return empleado ? toEmpleado(empleado) : null
}

export async function crearEmpleado(data: {
  nombre: string
  cargo?: string
  turnoInicio?: string
  turnoFin?: string
  tolerancia?: number
  color?: string
}): Promise<Empleado> {
  const userId = await getUserId()
  const color = data.color && PALETA_EMPLEADO.includes(data.color) ? data.color : await siguienteColor(userId)
  const empleado = await db.empleado.create({
    data: {
      userId,
      nombre: data.nombre.trim(),
      cargo: maybeTrim(data.cargo),
      turnoInicio: maybeTrim(data.turnoInicio),
      turnoFin: maybeTrim(data.turnoFin),
      tolerancia: data.tolerancia ?? 15,
      color,
    },
  })
  revalidatePath('/dashboard/asistencia')
  revalidatePath('/dashboard/asistencia/empleados')
  return toEmpleado(empleado)
}

export async function editarEmpleado(id: string, data: Partial<{
  nombre: string
  cargo?: string
  turnoInicio?: string
  turnoFin?: string
  tolerancia?: number
  color?: string
}>): Promise<Empleado> {
  const userId = await getUserId()
  const existente = await db.empleado.findFirst({ where: { id, userId } })
  if (!existente) throw new Error('Empleado no encontrado')

  const color = data.color && PALETA_EMPLEADO.includes(data.color) ? data.color : undefined

  const empleado = await db.empleado.update({
    where: { id },
    data: {
      nombre: data.nombre?.trim() || existente.nombre,
      cargo: data.cargo === undefined ? undefined : maybeNull(data.cargo),
      turnoInicio: data.turnoInicio === undefined ? undefined : maybeNull(data.turnoInicio),
      turnoFin: data.turnoFin === undefined ? undefined : maybeNull(data.turnoFin),
      tolerancia: data.tolerancia,
      color,
    },
  })
  revalidatePath('/dashboard/asistencia')
  revalidatePath('/dashboard/asistencia/empleados')
  return toEmpleado(empleado)
}

export async function eliminarEmpleado(id: string): Promise<void> {
  const userId = await getUserId()
  await db.empleado.updateMany({
    where: { id, userId },
    data: { activo: false },
  })
  revalidatePath('/dashboard/asistencia')
  revalidatePath('/dashboard/asistencia/empleados')
}

export async function getRegistrosDia(fecha: string): Promise<RegistroAsistencia[]> {
  const userId = await getUserId()
  const registros = await db.registroAsistencia.findMany({
    where: { userId, fecha },
    include: { empleado: true },
    orderBy: { empleado: { nombre: 'asc' } },
  })
  return registros.map(toRegistro)
}

export async function getRegistrosEmpleado(
  empleadoId: string,
  desde: string,
  hasta: string,
): Promise<RegistroAsistencia[]> {
  const userId = await getUserId()
  const where = empleadoId
    ? { empleadoId, userId, fecha: { gte: desde, lte: hasta } }
    : { userId, fecha: { gte: desde, lte: hasta } }

  const registros = await db.registroAsistencia.findMany({
    where,
    include: { empleado: true },
    orderBy: [{ fecha: 'desc' }, { empleado: { nombre: 'asc' } }],
  })
  return registros.map(toRegistro)
}

export async function getResumenPeriodo(desde: string, hasta: string): Promise<Array<{
  empleado: Empleado
  presentes: number
  tardanzas: number
  ausentes: number
  medioDia: number
  libres: number
  totalHoras: number
}>> {
  const [empleados, registros] = await Promise.all([
    getEmpleados(),
    getRegistrosEmpleado('', desde, hasta),
  ])

  const registrosPorEmpleado = new Map<string, RegistroAsistencia[]>()
  for (const registro of registros) {
    const current = registrosPorEmpleado.get(registro.empleadoId) ?? []
    current.push(registro)
    registrosPorEmpleado.set(registro.empleadoId, current)
  }

  return empleados
    .map((empleado) => {
      const items = registrosPorEmpleado.get(empleado.id) ?? []
      return {
        empleado,
        presentes: items.filter((item) => item.estado === 'presente').length,
        tardanzas: items.filter((item) => item.estado === 'tardanza').length,
        ausentes: items.filter((item) => item.estado === 'ausente').length,
        medioDia: items.filter((item) => item.estado === 'medio_dia').length,
        libres: items.filter((item) => item.estado === 'libre').length,
        totalHoras: items.reduce((sum, item) => sum + (item.horasTrabajadas ?? 0), 0),
      }
    })
    .sort((a, b) => a.empleado.nombre.localeCompare(b.empleado.nombre))
}

export async function registrarEntrada(
  empleadoId: string,
  fecha: string,
  horaEntrada: string,
  notas?: string,
): Promise<RegistroAsistencia> {
  const userId = await getUserId()
  const empleado = await db.empleado.findFirst({ where: { id: empleadoId, userId } })
  if (!empleado) throw new Error('Empleado no encontrado')

  const empleadoSerializable = toEmpleado(empleado)
  const estado = detectarEstado(empleadoSerializable, horaEntrada, null)

  const registro = await db.registroAsistencia.upsert({
    where: { empleadoId_fecha: { empleadoId, fecha } },
    create: {
      userId,
      empleadoId,
      fecha,
      horaEntrada,
      estado,
      notas: maybeTrim(notas),
    },
    update: {
      horaEntrada,
      estado,
      notas: notas === undefined ? undefined : maybeNull(notas),
    },
    include: { empleado: true },
  })

  revalidatePath('/dashboard/asistencia')
  return toRegistro(registro)
}

export async function registrarSalida(registroId: string, horaSalida: string): Promise<RegistroAsistencia> {
  const userId = await getUserId()
  const registro = await db.registroAsistencia.findFirst({
    where: { id: registroId, userId },
    include: { empleado: true },
  })
  if (!registro || !registro.empleado) throw new Error('Registro no encontrado')

  const horasTrabajadas = calcularHoras(registro.horaEntrada ?? null, horaSalida)
  const estado = detectarEstado(
    toEmpleado(registro.empleado),
    registro.horaEntrada ?? null,
    horaSalida,
  )

  const updated = await db.registroAsistencia.update({
    where: { id: registroId },
    data: { horaSalida, horasTrabajadas, estado },
    include: { empleado: true },
  })

  revalidatePath('/dashboard/asistencia')
  revalidatePath('/dashboard/asistencia/historial')
  return toRegistro(updated)
}

export async function registrarAusencia(
  empleadoId: string,
  fecha: string,
  estado: 'ausente' | 'libre',
  notas?: string,
): Promise<RegistroAsistencia> {
  const userId = await getUserId()
  const empleado = await db.empleado.findFirst({ where: { id: empleadoId, userId } })
  if (!empleado) throw new Error('Empleado no encontrado')

  const registro = await db.registroAsistencia.upsert({
    where: { empleadoId_fecha: { empleadoId, fecha } },
    create: {
      userId,
      empleadoId,
      fecha,
      estado,
      notas: maybeTrim(notas),
    },
    update: {
      horaEntrada: null,
      horaSalida: null,
      horasTrabajadas: null,
      estado,
      notas: notas === undefined ? undefined : maybeNull(notas),
    },
    include: { empleado: true },
  })
  revalidatePath('/dashboard/asistencia')
  return toRegistro(registro)
}

export async function editarRegistro(registroId: string, data: {
  horaEntrada?: string
  horaSalida?: string
  estado?: AsistenciaEstado
  notas?: string
}): Promise<RegistroAsistencia> {
  const userId = await getUserId()
  const registro = await db.registroAsistencia.findFirst({
    where: { id: registroId, userId },
    include: { empleado: true },
  })
  if (!registro || !registro.empleado) throw new Error('Registro no encontrado')

  const horaEntrada = data.horaEntrada ?? registro.horaEntrada ?? null
  const horaSalida = data.horaSalida ?? registro.horaSalida ?? null
  const horasTrabajadas = calcularHoras(horaEntrada, horaSalida)
  const estado = data.estado ?? detectarEstado(toEmpleado(registro.empleado), horaEntrada, horaSalida)

  const updated = await db.registroAsistencia.update({
    where: { id: registroId },
    data: {
      horaEntrada: data.horaEntrada,
      horaSalida: data.horaSalida,
      horasTrabajadas,
      estado,
      notas: data.notas === undefined ? undefined : maybeNull(data.notas),
    },
    include: { empleado: true },
  })

  revalidatePath('/dashboard/asistencia')
  revalidatePath('/dashboard/asistencia/historial')
  return toRegistro(updated)
}

export async function eliminarRegistro(registroId: string): Promise<void> {
  const userId = await getUserId()
  const registro = await db.registroAsistencia.findFirst({ where: { id: registroId, userId } })
  if (!registro) throw new Error('Registro no encontrado')
  await db.registroAsistencia.delete({ where: { id: registroId } })
  revalidatePath('/dashboard/asistencia')
  revalidatePath('/dashboard/asistencia/historial')
}

export async function registrarDiaBulk(fecha: string, registros: Array<{
  empleadoId: string
  horaEntrada?: string
  estado: AsistenciaEstado
  notas?: string
}>): Promise<void> {
  const userId = await getUserId()
  const empleados = await db.empleado.findMany({
    where: { userId, id: { in: registros.map((registro) => registro.empleadoId) } },
  })
  const empleadosMap = new Map(empleados.map((empleado: any) => [empleado.id, toEmpleado(empleado)]))

  const validos = registros.filter((registro) => empleadosMap.has(registro.empleadoId))

  await db.$transaction(
    validos.map((registro) => {
      const empleado = empleadosMap.get(registro.empleadoId) as Empleado | undefined
      const estado = registro.horaEntrada && empleado
        ? detectarEstado(empleado, registro.horaEntrada, null)
        : registro.estado

      return db.registroAsistencia.upsert({
        where: { empleadoId_fecha: { empleadoId: registro.empleadoId, fecha } },
        create: {
          userId,
          empleadoId: registro.empleadoId,
          fecha,
          horaEntrada: registro.horaEntrada ?? null,
          estado,
          notas: maybeTrim(registro.notas),
        },
        update: {
          horaEntrada: registro.horaEntrada ?? null,
          horaSalida: null,
          horasTrabajadas: null,
          estado,
          notas: registro.notas === undefined ? undefined : maybeNull(registro.notas),
        },
      })
    }),
  )

  revalidatePath('/dashboard/asistencia')
}
