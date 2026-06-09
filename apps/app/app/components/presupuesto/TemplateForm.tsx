'use client'

import { useState, useTransition } from 'react'
import { guardarPresupuestoTemplate } from '@/lib/actions/presupuesto'
import type { PresupuestoServicioFrecuente, PresupuestoTemplate } from '@/types/presupuesto'

interface Props {
  template: PresupuestoTemplate | null
}

function defaultServicio(): PresupuestoServicioFrecuente {
  return {
    id: crypto.randomUUID(),
    nombre: '',
    descripcion: null,
    precioSugerido: 0,
  }
}

export default function TemplateForm({ template }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState({
    nombreComercial: template?.nombreComercial ?? '',
    razonSocial: template?.razonSocial ?? '',
    cuit: template?.cuit ?? '',
    telefono: template?.telefono ?? '',
    email: template?.email ?? '',
    direccion: template?.direccion ?? '',
    logoUrl: template?.logoUrl ?? '',
    colorPrimario: template?.colorPrimario ?? '#5448EE',
    mostrarIvaDefault: template?.mostrarIvaDefault ?? true,
    diasValidezDefault: template?.diasValidezDefault ?? 7,
    textoEncabezado: template?.textoEncabezado ?? '',
    condicionesDefault: template?.condicionesDefault ?? '',
    notasClienteDefault: template?.notasClienteDefault ?? '',
  })
  const [servicios, setServicios] = useState<PresupuestoServicioFrecuente[]>(
    template?.serviciosFrecuentes.length ? template.serviciosFrecuentes : [defaultServicio()],
  )

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setServicio(index: number, patch: Partial<PresupuestoServicioFrecuente>) {
    setServicios((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  function addServicio() {
    setServicios((prev) => [...prev, defaultServicio()])
  }

  function removeServicio(index: number) {
    setServicios((prev) => (prev.length === 1 ? [defaultServicio()] : prev.filter((_, itemIndex) => itemIndex !== index)))
  }

  function handleSubmit() {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      try {
        await guardarPresupuestoTemplate({
          ...form,
          serviciosFrecuentes: servicios.map((item) => ({
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion ?? '',
            precioSugerido: item.precioSugerido,
          })),
        })
        setSuccess('Template guardado. Ya se aplica en nuevos presupuestos y en el PDF.')
      } catch (err: any) {
        setError(err.message ?? 'No se pudo guardar la configuracion.')
      }
    })
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
      <div className="space-y-5">
        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300">
            {success}
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Marca y empresa</p>
          <div className="grid gap-4 md:grid-cols-2">
            <input value={form.nombreComercial} onChange={(e) => setField('nombreComercial', e.target.value)} placeholder="Nombre comercial" className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
            <input value={form.razonSocial} onChange={(e) => setField('razonSocial', e.target.value)} placeholder="Razon social" className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
            <input value={form.cuit} onChange={(e) => setField('cuit', e.target.value)} placeholder="CUIT" className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
            <input value={form.telefono} onChange={(e) => setField('telefono', e.target.value)} placeholder="Telefono" className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
            <input value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="Email" className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
            <input value={form.direccion} onChange={(e) => setField('direccion', e.target.value)} placeholder="Direccion" className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
            <input value={form.logoUrl} onChange={(e) => setField('logoUrl', e.target.value)} placeholder="URL del logo" className="md:col-span-2 rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Defaults del presupuesto</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Color principal</label>
              <input type="color" value={form.colorPrimario} onChange={(e) => setField('colorPrimario', e.target.value)} className="h-11 w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-2 py-2" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Validez por defecto (dias)</label>
              <input type="number" min={0} value={form.diasValidezDefault} onChange={(e) => setField('diasValidezDefault', Number(e.target.value))} className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white focus:border-[#5448EE]/60 focus:outline-none" />
            </div>
            <label className="md:col-span-2 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-[13px] text-white/70">
              <input type="checkbox" checked={form.mostrarIvaDefault} onChange={(e) => setField('mostrarIvaDefault', e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-white/[0.05] accent-[#5448EE]" />
              Aplicar IVA por defecto al crear un presupuesto
            </label>
            <textarea value={form.textoEncabezado} onChange={(e) => setField('textoEncabezado', e.target.value)} placeholder="Texto corto debajo del titulo del PDF..." rows={3} className="md:col-span-2 w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
            <textarea value={form.condicionesDefault} onChange={(e) => setField('condicionesDefault', e.target.value)} placeholder="Condiciones comerciales por defecto..." rows={4} className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
            <textarea value={form.notasClienteDefault} onChange={(e) => setField('notasClienteDefault', e.target.value)} placeholder="Notas para el cliente por defecto..." rows={4} className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Servicios frecuentes</p>
            <button type="button" onClick={addServicio} className="rounded-xl bg-[#5448EE] px-3 py-2 text-[12px] font-medium text-white hover:bg-[#4438DE]">
              + Agregar servicio
            </button>
          </div>
          <div className="space-y-3">
            {servicios.map((servicio, index) => (
              <div key={servicio.id} className="grid gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 md:grid-cols-[1.2fr,1.3fr,0.8fr,auto]">
                <input value={servicio.nombre} onChange={(e) => setServicio(index, { nombre: e.target.value })} placeholder="Nombre del servicio" className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
                <input value={servicio.descripcion ?? ''} onChange={(e) => setServicio(index, { descripcion: e.target.value })} placeholder="Descripcion breve" className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
                <input type="number" step="any" value={servicio.precioSugerido || ''} onChange={(e) => setServicio(index, { precioSugerido: Number(e.target.value || 0) })} placeholder="Precio sugerido" className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
                <button type="button" onClick={() => removeServicio(index)} className="rounded-xl border border-red-500/20 px-3 py-2 text-[12px] font-medium text-red-400">Quitar</button>
              </div>
            ))}
          </div>
        </div>

        <button type="button" onClick={handleSubmit} disabled={isPending} className="w-full rounded-xl bg-[#5448EE] px-4 py-3 text-[13px] font-medium text-white hover:bg-[#4438DE] disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? 'Guardando template...' : 'Guardar template'}
        </button>
      </div>

      <div className="h-fit rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Vista rapida</p>
        <div className="rounded-2xl border border-white/[0.06] bg-[#11111b] p-5">
          <div className="mb-4 h-1.5 w-16 rounded-full" style={{ backgroundColor: form.colorPrimario }} />
          <h3 className="text-lg font-semibold text-white">{form.nombreComercial || 'Tu marca'}</h3>
          <p className="mt-1 text-sm text-white/45">{form.textoEncabezado || 'Presupuestos prolijos con tu identidad y tus textos listos para usar.'}</p>
          <div className="mt-5 space-y-1 text-[13px] text-white/60">
            {form.razonSocial ? <p>{form.razonSocial}</p> : null}
            {form.cuit ? <p>CUIT: {form.cuit}</p> : null}
            {form.telefono ? <p>{form.telefono}</p> : null}
            {form.email ? <p>{form.email}</p> : null}
            {form.direccion ? <p>{form.direccion}</p> : null}
          </div>
          <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-[12px] font-medium text-white/80">Defaults activos</p>
            <p className="mt-2 text-[13px] text-white/55">Validez: {form.diasValidezDefault} dias</p>
            <p className="text-[13px] text-white/55">IVA inicial: {form.mostrarIvaDefault ? 'Activo' : 'Desactivado'}</p>
            <p className="text-[13px] text-white/55">Servicios guardados: {servicios.filter((item) => item.nombre.trim()).length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
