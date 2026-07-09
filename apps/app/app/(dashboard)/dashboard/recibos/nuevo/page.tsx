'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearRecibo } from '@/lib/actions/recibos'
import { todayAR } from '@/lib/date'
import { MEDIOS_PAGO } from '@/types/recibos'

const INPUT_CLS = 'w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none'

export default function NuevoReciboPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fecha: todayAR(),
    emisorNombre: '',
    emisorDoc: '',
    emisorDireccion: '',
    receptorNombre: '',
    receptorDoc: '',
    receptorTelefono: '',
    monto: '',
    concepto: '',
    medioPago: '',
    notas: '',
  })

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function handleSubmit() {
    if (!form.emisorNombre.trim()) { setError('Ingresá el nombre de quien recibe'); return }
    if (!form.concepto.trim()) { setError('Ingresá el concepto'); return }
    const monto = parseFloat(form.monto)
    if (!monto || monto <= 0) { setError('Ingresá un monto válido'); return }

    startTransition(async () => {
      try {
        const creado = await crearRecibo({
          ...form,
          monto,
          emisorDoc: form.emisorDoc || undefined,
          emisorDireccion: form.emisorDireccion || undefined,
          receptorNombre: form.receptorNombre || undefined,
          receptorDoc: form.receptorDoc || undefined,
          receptorTelefono: form.receptorTelefono || undefined,
          medioPago: form.medioPago || undefined,
          notas: form.notas || undefined,
        })
        window.open(`/api/recibos/${creado.id}/pdf`, '_blank')
        router.push(`/dashboard/recibos/${creado.id}`)
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <div className="max-w-xl space-y-5">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">{error}</div>
      )}

      {/* Datos del emisor (quien recibe) */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Quién recibe</p>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Nombre / Razón social *</label>
            <input value={form.emisorNombre} onChange={e => set('emisorNombre', e.target.value)} placeholder="Ej: Tu Empresa SRL" className={INPUT_CLS} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">CUIT</label>
              <input value={form.emisorDoc} onChange={e => set('emisorDoc', e.target.value)} placeholder="XX-XXXXXXXX-X" className={INPUT_CLS} />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Dirección</label>
              <input value={form.emisorDireccion} onChange={e => set('emisorDireccion', e.target.value)} placeholder="Calle 123" className={INPUT_CLS} />
            </div>
          </div>
        </div>
      </div>

      {/* Datos del recibo */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Datos del recibo</p>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Fecha</label>
            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Recibido de</label>
            <input value={form.receptorNombre} onChange={e => set('receptorNombre', e.target.value)} placeholder="Nombre de quien pagó" className={INPUT_CLS} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">DNI/CUIT de quien pagó</label>
            <input value={form.receptorDoc} onChange={e => set('receptorDoc', e.target.value)} placeholder="Opcional" className={INPUT_CLS} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">WhatsApp de quien pagó</label>
            <input value={form.receptorTelefono} onChange={e => set('receptorTelefono', e.target.value)} placeholder="Ej: 11 2345 6789 (para enviarlo)" className={INPUT_CLS} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Monto ($)</label>
            <input type="number" min="0" step="any" value={form.monto} onChange={e => set('monto', e.target.value)} placeholder="0" className={INPUT_CLS} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Concepto *</label>
            <input value={form.concepto} onChange={e => set('concepto', e.target.value)} placeholder="Ej: Pago de servicio técnico" className={INPUT_CLS} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Medio de pago</label>
            <select value={form.medioPago} onChange={e => set('medioPago', e.target.value)} className={INPUT_CLS}>
              <option value="">Seleccionar</option>
              {MEDIOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Notas adicionales</label>
            <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={3} placeholder="Info extra que aparezca en el recibo" className={INPUT_CLS} />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => router.back()} className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-[13px] font-medium text-white/50 hover:text-white transition-colors">
          Cancelar
        </button>
        <button type="button" onClick={handleSubmit} disabled={isPending} className="flex-[2] rounded-xl bg-[#5448EE] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#4438DE] disabled:opacity-50 transition-colors">
          {isPending ? 'Guardando...' : 'Guardar y generar PDF'}
        </button>
      </div>
    </div>
  )
}
