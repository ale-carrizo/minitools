import { todayAR } from '@/lib/date'

export type GarantiaEstado = 'vigente' | 'por_vencer' | 'vencida' | 'sin_fecha'
export type ReclamoEstado = 'abierto' | 'en_proceso' | 'resuelto' | 'rechazado'

export interface ReclamoGarantia {
  id: string
  userId: string
  productoId: string
  fecha: string
  estado: ReclamoEstado
  descripcion: string
  resolucion: string | null
  notas: string | null
  createdAt: string
  updatedAt: string
}

export interface GarantiaProducto {
  id: string
  userId: string
  nombre: string
  marca: string | null
  modelo: string | null
  nroSerie: string | null
  categoria: string | null
  proveedor: string | null
  nroFactura: string | null
  fechaCompra: string | null
  fechaVencimiento: string | null
  mesesGarantia: number | null
  precioCompra: number | null
  notas: string | null
  activo: boolean
  createdAt: string
  updatedAt: string
  reclamos: ReclamoGarantia[]
}

export const GARANTIA_ESTADO_CONFIG: Record<GarantiaEstado, {
  label: string
  color: string
  bg: string
  dot: string
  border: string
}> = {
  vigente: { label: 'Vigente', color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400', border: 'border-emerald-500/20' },
  por_vencer: { label: 'Por vencer', color: 'text-yellow-400', bg: 'bg-yellow-500/10', dot: 'bg-yellow-400', border: 'border-yellow-500/20' },
  vencida: { label: 'Vencida', color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400', border: 'border-red-500/20' },
  sin_fecha: { label: 'Sin fecha', color: 'text-white/40', bg: 'bg-white/[0.06]', dot: 'bg-white/20', border: 'border-white/10' },
}

export const RECLAMO_ESTADO_CONFIG: Record<ReclamoEstado, {
  label: string
  color: string
  bg: string
}> = {
  abierto: { label: 'Abierto', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  en_proceso: { label: 'En proceso', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  resuelto: { label: 'Resuelto', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  rechazado: { label: 'Rechazado', color: 'text-red-400', bg: 'bg-red-500/10' },
}

export const CATEGORIAS_GARANTIA = [
  'Electrónica',
  'Electrodomésticos',
  'Herramientas',
  'Maquinaria',
  'Vehículos',
  'Informática',
  'Indumentaria',
  'Otro',
] as const

export const DIAS_ALERTA_DEFAULT = 30

export function calcularEstadoGarantia(
  fechaVencimiento: string | null,
  diasAlerta = DIAS_ALERTA_DEFAULT,
): GarantiaEstado {
  if (!fechaVencimiento) return 'sin_fecha'

  const hoy = new Date(`${todayAR()}T00:00:00`)
  const vence = new Date(`${fechaVencimiento}T00:00:00`)
  const diffMs = vence.getTime() - hoy.getTime()
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDias < 0) return 'vencida'
  if (diffDias <= diasAlerta) return 'por_vencer'
  return 'vigente'
}

export function diasHastaVencimiento(fechaVencimiento: string | null): number | null {
  if (!fechaVencimiento) return null
  const hoy = new Date(`${todayAR()}T00:00:00`)
  const vence = new Date(`${fechaVencimiento}T00:00:00`)
  return Math.ceil((vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDiasRestantes(dias: number | null): string {
  if (dias === null) return 'Sin fecha'
  if (dias < 0) return `Venció hace ${Math.abs(dias)} días`
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Vence mañana'
  if (dias < 30) return `Vence en ${dias} días`
  const meses = Math.floor(dias / 30)
  const resto = dias % 30
  if (resto === 0) return `Vence en ${meses} mes${meses > 1 ? 'es' : ''}`
  return `Vence en ${meses}m ${resto}d`
}

export function calcularFechaVencimiento(fechaCompra: string, meses: number): string {
  const d = new Date(`${fechaCompra}T00:00:00`)
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().slice(0, 10)
}

export function todayString(): string {
  return todayAR()
}

export function formatFecha(fecha: string | null): string {
  if (!fecha) return '—'
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

export function formatCurrency(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(value)
}
