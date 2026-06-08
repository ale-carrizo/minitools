'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  calcularItem,
  type EmpleadoMin,
  type Liquidacion,
  type LiquidacionEstado,
  type LiquidacionItem,
} from '@/types/liquidacion'

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

function toEmpleadoMin(raw: any): EmpleadoMin {
  return {
    id: raw.id,
    nombre: raw.nombre ?? '',
    apellido: raw.apellido ?? '',
    cuil: raw.cuil ?? null,
    salarioBasico: raw.salarioBasico ?? null,
    categoriaLaboral: raw.categoriaLaboral ?? null,
  }
}

function toItem(raw: any): LiquidacionItem {
  return {
    id: raw.id,
    liquidacionId: raw.liquidacionId,
    empleadoId: raw.empleadoId ?? null,
    empleadoNombre: raw.empleadoNombre,
    empleadoCuil: raw.empleadoCuil ?? null,
    categoria: raw.categoria ?? null,
    salarioBruto: raw.salarioBruto,
    diasTrabajados: raw.diasTrabajados,
    diasHabiles: raw.diasHabiles,
    salarioCalculado: raw.salarioCalculado,
    horasExtraMonto: raw.horasExtraMonto,
    adicionalesMonto: raw.adicionalesMonto,
    totalBruto: raw.totalBruto,
    jubilacionEmpl: raw.jubilacionEmpl,
    obraSocialEmpl: raw.obraSocialEmpl,
    pamiEmpl: raw.pamiEmpl,
    otrasDeduccs: raw.otrasDeduccs,
    totalDeduccs: raw.totalDeduccs,
    netoAPagar: raw.netoAPagar,
    jubilacionEmp: raw.jubilacionEmp,
    fne: raw.fne,
    obraSocialEmp: raw.obraSocialEmp,
    artMonto: raw.artMonto,
    totalContribEmp: raw.totalContribEmp,
    costoTotalEmp: raw.costoTotalEmp,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    empleado: raw.empleado ? toEmpleadoMin(raw.empleado) : null,
  }
}

function toLiquidacion(raw: any): Liquidacion {
  return {
    id: raw.id,
    userId: raw.userId,
    periodo: raw.periodo,
    estado: raw.estado as LiquidacionEstado,
    notas: raw.notas ?? null,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    items: Array.isArray(raw.items) ? raw.items.map(toItem) : [],
  }
}

export async function getEmpleadosConSueldo(): Promise<EmpleadoMin[]> {
  const userId = await getUserId()
  try {
    const empleados = await db.empleado.findMany({
      where: { userId, activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        cuil: true,
        salarioBasico: true,
        categoriaLaboral: true,
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    })
    return empleados.map(toEmpleadoMin)
  } catch {
    return []
  }
}

export async function actualizarSueldo(empleadoId: string, data: {
  salarioBasico: number
  categoriaLaboral?: string
}): Promise<void> {
  const userId = await getUserId()
  const empleado = await db.empleado.findFirst({ where: { id: empleadoId, userId } })
  if (!empleado) throw new Error('Empleado no encontrado')
  await db.empleado.update({
    where: { id: empleadoId },
    data: {
      salarioBasico: data.salarioBasico,
      categoriaLaboral: maybeNull(data.categoriaLaboral),
    },
  })
  revalidatePath('/dashboard/liquidacion')
  revalidatePath('/dashboard/liquidacion/empleados')
}

export async function getLiquidaciones(): Promise<Array<Liquidacion & { _count: { items: number } }>> {
  const userId = await getUserId()
  const liquidaciones = await db.liquidacion.findMany({
    where: { userId },
    include: { _count: { select: { items: true } } },
    orderBy: { periodo: 'desc' },
  })
  return liquidaciones.map((liquidacion: any) => ({
    ...toLiquidacion(liquidacion),
    _count: liquidacion._count,
  }))
}

export async function getLiquidacion(id: string): Promise<Liquidacion | null> {
  const userId = await getUserId()
  const liquidacion = await db.liquidacion.findFirst({
    where: { id, userId },
    include: {
      items: {
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              cuil: true,
              salarioBasico: true,
              categoriaLaboral: true,
            },
          },
        },
        orderBy: { empleadoNombre: 'asc' },
      },
    },
  })
  return liquidacion ? toLiquidacion(liquidacion) : null
}

export async function crearLiquidacion(periodo: string): Promise<Liquidacion> {
  const userId = await getUserId()
  let nueva: any
  try {
    nueva = await db.liquidacion.create({
      data: { userId, periodo, estado: 'borrador' },
      include: { items: true },
    })
  } catch (error: any) {
    if (error?.code === 'P2002') throw new Error('Ya existe una liquidación para ese período')
    throw error
  }
  revalidatePath('/dashboard/liquidacion')
  redirect(`/dashboard/liquidacion/${nueva.id}`)
}

export async function cerrarLiquidacion(id: string): Promise<void> {
  const userId = await getUserId()
  const liquidacion = await db.liquidacion.findFirst({ where: { id, userId } })
  if (!liquidacion) throw new Error('Liquidación no encontrada')
  await db.liquidacion.update({ where: { id }, data: { estado: 'cerrada' } })
  revalidatePath('/dashboard/liquidacion')
  revalidatePath(`/dashboard/liquidacion/${id}`)
}

