import { getCobrosHoy } from '@/lib/actions/socios'
import CobrosHoyClient from '@/app/components/socios/CobrosHoyClient'

export default async function CobrosPage() {
  const data = await getCobrosHoy()
  return <CobrosHoyClient {...data} />
}
