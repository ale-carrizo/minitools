export type AsistenciaEstado = 'presente' | 'ausente' | 'tardanza' | 'medio_dia' | 'libre'

export interface Empleado {
  id: string
  userId: string
  nombre: string
  apellido: string | null
  cargo: string | null
  turnoInicio: string | null
  turnoFin: string | null
  tolerancia: number
  color: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface RegistroAsistencia {
  id: string
  userId: string
  empleadoId: string
  fecha: string
  horaEntrada: string | null
  horaSalida: string | null
  horasTrabajadas: number | null
  estado: AsistenciaEstado
  notas: string | null
  createdAt: string
  updatedAt: string
  empleado: Empleado | null
}

export const ESTADO_CONFIG: Record<AsistenciaEstado, {
  label: string; color: string; bg: string; dot: string
}> = {
  presente: { label: 'Presente', color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  tardanza: { label: 'Tardanza', color: 'text-yellow-400', bg: 'bg-yellow-500/10', dot: 'bg-yellow-400' },
  ausente: { label: 'Ausente', color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
  medio_dia: { label: 'Medio día', color: 'text-blue-400', bg: 'bg-blue-500/10', dot: 'bg-blue-400' },
  libre: { label: 'Franco', color: 'text-white/40', bg: 'bg-white/[0.06]', dot: 'bg-white/20' },
} as const

export function calcularHoras(entrada: string | null, salida: string | null): number | null {
  if (!entrada || !salida) return null
  const [eh, em] = entrada.split(':').map(Number)
  const [sh, sm] = salida.split(':').map(Number)
  let minutos = (sh * 60 + sm) - (eh * 60 + em)
  if (minutos < 0) minutos += 24 * 60
  if (minutos <= 0) return null
  return Math.round(minutos) / 60
}

export function formatHoras(horas: number | null): string {
  if (horas === null) return '—'
  const h = Math.floor(horas)
  const m = Math.round((horas - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function detectarEstado(
  empleado: Empleado,
  horaEntrada: string | null,
  horaSalida: string | null,
): AsistenciaEstado {
  if (!horaEntrada) return 'ausente'
  if (!empleado.turnoInicio) return 'presente'

  const [ti_h, ti_m] = empleado.turnoInicio.split(':').map(Number)
  const [en_h, en_m] = horaEntrada.split(':').map(Number)
  const limiteMinutos = ti_h * 60 + ti_m + empleado.tolerancia
  const entradaMinutos = en_h * 60 + en_m

  if (entradaMinutos > limiteMinutos) return 'tardanza'

  if (horaSalida && empleado.turnoFin) {
    const [tf_h, tf_m] = empleado.turnoFin.split(':').map(Number)
    const turnoTotal = (tf_h * 60 + tf_m) - (ti_h * 60 + ti_m)
    const trabajado = calcularHoras(horaEntrada, horaSalida)
    if (trabajado !== null && trabajado * 60 < turnoTotal * 0.6) return 'medio_dia'
  }

  return 'presente'
}

export function todayLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function ahoraHHMM(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
