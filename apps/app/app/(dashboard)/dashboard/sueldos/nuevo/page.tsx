import Link from 'next/link'
import ReciboForm from '@/app/components/sueldos/ReciboForm'
import { getConfig, getEmpleadosParaRecibo } from '@/lib/actions/recibo'
import { periodoActual } from '@/types/recibo'

export default async function NuevoReciboPage() {
  const [config, empleados] = await Promise.all([getConfig(), getEmpleadosParaRecibo()])

  if (!config) {
    return (
      <div className="py-16 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl max-w-lg mx-auto">
        <p className="text-3xl mb-3">⚙️</p>
        <p className="text-white/70 text-sm font-medium mb-1">Primero configurá los datos del empleador</p>
        <p className="text-white/30 text-xs mb-5">
          Necesitamos razón social y CUIT para generar los recibos correctamente.
        </p>
        <Link href="/dashboard/sueldos/config" className="inline-flex px-4 py-2.5 bg-[#5448EE] hover:bg-[#4438DE] text-white text-[13px] font-medium rounded-xl transition-colors">
          Ir a configuración →
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 text-[13px] text-white/30">Recibos / <span className="text-white/60">Nuevo recibo</span></div>
      <ReciboForm empleados={empleados} defaultPeriodo={periodoActual()} />
    </div>
  )
}
