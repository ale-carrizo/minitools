export interface ReciboCobro {
  id: string
  userId: string
  numero: number
  fecha: string
  emisorNombre: string
  emisorDoc?: string | null
  emisorDireccion?: string | null
  receptorNombre?: string | null
  receptorDoc?: string | null
  monto: number
  concepto: string
  medioPago?: string | null
  notas?: string | null
  createdAt: string
  updatedAt: string
}

export const MEDIOS_PAGO = [
  'Efectivo',
  'Transferencia',
  'Mercado Pago',
  'Tarjeta débito',
  'Tarjeta crédito',
  'Cheque',
  'Otro',
] as const

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

export function numeroALetras(n: number): string {
  const entero = Math.floor(Math.abs(n))
  const decimales = Math.round((Math.abs(n) - entero) * 100)
  return `Son pesos ${entero.toLocaleString('es-AR')}${decimales > 0 ? ` con ${decimales}/100` : ''}`
}
