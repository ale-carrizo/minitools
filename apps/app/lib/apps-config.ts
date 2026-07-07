export interface AppDef {
  slug: string
  label: string
  desc: string
  icon: string
}

export const APPS: AppDef[] = [
  { slug: 'stock',       label: 'Control de Stock',     desc: 'Inventario con alertas de stock mínimo',         icon: '📦' },
  { slug: 'presupuestos',label: 'Presupuestos',          desc: 'PDFs con logo y seguimiento de estados',         icon: '📄' },
  { slug: 'caja',        label: 'Caja + Pagos',          desc: 'Ingresos, egresos y lectura de comprobantes IA', icon: '💰' },
  { slug: 'precios',     label: 'Calculadora de Precios',desc: 'Precio de venta, margen y punto de equilibrio',  icon: '🧮' },
  { slug: 'sueldos',     label: 'Recibo de Sueldo',      desc: 'PDFs de recibos desde Excel del contador',      icon: '🧾' },
  { slug: 'turnos',      label: 'Gestión de Turnos',     desc: 'Agenda online con recordatorios por WhatsApp',   icon: '📅' },
  { slug: 'garantias',   label: 'Garantías',             desc: 'Alertas de vencimiento e historial de reclamos', icon: '🛡️' },
  { slug: 'socios',      label: 'Clientes y Pagos',      desc: 'Cobranza recurrente con avisos por WhatsApp',    icon: '👥' },
  { slug: 'tareas',      label: 'Tareas / Kanban',       desc: 'Tableros con hasta 8 columnas al estilo Trello', icon: '📋' },
  { slug: 'recibos',     label: 'Recibos',                desc: 'Comprobantes de cobro en PDF',                   icon: '🧾' },
  { slug: 'asistencia',  label: 'Control de Asistencia',  desc: 'Gestión de empleados y registro de asistencias',  icon: '👤' },
]

export const APP_BY_SLUG: Record<string, AppDef> = Object.fromEntries(APPS.map(a => [a.slug, a]))

export type CustomAppNames = Record<string, string>

const STORAGE_KEY = 'zimple-app-names'

export function loadCustomNames(): CustomAppNames {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveCustomNames(names: CustomAppNames) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
}

export function getAppLabel(slug: string, custom?: CustomAppNames): string {
  if (custom?.[slug]?.trim()) return custom[slug].trim()
  return APP_BY_SLUG[slug]?.label ?? slug
}

export function getToolPathLabel(path: string, custom?: CustomAppNames): string | undefined {
  const match = Object.values(APP_BY_SLUG).find(app => path.startsWith('/dashboard/' + app.slug))
  return match ? getAppLabel(match.slug, custom) : undefined
}
