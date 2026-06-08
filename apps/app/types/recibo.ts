export type ConceptoTipo = 'haber' | 'deduccion'

export interface Concepto {
  id: string
  tipo: ConceptoTipo
  descripcion: string
  monto: number
  esFijo: boolean
  porcentaje?: number
  base?: number
}

export type Modalidad = 'dependencia' | 'monotributista'

export interface ReciboConfig {
  id: string
  userId: string
  razonSocial: string
  cuit: string
  domicilio: string | null
  localidad: string | null
  actividad: string | null
  createdAt: string
  updatedAt: string
}

export interface Recibo {
  id: string
  userId: string
  empleadoId: string | null
  empNombre: string
  empCuil: string | null
  empCargo: string | null
  empFechaIngreso: string | null
  empModalidad: Modalidad
  periodo: string
  fechaPago: string
  conceptos: Concepto[]
  totalHaberes: number
  totalDeducciones: number
  netoAPagar: number
  nroFactura: string | null
  estado: 'borrador' | 'emitido'
  notas: string | null
  createdAt: string
  updatedAt: string
}

export const DEDUCCIONES_LEGALES = [
  { id: 'jubilacion', descripcion: 'Jubilación', porcentaje: 11 },
  { id: 'obra_social', descripcion: 'Obra Social', porcentaje: 3 },
  { id: 'pami', descripcion: 'PAMI / INSSJP', porcentaje: 3 },
] as const

export const HABERES_FRECUENTES = [
  'Sueldo básico',
  'Antigüedad',
  'Presentismo',
  'Horas extras 50%',
  'Horas extras 100%',
  'Viáticos',
  'Comisiones',
  'Premio productividad',
  'Asignación familiar',
  'Adicional por cargo',
] as const

export const DEDUCCIONES_FRECUENTES = [
  'Cuota sindical',
  'Adelanto de sueldo',
  'Seguro de vida obligatorio',
  'Descuento por inasistencia',
] as const

export function calcularTotales(conceptos: Concepto[]) {
  const totalHaberes = conceptos.filter((c) => c.tipo === 'haber').reduce((sum, c) => sum + c.monto, 0)
  const totalDeducciones = conceptos.filter((c) => c.tipo === 'deduccion').reduce((sum, c) => sum + c.monto, 0)
  return { totalHaberes, totalDeducciones, netoAPagar: totalHaberes - totalDeducciones }
}

export function generarDeduccionesLegales(baseImponible: number): Concepto[] {
  return DEDUCCIONES_LEGALES.map((d) => ({
    id: crypto.randomUUID(),
    tipo: 'deduccion' as const,
    descripcion: d.descripcion,
    monto: Math.round(baseImponible * d.porcentaje / 100 * 100) / 100,
    esFijo: false,
    porcentaje: d.porcentaje,
    base: baseImponible,
  }))
}

export function formatPeriodo(periodo: string): string {
  const [year, month] = periodo.split('-')
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return `${meses[parseInt(month, 10) - 1]} ${year}`
}

export function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

export function periodoActual(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(value)
}
