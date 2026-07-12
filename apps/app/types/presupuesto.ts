export type PresupuestoEstado =
  | 'borrador'
  | 'enviado'
  | 'aceptado'
  | 'rechazado'
  | 'vencido'

export interface PresupuestoItem {
  id: string
  presupuestoId: string
  orden: number
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface PresupuestoServicioFrecuente {
  id: string
  nombre: string
  descripcion: string | null
  precioSugerido: number
}

export const MAX_PRESUPUESTO_TEMPLATES = 4

export interface PresupuestoTemplate {
  id: string
  userId: string
  nombre: string
  activo: boolean
  nombreComercial: string | null
  razonSocial: string | null
  cuit: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  logoUrl: string | null
  colorPrimario: string
  mostrarIvaDefault: boolean
  diasValidezDefault: number
  textoEncabezado: string | null
  condicionesDefault: string | null
  notasClienteDefault: string | null
  serviciosFrecuentes: PresupuestoServicioFrecuente[]
  createdAt: string
  updatedAt: string
}

export interface Cliente {
  id: string
  userId: string
  nombre: string
  empresa: string | null
  email: string | null
  telefono: string | null
  direccion: string | null
  cuit: string | null
  notas: string | null
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface Presupuesto {
  id: string
  userId: string
  clienteId: string | null
  numero: number
  titulo: string
  estado: PresupuestoEstado
  fechaEmision: string
  fechaVence: string | null
  moneda: string
  descuento: number
  iva: number
  notas: string | null
  notasCliente: string | null
  subtotal: number
  totalFinal: number
  logoUrl: string | null
  pdfUrl: string | null
  enviadoAt: string | null
  aceptadoAt: string | null
  rechazadoAt: string | null
  createdAt: string
  updatedAt: string
  cliente: Cliente | null
  items: PresupuestoItem[]
}

export interface PresupuestoInput {
  clienteId?: string
  titulo: string
  fechaEmision: string
  fechaVence?: string
  moneda: string
  descuento: number
  iva: number
  notas?: string
  notasCliente?: string
  items: {
    orden: number
    descripcion: string
    cantidad: number
    precioUnitario: number
  }[]
}

export const ESTADO_CONFIG: Record<
  PresupuestoEstado,
  { label: string; color: string; dot: string; bg: string }
> = {
  borrador: { label: 'Borrador', color: 'text-white/50', dot: 'bg-white/30', bg: 'bg-white/[0.06]' },
  enviado: { label: 'Enviado', color: 'text-blue-400', dot: 'bg-blue-400', bg: 'bg-blue-500/10' },
  aceptado: { label: 'Aceptado', color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/10' },
  rechazado: { label: 'Rechazado', color: 'text-red-400', dot: 'bg-red-400', bg: 'bg-red-500/10' },
  vencido: { label: 'Vencido', color: 'text-orange-400', dot: 'bg-orange-400', bg: 'bg-orange-500/10' },
} as const

export const MONEDAS = ['ARS', 'USD', 'EUR'] as const

export function calcularTotales(
  items: Pick<PresupuestoItem, 'cantidad' | 'precioUnitario'>[],
  descuento: number,
  iva: number,
) {
  const subtotal = items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0)
  const descuentoMonto = subtotal * (descuento / 100)
  const base = subtotal - descuentoMonto
  const ivaMonto = base * (iva / 100)
  const totalFinal = base + ivaMonto

  return { subtotal, descuentoMonto, base, ivaMonto, totalFinal }
}

export function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPresupuestoNumero(numero: number) {
  return `#${String(numero).padStart(3, '0')}`
}

export function generarLinkWhatsAppPresupuesto(presupuesto: Presupuesto) {
  const telefono = presupuesto.cliente?.telefono?.replace(/\D/g, '')
  if (!telefono) return ''

  const mensaje = [
    `Hola ${presupuesto.cliente?.nombre ?? ''}!`,
    `Te compartimos el presupuesto ${formatPresupuestoNumero(presupuesto.numero)}: ${presupuesto.titulo}.`,
    `Total: ${formatCurrency(presupuesto.totalFinal, presupuesto.moneda)}.`,
    presupuesto.fechaVence ? `Válido hasta ${presupuesto.fechaVence.split('-').reverse().join('/')}.` : '',
  ].filter(Boolean).join('\n')

  return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
}
