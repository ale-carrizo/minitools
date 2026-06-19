'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSocio, updateSocio } from '@/lib/actions/socios'
import type { Socio } from '@/types/socios'
import { FRECUENCIA_LABELS } from '@/types/socios'

const DEFAULT_TEMPLATE =
  'Hola {nombre} 👋, te recuerdo que tu {concepto} de ${monto} vence el {fecha}. Cualquier consulta estoy a disposición. ¡Gracias!'

interface Props { socio?: Socio }

export default function SocioForm({ socio }: Props) {
  const router = useRouter()
  const isEdit = !!socio

  const [form, setForm] = useState({
    nombre:          socio?.nombre           ?? '',
    telefono:        socio?.telefono         ?? '',
    email:           socio?.email            ?? '',
    notas:           socio?.notas            ?? '',
    frecuencia:      socio?.frecuencia       ?? 'mensual',
    monto:           socio?.monto            ?? '',
    diaVencimiento:  socio?.diaVencimiento   ?? 1,
    concepto:        socio?.concepto         ?? 'Cuota',
    mensajeTemplate: socio?.mensajeTemplate  ?? DEFAULT_TEMPLATE,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function set(key: string, val: any) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim())   { setError('El nombre es obligatorio'); return }
    if (!form.telefono.trim()) { setError('El teléfono es obligatorio'); return }
    if (!form.monto)           { setError('El monto es obligatorio'); return }

    const tel = form.telefono.replace(/\D/g, '')

    setLoading(true); setError('')
    try {
      const payload = {
        nombre:          form.nombre.trim(),
        telefono:        tel,
        email:           form.email.trim() || null,
        notas:           form.notas.trim() || null,
        frecuencia:      form.frecuencia as any,
        monto:           Number(form.monto),
        diaVencimiento:  (form.frecuencia === 'mensual' || form.frecuencia === 'quincenal')
                         ? Number(form.diaVencimiento) : null,
        concepto:        form.concepto.trim() || null,
        mensajeTemplate: form.mensajeTemplate.trim() || DEFAULT_TEMPLATE,
        estado:          'activo' as const,
      }
      if (isEdit) {
        await updateSocio(socio!.id, payload)
      } else {
        await createSocio(payload)
      }
      router.push('/dashboard/socios/clientes')
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 text-[12px] rounded-xl border border-white/[0.09] bg-white/[0.05] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60'
  const sectionCls = 'rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden'
  const sectionHeaderCls = 'px-4 py-2.5 border-b border-white/[0.06]'

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {/* Datos personales */}
      <div className={sectionCls}>
        <div className={sectionHeaderCls}>
          <span className="text-[11px] font-semibold text-white/25 uppercase tracking-wider">Datos del cliente</span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-[11px] text-white/40 mb-1.5">Nombre completo <span className="text-red-400">*</span></label>
            <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Juan Pérez" className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] text-white/40 mb-1.5">Teléfono WhatsApp <span className="text-red-400">*</span></label>
            <input type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)}
              placeholder="+54 9 11 xxxx-xxxx" className={inputCls} />
            <p className="text-[10px] text-white/25 mt-1">Se usa para enviar mensajes de WhatsApp</p>
          </div>
          <div>
            <label className="block text-[11px] text-white/40 mb-1.5">Email (opcional)</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="juan@email.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] text-white/40 mb-1.5">Notas internas</label>
            <input type="text" value={form.notas} onChange={e => set('notas', e.target.value)}
              placeholder="Ej: turno mañana, caso García..." className={inputCls} />
          </div>
        </div>
      </div>

      {/* Cobro */}
      <div className={sectionCls}>
        <div className={sectionHeaderCls}>
          <span className="text-[11px] font-semibold text-white/25 uppercase tracking-wider">Cobro</span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-[11px] text-white/40 mb-1.5">Tipo de cobro</label>
            <div className="grid grid-cols-2 gap-2">
              {(['mensual', 'quincenal', 'semanal', 'unico'] as const).map(f => (
                <button key={f} type="button"
                  onClick={() => set('frecuencia', f)}
                  className={`py-2.5 px-3 rounded-xl border text-[11px] font-medium text-left transition-all
                    ${form.frecuencia === f
                      ? 'border-[#5448EE]/60 bg-[#5448EE]/15 text-[#8880F5]'
                      : 'border-white/[0.08] text-white/40 bg-white/[0.03] hover:text-white/70'}`}
                >
                  {f === 'unico' ? '📋 ' : '🔄 '}{FRECUENCIA_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-white/40 mb-1.5">Concepto</label>
            <input type="text" value={form.concepto} onChange={e => set('concepto', e.target.value)}
              placeholder="Ej: Cuota, Honorarios, Clase particular..." className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] text-white/40 mb-1.5">Monto <span className="text-red-400">*</span></label>
            <input type="number" value={form.monto} onChange={e => set('monto', e.target.value)}
              placeholder="12000" className={inputCls} />
          </div>
          {(form.frecuencia === 'mensual' || form.frecuencia === 'quincenal') && (
            <div>
              <label className="block text-[11px] text-white/40 mb-1.5">Día de vencimiento (1–31)</label>
              <input type="number" value={form.diaVencimiento}
                onChange={e => set('diaVencimiento', e.target.value)}
                min={1} max={31} className={inputCls} />
            </div>
          )}
        </div>
      </div>

      {/* Plantilla WA */}
      <div className={sectionCls}>
        <div className={sectionHeaderCls}>
          <span className="text-[11px] font-semibold text-white/25 uppercase tracking-wider">Mensaje de aviso WhatsApp</span>
        </div>
        <div className="p-4">
          <textarea
            value={form.mensajeTemplate}
            onChange={e => set('mensajeTemplate', e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 text-[12px] rounded-xl border border-white/[0.09] bg-white/[0.05] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60 resize-none"
          />
          <p className="text-[10px] text-white/25 mt-1">
            Variables:{' '}
            {['{nombre}', '{monto}', '{fecha}', '{concepto}'].map(v => (
              <code key={v} className="bg-white/[0.06] px-1 rounded mx-0.5">{v}</code>
            ))}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="flex-1 py-3 border border-white/10 rounded-xl text-[12px] text-white/40 hover:text-white transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-[2] py-3 bg-[#5448EE] text-white rounded-xl text-[12px] font-medium hover:bg-[#4438DE] disabled:opacity-50">
          {loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
        </button>
      </div>
    </form>
  )
}
