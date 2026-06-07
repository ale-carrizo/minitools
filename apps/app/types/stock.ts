// ── Stock types ───────────────────────────────────────────────────────────────

export type MovimientoTipo = 'entrada' | 'salida' | 'ajuste'

export interface Producto {
  id:          string
  userId:      string
  nombre:      string
  sku:         string | null
  categoria:   string | null
  descripcion: string | null
  precioCosto: number
  precioVenta: number
  stock:       number
  stockMinimo: number
  unidad:      string
  activo:      boolean
  createdAt:   string
  updatedAt:   string
}

export interface MovimientoStock {
  id:         string
  userId:     string
  productoId: string
  tipo:       MovimientoTipo
  cantidad:   number
  stockAntes: number
  motivo:     string | null
  createdAt:  string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export type StockEstado = 'ok' | 'alerta' | 'sin_stock'

export function getStockEstado(p: Producto): StockEstado {
  if (p.stock === 0)              return 'sin_stock'
  if (p.stock <= p.stockMinimo)  return 'alerta'
  return 'ok'
}

export const STOCK_ESTADO_CONFIG: Record<StockEstado, { label: string; color: string; dot: string }> = {
  ok:        { label: 'OK',        color: 'text-emerald-400 bg-emerald-500/15', dot: 'bg-emerald-400' },
  alerta:    { label: 'Stock bajo', color: 'text-yellow-400 bg-yellow-500/15',  dot: 'bg-yellow-400' },
  sin_stock: { label: 'Sin stock',  color: 'text-red-400 bg-red-500/15',        dot: 'bg-red-400' },
}

export const UNIDADES = [
  'unidad', 'kg', 'g', 'litro', 'ml', 'metro', 'cm', 'caja', 'paquete', 'par', 'rollo',
] as const

export const CATEGORIAS_SUGERIDAS = [
  'Electrónica', 'Ropa', 'Alimentos', 'Bebidas', 'Limpieza', 'Herramientas',
  'Papelería', 'Repuestos', 'Cosméticos', 'Otro',
]