export async function reabrirLiquidacion(id: string): Promise<void> {
  const userId = await getUserId()
  const liquidacion = await db.liquidacion.findFirst({ where: { id, userId } })
  if (!liquidacion) throw new Error('Liquidación no encontrada')
  await db.liquidacion.update({ where: { id }, data: { estado: 'borrador' } })
  revalidatePath('/dashboard/liquidacion')
  revalidatePath(`/dashboard/liquidacion/${id}`)
}

export async function eliminarLiquidacion(id: string): Promise<void> {
  const userId = await getUserId()
  const liquidacion = await db.liquidacion.findFirst({ where: { id, userId } })
  if (!liquidacion) throw new Error('Liquidación no encontrada')
  await db.liquidacionItem.deleteMany({ where: { liquidacionId: id, userId } })
  await db.liquidacion.delete({ where: { id } })
  revalidatePath('/dashboard/liquidacion')
  redirect('/dashboard/liquidacion')
}

export async function agregarItem(liquidacionId: string, data: {
  empleadoId?: string
  empleadoNombre: string
  empleadoCuil?: string
  categoria?: string
  salarioBruto: number
  diasTrabajados: number
  diasHabiles: number
  horasExtraMonto: number
  adicionalesMonto: number
  otrasDeduccs: number
  artPorcentaje: number
}): Promise<void> {
  const userId = await getUserId()
  const liquidacion = await db.liquidacion.findFirst({ where: { id: liquidacionId, userId } })
  if (!liquidacion) throw new Error('Liquidación no encontrada')
  const calc = calcularItem(data)
  await db.liquidacionItem.create({
    data: {
      userId,
      liquidacionId,
      empleadoId: maybeTrim(data.empleadoId) ?? null,
      empleadoNombre: data.empleadoNombre.trim(),
      empleadoCuil: maybeTrim(data.empleadoCuil),
      categoria: maybeTrim(data.categoria),
      salarioBruto: data.salarioBruto,
      diasTrabajados: data.diasTrabajados,
      diasHabiles: data.diasHabiles,
      salarioCalculado: calc.salarioCalculado,
      horasExtraMonto: data.horasExtraMonto,
      adicionalesMonto: data.adicionalesMonto,
      totalBruto: calc.totalBruto,
      jubilacionEmpl: calc.jubilacionEmpl,
      obraSocialEmpl: calc.obraSocialEmpl,
      pamiEmpl: calc.pamiEmpl,
      otrasDeduccs: data.otrasDeduccs,
      totalDeduccs: calc.totalDeduccs,
      netoAPagar: calc.netoAPagar,
      jubilacionEmp: calc.jubilacionEmp,
      fne: calc.fne,
      obraSocialEmp: calc.obraSocialEmp,
      artMonto: calc.artMonto,
      totalContribEmp: calc.totalContribEmp,
      costoTotalEmp: calc.costoTotalEmp,
    },
  })
  revalidatePath(`/dashboard/liquidacion/${liquidacionId}`)
}

export async function editarItem(itemId: string, data: {
  empleadoId?: string
  empleadoNombre: string
  empleadoCuil?: string
  categoria?: string
  salarioBruto: number
  diasTrabajados: number
  diasHabiles: number
  horasExtraMonto: number
  adicionalesMonto: number
  otrasDeduccs: number
  artPorcentaje: number
}): Promise<void> {
  const userId = await getUserId()
  const item = await db.liquidacionItem.findFirst({ where: { id: itemId, userId } })
  if (!item) throw new Error('Item no encontrado')
  const calc = calcularItem(data)
  await db.liquidacionItem.update({
    where: { id: itemId },
    data: {
      empleadoId: maybeTrim(data.empleadoId) ?? null,
      empleadoNombre: data.empleadoNombre.trim(),
      empleadoCuil: maybeTrim(data.empleadoCuil),
      categoria: maybeTrim(data.categoria),
      salarioBruto: data.salarioBruto,
      diasTrabajados: data.diasTrabajados,
      diasHabiles: data.diasHabiles,
      salarioCalculado: calc.salarioCalculado,
      horasExtraMonto: data.horasExtraMonto,
      adicionalesMonto: data.adicionalesMonto,
      totalBruto: calc.totalBruto,
      jubilacionEmpl: calc.jubilacionEmpl,
      obraSocialEmpl: calc.obraSocialEmpl,
      pamiEmpl: calc.pamiEmpl,
      otrasDeduccs: data.otrasDeduccs,
      totalDeduccs: calc.totalDeduccs,
      netoAPagar: calc.netoAPagar,
      jubilacionEmp: calc.jubilacionEmp,
      fne: calc.fne,
      obraSocialEmp: calc.obraSocialEmp,
      artMonto: calc.artMonto,
      totalContribEmp: calc.totalContribEmp,
      costoTotalEmp: calc.costoTotalEmp,
    },
  })
  revalidatePath(`/dashboard/liquidacion/${item.liquidacionId}`)
}

export async function eliminarItem(itemId: string, liquidacionId: string): Promise<void> {
  const userId = await getUserId()
  const item = await db.liquidacionItem.findFirst({ where: { id: itemId, userId, liquidacionId } })
  if (!item) throw new Error('Item no encontrado')
  await db.liquidacionItem.delete({ where: { id: itemId } })
  revalidatePath(`/dashboard/liquidacion/${liquidacionId}`)
}
