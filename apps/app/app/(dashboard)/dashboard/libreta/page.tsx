import { getLibretaConfig, getCajaAbierta, getVentasDeCaja, getHistorialCajas, getReporteMes } from '@/lib/actions/libreta'
import { getProductos } from '@/lib/actions/stock'
import { todayAR } from '@/lib/date'
import LibretaClient from '@/app/components/libreta/LibretaClient'

export default async function LibretaPage() {
  const mesActual = todayAR().slice(0, 7)
  const [config, cajaAbierta, productos, historial, reporte] = await Promise.all([
    getLibretaConfig(),
    getCajaAbierta(),
    getProductos(),
    getHistorialCajas(),
    getReporteMes(mesActual),
  ])
  const ventas = cajaAbierta ? await getVentasDeCaja(cajaAbierta.id) : []

  return (
    <LibretaClient
      configInicial={config}
      cajaInicial={cajaAbierta}
      ventasIniciales={ventas}
      productos={productos}
      historialInicial={historial}
      reporteInicial={reporte}
      mesActual={mesActual}
    />
  )
}
