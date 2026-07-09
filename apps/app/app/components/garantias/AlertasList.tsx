import Link from 'next/link'
import {
  calcularEstadoGarantia,
  diasHastaVencimiento,
  formatDiasRestantes,
  formatFecha,
  type GarantiaProducto,
} from '@/types/garantia'

function ReclamoButton({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/garantias/${id}`}
      className="inline-flex bg-[#5448EE] hover:bg-[#4438DE] text-white btn-solid-text rounded-xl px-3 py-2 text-[12px] font-medium transition-colors"
    >
      Registrar reclamo
    </Link>
  )
}

export default function AlertasList({ garantias }: { garantias: GarantiaProducto[] }) {
  const vencidas = garantias.filter((garantia) => calcularEstadoGarantia(garantia.fechaVencimiento) === 'vencida')
  const porVencer = garantias.filter((garantia) => calcularEstadoGarantia(garantia.fechaVencimiento) === 'por_vencer')

  if (garantias.length === 0) {
    return (
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-10 text-center">
        <p className="text-3xl mb-3">✅</p>
        <p className="text-white font-medium">Todo en orden — ninguna garantía por vencer o vencida</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {vencidas.length > 0 ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-white font-semibold">Vencidas</h2>
            <p className="text-white/35 text-sm mt-1">Productos cuya cobertura ya terminó y requieren seguimiento.</p>
          </div>
          {vencidas.map((garantia) => {
            const tieneAbierto = garantia.reclamos.some((reclamo) => reclamo.estado === 'abierto' || reclamo.estado === 'en_proceso')
            return (
              <div key={garantia.id} className="bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-white font-medium">{garantia.nombre}</p>
                    <p className="text-[13px] text-white/40 mt-1">{[garantia.marca, garantia.modelo].filter(Boolean).join(' · ') || 'Sin detalle de marca/modelo'}</p>
                    <p className="text-[12px] text-white/30 mt-2">Vencimiento: {formatFecha(garantia.fechaVencimiento)}</p>
                    <p className="text-red-300 font-medium mt-3">{formatDiasRestantes(diasHastaVencimiento(garantia.fechaVencimiento))}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!tieneAbierto ? <ReclamoButton id={garantia.id} /> : null}
                    <Link href={`/dashboard/garantias/${garantia.id}`} className="inline-flex border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
                      Ver
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </section>
      ) : null}

      {porVencer.length > 0 ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-white font-semibold">Por vencer (próximos 30 días)</h2>
            <p className="text-white/35 text-sm mt-1">Garantías que conviene revisar antes del vencimiento.</p>
          </div>
          {porVencer.map((garantia) => {
            const dias = diasHastaVencimiento(garantia.fechaVencimiento)
            return (
              <div key={garantia.id} className="bg-yellow-500/[0.03] border border-yellow-500/10 rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-white font-medium">{garantia.nombre}</p>
                    <p className="text-[13px] text-white/40 mt-1">{[garantia.marca, garantia.modelo].filter(Boolean).join(' · ') || 'Sin detalle de marca/modelo'}</p>
                    <p className={`mt-3 font-medium ${dias !== null && dias <= 7 ? 'text-yellow-300 text-[16px]' : 'text-yellow-200'}`}>
                      {formatDiasRestantes(dias)}
                    </p>
                  </div>
                  <Link href={`/dashboard/garantias/${garantia.id}`} className="inline-flex border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xl px-3 py-2 text-[12px] font-medium transition-colors">
                    Ver
                  </Link>
                </div>
              </div>
            )
          })}
        </section>
      ) : null}
    </div>
  )
}
