// ── Tipos: Facturador (ARCA) ─────────────────────────────────────────────────
// Alcance v1: solo Factura C (monotributo) y su Nota de Crédito C.

export type CondicionIvaEmisor = 'monotributo' | 'responsable_inscripto' | 'exento'
export type DocTipoCliente = 'cuit' | 'dni' | 'consumidor_final'
export type FacturaTipo = 'factura_c' | 'nc_c'
export type FacturaEstado = 'emitida' | 'error' | 'anulada'

export interface FacturadorConfig {
  id:                 string
  userId:             string
  cuit:               string
  razonSocial:        string
  condicionIva:       CondicionIvaEmisor
  puntoVenta:         number
  tieneCertificado:   boolean // nunca se expone el PEM al cliente
  produccion:         boolean
  conectado:          boolean
  ultimaVerificacion: string | null
  createdAt:          string
  updatedAt:          string
}

export interface FacturaItem {
  concepto: string
  cantidad: number
  precio:   number
  total:    number
}

export interface Factura {
  id:              string
  userId:          string
  tipo:            FacturaTipo
  puntoVenta:      number
  numero:          number
  fecha:           string
  clienteNombre:   string
  clienteDocTipo:  DocTipoCliente
  clienteDocNro:   string | null
  condicionVenta:  string
  items:           FacturaItem[]
  neto:            number
  total:           number
  cae:             string | null
  caeVencimiento:  string | null
  estado:          FacturaEstado
  errorMsg:        string | null
  facturaOrigenId: string | null
  createdAt:       string
  updatedAt:       string
}

export const CONDICION_IVA_LABELS: Record<CondicionIvaEmisor, string> = {
  monotributo:            'Monotributo',
  responsable_inscripto:  'Responsable Inscripto',
  exento:                 'Exento',
}

export const DOC_TIPO_LABELS: Record<DocTipoCliente, string> = {
  cuit:              'CUIT',
  dni:               'DNI',
  consumidor_final:  'Consumidor final',
}

export const CONDICION_VENTA = ['Contado', 'Cuenta corriente', 'Transferencia'] as const

export function fmtPuntoVenta(pv: number): string {
  return String(pv).padStart(4, '0')
}

export function fmtNumeroComprobante(pv: number, numero: number): string {
  return `${fmtPuntoVenta(pv)}-${String(numero).padStart(8, '0')}`
}
