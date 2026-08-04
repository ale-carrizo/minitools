// ── Tipos: Libreta de Ventas ────────────────────────────────────────────────

export type CampoTipo = 'texto' | 'numero' | 'fecha' | 'lista'

export interface CampoConfig {
  label: string
  visible: boolean
  required: boolean
  type: CampoTipo
  locked?: boolean      // no se puede ocultar (concept/qty/price)
  lockedType?: boolean  // no se puede cambiar el tipo (payment)
}

export type CampoKey = 'concept' | 'qty' | 'price' | 'payment' | 'customer' | 'note'

export type CamposConfig = Record<CampoKey, CampoConfig>

export const CAMPOS_DEFAULT: CamposConfig = {
  concept:  { label: 'Concepto / Mercadería', visible: true,  required: true,  type: 'texto',  locked: true },
  qty:      { label: 'Cantidad',              visible: true,  required: true,  type: 'numero', locked: true },
  price:    { label: 'Precio',                visible: true,  required: true,  type: 'numero', locked: true },
  payment:  { label: 'Tipo de pago',          visible: true,  required: true,  type: 'lista',  lockedType: true },
  customer: { label: 'Cliente',               visible: false, required: false, type: 'texto' },
  note:     { label: 'Nota',                  visible: false, required: false, type: 'texto' },
}

export const MEDIOS_PAGO_DEFAULT = ['Efectivo', 'Transferencia', 'Tarjeta']

export interface LibretaConfig {
  id:             string
  userId:         string
  controlarStock: boolean
  campos:         CamposConfig
  mediosPago:     string[]
  createdAt:      string
  updatedAt:      string
}

export type LibretaCajaEstado = 'abierta' | 'cerrada'

export interface LibretaCaja {
  id:              string
  userId:          string
  fecha:           string
  montoInicial:    number
  nota:            string | null
  estado:          LibretaCajaEstado
  efectivoContado: number | null
  notaCierre:      string | null
  abiertaAt:       string
  cerradaAt:       string | null
  createdAt:       string
  updatedAt:       string
}

export interface LibretaVenta {
  id:         string
  userId:     string
  cajaId:     string
  productoId: string | null
  concepto:   string
  cantidad:   number
  precio:     number
  total:      number
  medioPago:  string | null
  cliente:    string | null
  nota:       string | null
  createdAt:  string
}

export interface LibretaCajaTotales {
  opening:  number
  sales:    number
  expected: number
  diff:     number | null
}

export function calcularTotales(caja: LibretaCaja | null, ventas: LibretaVenta[]): LibretaCajaTotales {
  const sales = ventas.reduce((sum, v) => sum + v.total, 0)
  const opening = caja?.montoInicial ?? 0
  const expected = opening + sales
  const diff = caja?.efectivoContado != null ? caja.efectivoContado - expected : null
  return { opening, sales, expected, diff }
}
