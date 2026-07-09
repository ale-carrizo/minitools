import Link from 'next/link'
import PresupuestoList from '@/app/components/presupuesto/PresupuestoList'
import { getPresupuestos } from '@/lib/actions/presupuesto'

export default async function PresupuestosPage() {
  const presupuestos = await getPresupuestos()

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[13px] text-white/40">
          {presupuestos.length} presupuesto{presupuestos.length !== 1 ? 's' : ''} cargado{presupuestos.length !== 1 ? 's' : ''}
        </p>
        <Link href="/dashboard/presupuestos/nuevo" className="rounded-xl bg-[#5448EE] px-4 py-2 text-[12px] font-medium text-white btn-solid-text hover:bg-[#4438DE]">
          + Nuevo presupuesto
        </Link>
      </div>
      <PresupuestoList presupuestos={presupuestos} />
    </div>
  )
}
