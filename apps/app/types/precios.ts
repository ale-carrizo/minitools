export interface CalcPrecioInput {
  costo: number
  margen: number
  iva: number
  modo: 'desde_costo' | 'desde_precio'
  precioVenta: number
}

export interface CalcPrecioResult {
  precioSinIva: number
  ivaMonto: number
  precioFinal: number
  ganancia: number
  margenReal: number
  markupReal: number
  costoSobre: number
}

export interface CalcEquilibrioInput {
  costosFijos: number
  costoVariable: number
  precioVenta: number
}

export interface CalcEquilibrioResult {
  unidadesEquilibrio: number
  ingresosEquilibrio: number
  contribucionMarginal: number
  margenContribucion: number
  proyeccion: Array<{
    unidades: number
    ingresos: number
    costos: number
    resultado: number
  }>
}

export interface Escenario {
  id: string
  nombre: string
  costo: number
  margen: number
  iva: number
}

export interface HistorialItem {
  id: string
  tipo: 'precio' | 'equilibrio'
  fecha: string
  input: CalcPrecioInput | CalcEquilibrioInput
  result: CalcPrecioResult | CalcEquilibrioResult
  etiqueta?: string
}

export const IVA_OPCIONES = [
  { label: 'Sin IVA (0%)', value: 0 },
  { label: 'Reducido (10.5%)', value: 10.5 },
  { label: 'General (21%)', value: 21 },
  { label: 'Personalizado', value: -1 },
] as const

export function calcularPrecio(input: CalcPrecioInput): CalcPrecioResult {
  const { costo, margen, iva } = input
  let precioSinIva: number

  if (input.modo === 'desde_costo') {
    if (margen >= 100) {
      return {
        precioSinIva: 0,
        ivaMonto: 0,
        precioFinal: 0,
        ganancia: 0,
        margenReal: 0,
        markupReal: 0,
        costoSobre: 0,
      }
    }

    precioSinIva = costo / (1 - margen / 100)
  } else {
    precioSinIva = input.precioVenta / (1 + iva / 100)
  }

  const ivaMonto = precioSinIva * (iva / 100)
  const precioFinal = precioSinIva + ivaMonto
  const ganancia = precioSinIva - costo
  const margenReal = precioSinIva > 0 ? (ganancia / precioSinIva) * 100 : 0
  const markupReal = costo > 0 ? (ganancia / costo) * 100 : 0
  const costoSobre = precioSinIva > 0 ? (costo / precioSinIva) * 100 : 0

  return { precioSinIva, ivaMonto, precioFinal, ganancia, margenReal, markupReal, costoSobre }
}

export function calcularEquilibrio(input: CalcEquilibrioInput): CalcEquilibrioResult {
  const { costosFijos, costoVariable, precioVenta } = input
  const contribucionMarginal = precioVenta - costoVariable
  const margenContribucion = precioVenta > 0 ? (contribucionMarginal / precioVenta) * 100 : 0

  const unidadesEquilibrio = contribucionMarginal > 0
    ? Math.ceil(costosFijos / contribucionMarginal)
    : 0
  const ingresosEquilibrio = unidadesEquilibrio * precioVenta

  const proyeccion = [-0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map((factor) => {
    const unidades = Math.max(0, Math.round(unidadesEquilibrio * (1 + factor)))
    const ingresos = unidades * precioVenta
    const costos = costosFijos + unidades * costoVariable

    return { unidades, ingresos, costos, resultado: ingresos - costos }
  })

  return {
    unidadesEquilibrio,
    ingresosEquilibrio,
    contribucionMarginal,
    margenContribucion,
    proyeccion,
  }
}
