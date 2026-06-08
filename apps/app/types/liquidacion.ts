export type LiquidacionEstado = 'borrador' | 'cerrada'

export interface Liquidacion {
  id: string
  userId: string
  periodo: string
  estado: LiquidacionEstado
  notas: string | null
  createdAt: string
  updatedAt: string
  items: LiquidacionItem[]
}

export interface EmpleadoMin {
  id: string
  nombre: string
  apellido: string
  cuil: string | null
  salarioBasico: number | null
  categoriaLaboral: string | null
}

export interface LiquidacionItem {
  id: string
  liquidacionId: string
  empleadoId: string | null
  empleadoNombre: string
  empleadoCuil: string | null
  categoria: string | null
  salarioBruto: number
  diasTrabajados: number
  diasHabiles: number
  salarioCalculado: number
  horasExtraMonto: number
  adicionalesMonto: number
  totalBruto: number
  jubilacionEmpl: number
  obraSocialEmpl: number
  pamiEmpl: number
  otrasDeduccs: number
  totalDeduccs: number
  netoAPagar: number
  jubilacionEmp: number
  fne: number
  obraSocialEmp: number
  artMonto: number
  totalContribEmp: number
  costoTotalEmp: number
  createdAt: string
  updatedAt: string
  empleado: EmpleadoMin | null
}

export const TASAS = {
  JUBILACION_EMPL: 0.11,
  OBRA_SOCIAL_EMPL: 0.03,
  PAMI_EMPL: 0.03,
  JUBILACION_EMP: 0.16,
  FNE: 0.015,
  OBRA_SOCIAL_EMP: 0.06,
} as const

export const ESTADO_CONFIG: Record<LiquidacionEstado, {
  label: string
  color: string
  bg: string
  border: string
}> = {
  borrador: { label: 'Borrador', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  cerrada: { label: 'Cerrada', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
}

export function formatPeriodo(periodo: string): string {
  const [year, month] = periodo.split('-').map(Number)
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return `${meses[month - 1]} ${year}`
}

export function periodoActual(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function periodoAnterior(periodo: string): string {
  const [y, m] = periodo.split('-').map(Number)
  const date = new Date(y, m - 2, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export interface ItemInput {
  salarioBruto: number
  diasTrabajados: number
  diasHabiles: number
  horasExtraMonto: number
  adicionalesMonto: number
  otrasDeduccs: number
  artPorcentaje: number
}

export interface ItemCalculado {
  salarioCalculado: number
  totalBruto: number
  jubilacionEmpl: number
  obraSocialEmpl: number
  pamiEmpl: number
  totalDeduccs: number
  netoAPagar: number
  jubilacionEmp: number
  fne: number
  obraSocialEmp: number
  artMonto: number
  totalContribEmp: number
  costoTotalEmp: number
}

export function calcularItem(input: ItemInput): ItemCalculado {
  const { salarioBruto, diasTrabajados, diasHabiles, horasExtraMonto, adicionalesMonto, otrasDeduccs, artPorcentaje } = input
  const salarioCalculado = diasHabiles > 0 ? (salarioBruto / diasHabiles) * diasTrabajados : salarioBruto
  const totalBruto = salarioCalculado + horasExtraMonto + adicionalesMonto
  const jubilacionEmpl = totalBruto * TASAS.JUBILACION_EMPL
  const obraSocialEmpl = totalBruto * TASAS.OBRA_SOCIAL_EMPL
  const pamiEmpl = totalBruto * TASAS.PAMI_EMPL
  const totalDeduccs = jubilacionEmpl + obraSocialEmpl + pamiEmpl + otrasDeduccs
  const netoAPagar = totalBruto - totalDeduccs
  const jubilacionEmp = totalBruto * TASAS.JUBILACION_EMP
  const fne = totalBruto * TASAS.FNE
  const obraSocialEmp = totalBruto * TASAS.OBRA_SOCIAL_EMP
  const artMonto = totalBruto * (artPorcentaje / 100)
  const totalContribEmp = jubilacionEmp + fne + obraSocialEmp + artMonto
  const costoTotalEmp = totalBruto + totalContribEmp

  return {
    salarioCalculado,
    totalBruto,
    jubilacionEmpl,
    obraSocialEmpl,
    pamiEmpl,
    totalDeduccs,
    netoAPagar,
    jubilacionEmp,
    fne,
    obraSocialEmp,
    artMonto,
    totalContribEmp,
    costoTotalEmp,
  }
}

export interface ResumenLiquidacion {
  cantEmpleados: number
  totalBruto: number
  totalDeduccs: number
  totalNeto: number
  totalContribEmp: number
  totalCostoEmp: number
}

export function calcularResumen(items: LiquidacionItem[]): ResumenLiquidacion {
  return {
    cantEmpleados: items.length,
    totalBruto: items.reduce((s, i) => s + i.totalBruto, 0),
    totalDeduccs: items.reduce((s, i) => s + i.totalDeduccs, 0),
    totalNeto: items.reduce((s, i) => s + i.netoAPagar, 0),
    totalContribEmp: items.reduce((s, i) => s + i.totalContribEmp, 0),
    totalCostoEmp: items.reduce((s, i) => s + i.costoTotalEmp, 0),
  }
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)
}
