import { getFacturadorConfig, getFacturas } from '@/lib/actions/facturador'
import { getClientesSugeridos } from '@/lib/actions/clientes-sugeridos'
import { getProductos } from '@/lib/actions/stock'
import FacturadorClient from '@/app/components/facturador/FacturadorClient'

export default async function FacturadorPage() {
  const [config, facturas, clientesSugeridos, productos] = await Promise.all([
    getFacturadorConfig(),
    getFacturas(),
    getClientesSugeridos(),
    getProductos(),
  ])

  return (
    <FacturadorClient
      configInicial={config}
      facturasIniciales={facturas}
      clientesSugeridos={clientesSugeridos}
      productos={productos}
    />
  )
}
