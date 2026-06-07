// ── Caja types ────────────────────────────────────────────────────────────────

export type CajaCobroSource = 'comprobante_ia' | 'extracto' | 'mercadopago' | 'manual'
export type CajaCobroMedio  = 'transferencia' | 'efectivo' | 'mercadopago' | 'tarjeta_debito' | 'tarjeta_credito' | 'otro'

export interface CajaDia {
  id:           string
  userId:       string
  fecha:        string        // ISO date YYYY-MM-DD
  cerrada:      boolean
  cerrada_at:   string | null
  nota_cierre:  string | null
  total_cache:  number
  created_at:   string
  updated_at:   string
}

export interface CajaCobro {
  id:               string
  userId:           string
  dia_id:           string
  monto:            number
  fecha_cobro:      string
  hora_cobro:       string | null
  medio:            CajaCobroMedio
  source:           CajaCobroSource
  concepto:         string | null
  emisor_nombre:    string | null
  emisor_banco:     string | null
  referencia:       string | null
  comprobante_url:  string | null
  // IA slot
  ia_raw:           Record<string, any> | null
  ia_confidence:    number | null
  ia_provider:      string | null
  ia_model:         string | null
  // Mercado Pago (Fase 2)
  mp_payment_id:    string | null
  mp_status:        string | null
  // Extracto bancario
  extracto_row:     Record<string, any> | null
  // Control
  anulado:          boolean
  anulado_at:       string | null
  anulado_motivo:   string | null
  created_at:       string
  updated_at:       string
}

// ── Resultado del procesamiento de comprobante por IA ─────────────────────────
export interface ComprobanteIAResult {
  monto:          number | null
  fecha:          string | null   // YYYY-MM-DD
  hora:           string | null   // HH:MM
  emisor_nombre:  string | null
  emisor_banco:   string | null
  referencia:     string | null
  tipo:           'transferencia' | 'deposito' | 'pago_qr' | 'otro' | null
  confidence:     number          // 0 a 1
  raw:            Record<string, any>
}

// ── Fila parseada de extracto bancario ────────────────────────────────────────
export interface ExtractoRow {
  fecha:          string
  hora:           string | null
  descripcion:    string
  monto:          number
  tipo:           'credito' | 'debito'
  referencia:     string | null
  raw:            Record<string, any>
}

// ── Resumen de caja del día ───────────────────────────────────────────────────
export interface CajaDiaResumen {
  dia:              CajaDia
  cobros:           CajaCobro[]
  total:            number
  por_source: {
    comprobante_ia: number
    extracto:       number
    mercadopago:    number
    manual:         number
  }
  por_medio: {
    transferencia:   number
    efectivo:        number
    mercadopago:     number
    tarjeta_debito:  number
    tarjeta_credito: number
    otro:            number
  }
  cantidad: number
}

// ── Labels ────────────────────────────────────────────────────────────────────
export const SOURCE_LABELS: Record<CajaCobroSource, string> = {
  comprobante_ia: 'Comprobante',
  extracto:       'Extracto',
  mercadopago:    'Mercado Pago',
  manual:         'Manual',
}

export const MEDIO_LABELS: Record<CajaCobroMedio, string> = {
  transferencia:   'Transferencia',
  efectivo:        'Efectivo',
  mercadopago:     'Mercado Pago',
  tarjeta_debito:  'Tarjeta débito',
  tarjeta_credito: 'Tarjeta crédito',
  otro:            'Otro',
}

export const BANCOS_EXTRACTO = [
  'Banco Nación',
  'BBVA',
  'Santander',
  'Galicia',
  'Brubank',
  'Mercado Pago',
  'Otro',
] as const

export type BancoExtracto = typeof BANCOS_EXTRACTO[number]
