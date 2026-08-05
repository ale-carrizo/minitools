// ── Tipos: Reportes ──────────────────────────────────────────────────────────

export type PeriodoVista = 'dia' | 'semana' | 'mes' | 'personalizado'

export interface VentasResumen {
  caja:       { total: number; tickets: number }
  libreta:    { total: number; tickets: number }
  facturador: { total: number; comprobantes: number }
}

export interface PresupuestosResumen {
  totalMonto:  number
  porEstado:   Record<string, { cantidad: number; monto: number }>
}

export interface ClientesResumen {
  activos:        number
  pendienteMonto: number
  vencenHoyMonto: number
  porEstado:      Record<string, { cantidad: number; monto: number }>
}

export interface TareasResumen {
  abiertas:    number
  vencenHoy:   number
  vencidas:    number
  completadas: number
}

export interface ReportesResumen {
  desde: string
  hasta: string
  ventas:       VentasResumen
  presupuestos: PresupuestosResumen
  clientes:     ClientesResumen
  tareas:       TareasResumen
  evolucionDiaria: { fecha: string; total: number }[] // caja + libreta + facturador, por día del rango
}

export interface ModulosVisibles {
  ventas:       boolean
  presupuestos: boolean
  clientes:     boolean
  tareas:       boolean
}

export interface ReportesConfig {
  id:        string
  userId:    string
  modulos:   ModulosVisibles
  createdAt: string
  updatedAt: string
}

export const MODULOS_DEFAULT: ModulosVisibles = {
  ventas: true, presupuestos: true, clientes: true, tareas: true,
}

export const ESTADO_PRESUPUESTO_LABELS: Record<string, string> = {
  borrador: 'Borrador', enviado: 'Enviado', aceptado: 'Aceptado', rechazado: 'Rechazado',
}

export const ESTADO_COBRO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente', pagado: 'Pagado', vencido: 'Vencido', pospuesto: 'Pospuesto', cancelado: 'Cancelado',
}
