// ── Types: Control de Clientes y Pagos ───────────────────────────────────────

export type CobroFrecuencia = 'unico' | 'semanal' | 'quincenal' | 'mensual'
export type SocioEstado     = 'activo' | 'inactivo' | 'suspendido'
export type CobroEstado     = 'pendiente' | 'pagado' | 'vencido' | 'pospuesto' | 'cancelado'

export interface Socio {
  id:              string
  userId:          string
  nombre:          string
  telefono:        string       // formato 549XXXXXXXXXX para wa.me/
  email:           string | null
  notas:           string | null
  avatarColor:     string
  estado:          SocioEstado
  frecuencia:      CobroFrecuencia
  monto:           number
  diaVencimiento:  number | null
  concepto:        string | null
  mensajeTemplate: string
  totalCobrado:    number
  deudaTotal:      number
  createdAt:       string
  updatedAt:       string
  // Joined
  cobros?:         CobroProgramado[]
  proximoCobro?:   CobroProgramado | null
}

export interface CobroProgramado {
  id:               string
  userId:           string
  socioId:          string
  monto:            number
  fechaVencimiento: string   // YYYY-MM-DD
  estado:           CobroEstado
  concepto:         string | null
  fechaPago:        string | null
  medioPago:        string | null
  notaPago:         string | null
  fechaOriginal:    string | null
  vecesPospuesto:   number
  createdAt:        string
  updatedAt:        string
  // Joined
  socio?: Pick<Socio, 'nombre' | 'telefono' | 'mensajeTemplate' | 'avatarColor'>
}

// ── Status helpers ────────────────────────────────────────────────────────────

export type SocioStatusUI = 'al_dia' | 'proximo' | 'vencido'

export function getSocioStatus(socio: Socio): SocioStatusUI {
  if (socio.deudaTotal > 0) return 'vencido'
  if (socio.proximoCobro) {
    const dias = diasHasta(socio.proximoCobro.fechaVencimiento)
    if (dias <= 7) return 'proximo'
  }
  return 'al_dia'
}

export function diasHasta(fecha: string): number {
  const hoy    = new Date(); hoy.setHours(0, 0, 0, 0)
  const target = new Date(fecha + 'T00:00:00')
  return Math.ceil((target.getTime() - hoy.getTime()) / 86400000)
}

export function buildWhatsAppUrl(socio: Socio, cobro: CobroProgramado): string {
  const fecha = new Date(cobro.fechaVencimiento + 'T12:00:00')
    .toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })

  const mensaje = socio.mensajeTemplate
    .replace(/{nombre}/g,   socio.nombre)
    .replace(/{monto}/g,    cobro.monto.toLocaleString('es-AR'))
    .replace(/{fecha}/g,    fecha)
    .replace(/{concepto}/g, cobro.concepto ?? socio.concepto ?? 'cuota')

  return `https://wa.me/${socio.telefono}?text=${encodeURIComponent(mensaje)}`
}

export function avatarColor(nombre: string): string {
  const colores = [
    '#7C3AED', '#06B6D4', '#059669', '#D97706',
    '#DC2626', '#2563EB', '#7C3AED', '#DB2777',
  ]
  let hash = 0
  for (const c of nombre) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return colores[Math.abs(hash) % colores.length]
}

export function initials(nombre: string): string {
  return nombre.trim().split(' ')
    .slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

// ── Labels ────────────────────────────────────────────────────────────────────

export const FRECUENCIA_LABELS: Record<CobroFrecuencia, string> = {
  unico:     'Cobro único',
  semanal:   'Semanal',
  quincenal: 'Quincenal',
  mensual:   'Mensual',
}

export const MEDIOS_PAGO = [
  'Efectivo',
  'Transferencia',
  'Mercado Pago',
  'Tarjeta débito',
  'Tarjeta crédito',
  'Otro',
]

export const STATUS_UI_CONFIG: Record<SocioStatusUI, {
  label: string; bg: string; text: string; dot: string
}> = {
  al_dia:  { label: 'Al día',  bg: 'rgba(5,150,105,0.15)',  text: '#34d399', dot: '#059669' },
  proximo: { label: 'Próxima', bg: 'rgba(217,119,6,0.15)',  text: '#fbbf24', dot: '#D97706' },
  vencido: { label: 'Vencida', bg: 'rgba(220,38,38,0.15)',  text: '#f87171', dot: '#DC2626' },
}

export const COBRO_STATUS_CONFIG: Record<CobroEstado, {
  label: string; dot: string; text: string
}> = {
  pendiente: { label: 'Pendiente', dot: '#D97706', text: '#fbbf24' },
  pagado:    { label: 'Pagado',    dot: '#059669', text: '#34d399' },
  vencido:   { label: 'Vencido',   dot: '#DC2626', text: '#f87171' },
  pospuesto: { label: 'Pospuesto', dot: '#6366F1', text: '#a5b4fc' },
  cancelado: { label: 'Cancelado', dot: '#6B7280', text: '#9CA3AF' },
}
