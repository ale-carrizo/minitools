export type TurnoEstado = 'pendiente' | 'confirmado' | 'cancelado' | 'completado'

export interface TurnoConfig {
  id: string
  userId: string
  horaInicio: string
  horaFin: string
  intervalo: number
  diasHabiles: number[]
  createdAt: string
  updatedAt: string
}

export interface TurnoServicio {
  id: string
  userId: string
  nombre: string
  duracion: number
  precio: number
  color: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface Turno {
  id: string
  userId: string
  servicioId: string | null
  clienteNombre: string
  clienteTel: string | null
  clienteEmail: string | null
  fecha: string
  horaInicio: string
  horaFin: string
  duracion: number
  precio: number
  estado: TurnoEstado
  notas: string | null
  createdAt: string
  updatedAt: string
  servicio: TurnoServicio | null
}

export const ESTADO_CONFIG: Record<TurnoEstado, {
  label: string
  color: string
  bg: string
  border: string
  dot: string
}> = {
  pendiente: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
  confirmado: { label: 'Confirmado', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  cancelado: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
  completado: { label: 'Completado', color: 'text-white/40', bg: 'bg-white/[0.05]', border: 'border-white/10', dot: 'bg-white/20' },
}

export const COLORES_SERVICIO = [
  '#5448EE', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#EAB308', '#22C55E', '#06B6D4',
] as const

export const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const
export const DIAS_SEMANA_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const

export function hhmm2min(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function min2hhmm(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function sumarMinutos(hhmm: string, minutos: number): string {
  return min2hhmm(hhmm2min(hhmm) + minutos)
}

export function generarSlots(horaInicio: string, horaFin: string, intervalo: number): string[] {
  const slots: string[] = []
  let current = hhmm2min(horaInicio)
  const end = hhmm2min(horaFin)
  while (current < end) {
    slots.push(min2hhmm(current))
    current += intervalo
  }
  return slots
}

export function seSuperponen(
  a: { horaInicio: string; horaFin: string },
  b: { horaInicio: string; horaFin: string },
): boolean {
  return hhmm2min(a.horaInicio) < hhmm2min(b.horaFin) &&
    hhmm2min(a.horaFin) > hhmm2min(b.horaInicio)
}

export function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function parseLocalDate(fecha: string): Date {
  return new Date(`${fecha}T00:00:00`)
}

export function formatFechaBonita(fecha: string): string {
  const d = parseLocalDate(fecha)
  const dia = DIAS_SEMANA_FULL[d.getDay()]
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${dia} ${d.getDate()} de ${meses[d.getMonth()]}`
}

export function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

export function generarLinkWhatsApp(turno: Turno): string {
  const tel = turno.clienteTel?.replace(/\D/g, '')
  if (!tel) return ''
  const servicio = turno.servicio?.nombre ? ` (${turno.servicio.nombre})` : ''
  const precio = turno.precio > 0 ? ` - ${formatCurrency(turno.precio)}` : ''
  const msg = encodeURIComponent(
    `Hola ${turno.clienteNombre}! 👋 Te recordamos tu turno${servicio} el ${formatFechaBonita(turno.fecha)} a las ${turno.horaInicio}hs${precio}. Cualquier consulta avisanos. Gracias!`,
  )
  return `https://wa.me/${tel}?text=${msg}`
}

export function offsetFecha(fecha: string, dias: number): string {
  const d = parseLocalDate(fecha)
  d.setDate(d.getDate() + dias)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function semanaDeDate(fecha: string): string[] {
  const d = parseLocalDate(fecha)
  const dayOfWeek = d.getDay()
  const lunes = new Date(d)
  lunes.setDate(d.getDate() - ((dayOfWeek + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(lunes)
    day.setDate(lunes.getDate() + i)
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
  })
}

export const CONFIG_DEFAULT: Omit<TurnoConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  horaInicio: '08:00',
  horaFin: '20:00',
  intervalo: 30,
  diasHabiles: [1, 2, 3, 4, 5],
}
