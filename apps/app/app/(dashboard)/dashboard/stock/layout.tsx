import StockShell from '@/app/components/stock/StockShell'
import { getAlertasStock } from '@/lib/actions/stock'

export default async function StockLayout({ children }: { children: React.ReactNode }) {
  const alertas = await getAlertasStock()
  return (
    <StockShell alertas={alertas.length}>
      {children}
    </StockShell>
  )
}
