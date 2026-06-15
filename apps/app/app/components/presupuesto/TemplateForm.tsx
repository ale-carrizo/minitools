'use client'

import { useRef, useState, useTransition } from 'react'
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
  const fileRef = useRef<HTMLInputElement>(null)
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

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setField('logoUrl', reader.result as string)
    reader.readAsDataURL(file)
  }

  function setServicio(index: number, patch: Partial<PresupuestoServicioFrecuente>) {
    setServicios((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function addServicio() {
    setServicios((prev) => [...prev, defaultServicio()])
  }

  function removeServicio(index: number) {
    setServicios((prev) => (prev.length === 1 ? [defaultServicio()] : prev.filter((_, i) => i !== index)))
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

  const logoIsData = form.logoUrl.startsWith('data:') || form.logoUrl.startsWith('http')

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
      <div className="space-y-5">
        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">{error}</div>
        ) : null}
        {success ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300">{success}</div>
        ) : null}

        {/* Empresa — simplificado */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Tu empresa</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Nombre</label>
              <input
                value={form.nombreComercial}
                onChange={(e) => setField('nombreComercial', e.target.value)}
                placeholder="Ej: Taller Garcia"
                className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Teléfono de contacto</label>
              <input
                value={form.telefono}
                onChange={(e) => setField('telefono', e.target.value)}
                placeholder="+54 11 1234-5678"
                className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
              />
            </div>
          </div>

          {/* Logo upload */}
          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Logo (PNG)</label>
            <div className="flex items-center gap-4">
              {logoIsData ? (
                <div className="h-14 w-14 rounded-xl border border-white/[0.10] bg-white/[0.05] p-1.5 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-xl border border-dashed border-white/[0.15] bg-white/[0.03] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className="text-white/20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-4 py-2.5 text-[13px] text-white/70 hover:border-white/20 hover:text-white transition-colors"
                >
                  {logoIsData ? 'Cambiar logo' : 'Subir logo'}
                </button>
                {logoIsData ? (
                  <button
                    type="button"
                    onClick={() => setField('logoUrl', '')}
                    className="ml-2 text-[12px] text-red-400/70 hover:text-red-400 transition-colors"
                  >
                    Quitar
                  </button>
                ) : null}
                <p className="mt-1 text-[11px] text-white/25">PNG, JPG o WebP. Se incrusta en el PDF.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Defaults del presupuesto */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Defaults del presupuesto</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Color principal</label>
              <input type="color" value={form.colorPrimario} onChange={(e) => setField('colorPrimario', e.target.value)} className="h-11 w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-2 py-2" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Validez por defecto (días)</label>
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

        {/* Servicios frecuentes */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Servicios frecuentes</p>
            <button type="button" onClick={addServicio} className="rounded-xl bg-[#5448EE] px-3 py-2 text-[12px] font-medium text-white hover:bg-[#4438DE]">
              + Agregar
            </button>
          </div>
          <div className="space-y-3">
            {servicios.map((servicio, index) => (
              <div key={servicio.id} className="grid gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 md:grid-cols-[1.2fr,1.3fr,0.8fr,auto]">
                <input value={servicio.nombre} onChange={(e) => setServicio(index, { nombre: e.target.value })} placeholder="Nombre del servicio" className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
                <input value={servicio.descripcion ?? ''} onChange={(e) => setServicio(index, { descripcion: e.target.value })} placeholder="Descripcion breve" className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
                <input type="number" step="any" value={servicio.precioSugerido || ''} onChange={(e) => setServicio(index, { precioSugerido: Number(e.target.value || 0) })} placeholder="Precio" className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none" />
                <button type="button" onClick={() => removeServicio(index)} className="rounded-xl border border-red-500/20 px-3 py-2 text-[12px] font-medium text-red-400">Quitar</button>
              </div>
            ))}
          </div>
        </div>

        <button type="button" onClick={handleSubmit} disabled={isPending} className="w-full rounded-xl bg-[#5448EE] px-4 py-3 text-[13px] font-medium text-white hover:bg-[#4438DE] disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>

      {/* Vista rápida */}
      <div className="h-fit rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Vista rápida del PDF</p>
        <div className="rounded-2xl border border-white/[0.06] bg-[#11111b] p-5">
          <div className="mb-4 flex items-center gap-3">
            {logoIsData ? (
              <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/[0.05] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.logoUrl} alt="Logo" className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: form.colorPrimario }} />
            )}
            <div>
              <h3 className="text-[15px] font-semibold text-white">{form.nombreComercial || 'Tu empresa'}</h3>
              {form.telefono ? <p className="text-[12px] text-white/45">{form.telefono}</p> : null}
            </div>
          </div>
          <p className="text-[13px] text-white/45 italic">{form.textoEncabezado || 'Presupuestos prolijos con tu identidad.'}</p>
          <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-[12px] font-medium text-white/80">Defaults activos</p>
            <p className="mt-2 text-[13px] text-white/55">Validez: {form.diasValidezDefault} días</p>
            <p className="text-[13px] text-white/55">IVA inicial: {form.mostrarIvaDefault ? 'Activo' : 'Desactivado'}</p>
            <p className="text-[13px] text-white/55">Servicios guardados: {servicios.filter((s) => s.nombre.trim()).length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
