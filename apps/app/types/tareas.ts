// ── Tipos: Kanban de Tareas ───────────────────────────────────────────────────

export type Prioridad = 'baja' | 'media' | 'alta' | 'urgente'

export interface Etiqueta {
  texto: string
  color: string
}

export interface CheckItem {
  texto: string
  hecho: boolean
}

export interface Adjunto {
  nombre: string
  url:    string // data-URL base64
  tipo:   string // MIME type
  tamano: number // bytes
}

export const MAX_ADJUNTO_BYTES = 3 * 1024 * 1024 // 3MB, igual que comprobantes de socios
export const TIPOS_ADJUNTO_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export interface Tarea {
  id:          string
  columnaId:   string
  userId:      string
  titulo:      string
  descripcion: string | null
  prioridad:   Prioridad
  etiquetas:   Etiqueta[]
  checklist:   CheckItem[]
  adjuntos:    Adjunto[]
  fechaVenc:   string | null
  portada:     string | null
  orden:       number
  archivada:   boolean
  createdAt:   string
  updatedAt:   string
}

export interface Columna {
  id:        string
  tableroId: string
  nombre:    string
  orden:     number
  color:     string
  limiteWip: number | null
  tareas:    Tarea[]
}

export interface Tablero {
  id:          string
  userId:      string
  nombre:      string
  descripcion: string | null
  color:       string
  columnas:    Columna[]
  createdAt:   string
  updatedAt:   string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export const PRIORIDAD_CONFIG: Record<Prioridad, { label: string; color: string; bg: string }> = {
  baja:    { label: 'Baja',    color: '#6B7280', bg: 'rgba(107,114,128,0.15)' },
  media:   { label: 'Media',   color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  alta:    { label: 'Alta',    color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  urgente: { label: 'Urgente', color: '#EF4444', bg: 'rgba(239,68,68,0.15)'  },
}

export const COLORES_COLUMNA = [
  '#5448EE', '#06B6D4', '#059669', '#D97706',
  '#DC2626', '#7C3AED', '#DB2777', '#374151',
]

export const COLORES_ETIQUETA = [
  { bg: '#EF4444', label: 'Rojo'     },
  { bg: '#F97316', label: 'Naranja'  },
  { bg: '#EAB308', label: 'Amarillo' },
  { bg: '#22C55E', label: 'Verde'    },
  { bg: '#06B6D4', label: 'Cyan'     },
  { bg: '#3B82F6', label: 'Azul'     },
  { bg: '#8B5CF6', label: 'Violeta'  },
  { bg: '#EC4899', label: 'Rosa'     },
  { bg: '#6B7280', label: 'Gris'     },
]

export const COLORES_PORTADA = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
  '#5448EE', '#374151',
]

export function estaVencida(fecha: string | null): boolean {
  if (!fecha) return false
  return new Date(fecha + 'T23:59:59') < new Date()
}

export function checkProgress(checklist: CheckItem[]): { hechos: number; total: number } {
  return { hechos: checklist.filter(c => c.hecho).length, total: checklist.length }
}
