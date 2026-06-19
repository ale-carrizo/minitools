// ── Tipos para Recibo de Sueldo (Excel → PDF) ────────────────────────────────

export interface ReciboConfig {
  id:          string
  userId:      string
  razonSocial: string
  cuit:        string | null
  domicilio:   string | null
  logoUrl:     string | null
}

export interface ConceptoRecibo {
  nombre: string
  monto:  number
  tipo:   'haber' | 'deduccion'
}

export interface EmpleadoRecibo {
  nombre:           string
  cuil:             string
  cargo:            string
  categoria:        string
  fechaIngreso:     string
  modalidad:        string
  periodo:          string
  fechaPago:        string
  conceptos:        ConceptoRecibo[]
  totalHaberes:     number
  totalDeducciones: number
  netoAPagar:       number
}

// ── Formato de la plantilla Excel ────────────────────────────────────────────
// Columnas fijas: Nombre, CUIL, Cargo, Categoría, Fecha Ingreso, Modalidad, Período, Fecha Pago
// Columnas haberes:     prefijo H_ (ej: H_Básico, H_Antigüedad, H_Horas Extra)
// Columnas deducciones: prefijo D_ (ej: D_Jubilación, D_Obra Social)
// Totales se calculan automáticamente

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 2,
  }).format(n)
}
