import RegistrarClient from "@/app/components/caja/RegistrarClient"
import { getProductos } from "@/lib/actions/stock"

export default async function RegistrarPage() {
  const productos = await getProductos()
  return <RegistrarClient productos={productos} />
}
