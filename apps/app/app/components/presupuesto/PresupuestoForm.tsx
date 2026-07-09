'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { crearPresupuesto, editarPresupuesto } from '@/lib/actions/presupuesto'
import { todayAR } from '@/lib/date'
import {
  calcularTotales,
  formatCurrency,
  MONEDAS,
  type Cliente,
  type Presupuesto,
  type PresupuestoServicioFrecuente,
  type PresupuestoTemplate,
} from '@/types/presupuesto'

interface Props {
  clientes: Cliente[]
  presupuesto?: Presupuesto
  template?: PresupuestoTemplate | null
}

type FormItem = {
  orden: number
  descripcion: string
  cantidad: number
  precioUnitario: number
}

function todayDate() {
  return todayAR()
}

function addDays(date: string, days: number) {
  const base = new Date(`${date}T00:00:00`)
  base.setDate(base.getDate() + days)
  return base.toISOString().slice(0, 10)
}

function buildDefaultItem(servicio?: PresupuestoServicioFrecuente): FormItem {
  return {
    orden: 1,
    descripcion: servicio?.descripcion?.trim()
      ? `${servicio.nombre} - ${servicio.descripcion}`
      : servicio?.nombre ?? '',
    cantidad: 1,
    precioUnitario: servicio?.precioSugerido ?? 0,
  }
}

export default function PresupuestoForm({ clientes, presupuesto, template }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = Boolean(presupuesto)
  const defaultFechaEmision = presupuesto?.fechaEmision ?? todayDate()
  const [form, setForm] = useState({
    titulo: presupuesto?.titulo ?? '',
    clienteId: presupuesto?.clienteId ?? '',
    moneda: presupuesto?.moneda ?? 'ARS',
    fechaEmision: defaultFechaEmision,
    fechaVence: presupuesto?.fechaVence ?? (!isEdit && template?.diasValidezDefault ? addDays(defaultFechaEmision, template.diasValidezDefault) : ''),
    descuento: presupuesto?.descuento ?? 0,
    iva: presupuesto?.iva ?? (template?.mostrarIvaDefault === false ? 0 : 21),
    notas: presupuesto?.notas ?? template?.condicionesDefault ?? '',
    notasCliente: presupuesto?.notasCliente ?? template?.notasClienteDefault ?? '',
  })
  const [ivaHabilitado, setIvaHabilitado] = useState(presupuesto ? presupuesto.iva > 0 : (template?.mostrarIvaDefault ?? true))
  const [items, setItems] = useState<FormItem[]>(
    presupuesto?.items.length
      ? presupuesto.items.map((item) => ({
          orden: item.orden,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        }))
      : [buildDefaultItem()],
  )

  const totals = useMemo(
    () => calcularTotales(items, Number(form.descuento), Number(form.iva)),
    [form.descuento, form.iva, items],
  )

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setItem(index: number, patch: Partial<FormItem>) {
    setItems((prev) => prev.map((item, i) => (i !== index ? item : { ...item, ...patch })))
  }

  function addItem() {
    setItems((prev) => [...prev, { orden: prev.length + 1, descripcion: '', cantidad: 1, precioUnitario: 0 }])
  }

  function addServicio(servicio: PresupuestoServicioFrecuente) {
    setItems((prev) => {
      const servicioItem = buildDefaultItem(servicio)
      if (prev.length === 1 && !prev[0].descripcion.trim() && prev[0].cantidad === 1 && prev[0].precioUnitario === 0) {
        return [{ ...servicioItem, orden: 1 }]
      }
      return [...prev, { ...servicioItem, orden: prev.length + 1 }]
    })
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, orden: i + 1 })))
  }

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= items.length) return
    const next = [...items]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
    setItems(next.map((item, i) => ({ ...item, orden: i + 1 })))
  }

  function handleSubmit() {
    setError(null)
    const payload = {
      titulo: form.titulo,
      clienteId: form.clienteId || undefined,
      moneda: form.moneda,
      fechaEmision: form.fechaEmision,
      fechaVence: form.fechaVence || undefined,
      descuento: Number(form.descuento),
      iva: ivaHabilitado ? Number(form.iva) : 0,
      notas: form.notas || undefined,
      notasCliente: form.notasCliente || undefined,
      items: items.map((item, index) => ({
        orden: index + 1,
        descripcion: item.descripcion,
        cantidad: Number(item.cantidad),
        precioUnitario: Number(item.precioUnitario),
      })),
    }

    startTransition(async () => {
      try {
        if (isEdit) {
          await editarPresupuesto(presupuesto!.id, payload)
          router.push(`/dashboard/presupuestos/${presupuesto!.id}`)
          router.refresh()
        } else {
          await crearPresupuesto(payload)
        }
      } catch (err: any) {
        setError(err.message ?? 'No se pudo guardar el presupuesto')
      }
    })
  }

  return (
    <div className="max-w-5xl space-y-5">
      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          {error}
        </div>
      ) : null}

      {/* Encabezado */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Encabezado</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Título</label>
            <input
              value={form.titulo}
              onChange={(e) => setField('titulo', e.target.value)}
              placeholder="Ej: Servicio técnico mensual"
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
            />
          </div>

          {/* Cliente: select simple, opcional */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                Cliente <span className="text-white/20 normal-case tracking-normal font-normal">(opcional)</span>
              </label>
              <Link href="/dashboard/presupuestos/clientes" className="text-[11px] text-[#8880F5] hover:text-white transition-colors">
                + Nuevo cliente
              </Link>
            </div>
            <select
              value={form.clienteId}
              onChange={(e) => setField('clienteId', e.target.value)}
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white focus:border-[#5448EE]/60 focus:outline-none"
            >
              <option value="">Sin cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}{c.empresa ? ` · ${c.empresa}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Moneda */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Moneda</label>
            <select
              value={form.moneda}
              onChange={(e) => setField('moneda', e.target.value)}
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white focus:border-[#5448EE]/60 focus:outline-none"
            >
              {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Fechas */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Fecha emisión</label>
            <input
              type="date"
              value={form.fechaEmision}
              onChange={(e) => setField('fechaEmision', e.target.value)}
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white focus:border-[#5448EE]/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">
              Fecha vence <span className="text-white/20 normal-case tracking-normal font-normal">(opcional)</span>
            </label>
            <input
              type="date"
              value={form.fechaVence}
              onChange={(e) => setField('fechaVence', e.target.value)}
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white focus:border-[#5448EE]/60 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <div className="mb-4 flex items-center justify-end">
          <button type="button" onClick={addItem} className="rounded-xl bg-[#5448EE] px-3 py-2 text-[12px] font-medium text-white hover:bg-[#4438DE]">
            + Agregar item
          </button>
        </div>

        {template?.serviciosFrecuentes.length ? (
          <div className="mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">Servicios frecuentes</p>
            <div className="flex flex-wrap gap-2">
              {template.serviciosFrecuentes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => addServicio(s)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/70 transition hover:border-[#5448EE]/40 hover:text-white"
                >
                  {s.nombre}{s.precioSugerido > 0 ? ` · ${formatCurrency(s.precioSugerido, form.moneda)}` : ''}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {items.map((item, index) => {
            const subtotal = item.cantidad * item.precioUnitario
            return (
              <div key={`${item.orden}-${index}`} className="grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 md:grid-cols-[1.8fr,0.6fr,0.8fr,0.8fr,auto]">
                <div className="col-span-2 md:col-span-1">
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/40 md:hidden">
                    Descripción
                  </label>
                  <input
                    value={item.descripcion}
                    onChange={(e) => setItem(index, { descripcion: e.target.value })}
                    placeholder="Descripcion del item"
                    className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/40 md:hidden">
                    Cantidad
                  </label>
                  <input
                    type="number" step="any"
                    value={item.cantidad}
                    onChange={(e) => setItem(index, { cantidad: Number(e.target.value) })}
                    aria-label="Cantidad"
                    className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white focus:border-[#5448EE]/60 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/40 md:hidden">
                    Precio unitario
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-white/35">$</span>
                    <input
                      type="number" step="any"
                      value={item.precioUnitario === 0 ? '' : item.precioUnitario}
                      onChange={(e) => setItem(index, { precioUnitario: Number(e.target.value || 0) })}
                      aria-label="Precio unitario"
                      placeholder="0"
                      className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] pl-7 pr-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/40 md:hidden">
                    Subtotal
                  </label>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[13px] font-medium text-white/70">
                    {formatCurrency(subtotal, form.moneda)}
                  </div>
                </div>
                <div className="col-span-2 flex justify-end gap-2 md:col-span-1">
                  <button type="button" onClick={() => moveItem(index, -1)} className="rounded-xl border border-white/10 px-2.5 py-2 text-white/50 hover:text-white">↑</button>
                  <button type="button" onClick={() => moveItem(index, 1)} className="rounded-xl border border-white/10 px-2.5 py-2 text-white/50 hover:text-white">↓</button>
                  <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1} className="rounded-xl border border-red-500/20 px-2.5 py-2 text-red-400 disabled:opacity-40">×</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Totales + ajustes */}
      <div className="grid gap-5 lg:grid-cols-[1fr,360px]">
        {/* Notas para el cliente + descuento/IVA */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Ajustes y notas</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Descuento %</label>
              <input
                type="number" step="any"
                value={form.descuento}
                onChange={(e) => setField('descuento', Number(e.target.value))}
                className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white focus:border-[#5448EE]/60 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">IVA</label>
              <label className="flex items-center gap-2 text-[12px] text-white/60">
                <input
                  type="checkbox"
                  checked={ivaHabilitado}
                  onChange={(e) => setIvaHabilitado(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/[0.05] accent-[#5448EE]"
                />
                Aplicar IVA al total
              </label>
              <input
                type="number" step="any"
                value={form.iva}
                onChange={(e) => setField('iva', Number(e.target.value))}
                disabled={!ivaHabilitado}
                className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white disabled:opacity-40 focus:border-[#5448EE]/60 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">
              Notas para el cliente <span className="text-white/20 normal-case tracking-normal font-normal">(aparecen en el PDF)</span>
            </label>
            <textarea
              value={form.notasCliente}
              onChange={(e) => setField('notasCliente', e.target.value)}
              placeholder="Formas de pago, aclaraciones, condiciones comerciales..."
              rows={4}
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-[#5448EE]/60 focus:outline-none"
            />
          </div>
        </div>

        {/* Totales + acciones */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">Totales</p>
          <div className="space-y-3 text-[13px]">
            <div className="flex items-center justify-between text-white/55"><span>Subtotal</span><span>{formatCurrency(totals.subtotal, form.moneda)}</span></div>
            <div className="flex items-center justify-between text-white/55"><span>Descuento</span><span>- {formatCurrency(totals.descuentoMonto, form.moneda)}</span></div>
            <div className="flex items-center justify-between text-white/55"><span>Base</span><span>{formatCurrency(totals.base, form.moneda)}</span></div>
            <div className="flex items-center justify-between text-white/55"><span>{ivaHabilitado ? `IVA ${form.iva}%` : 'Sin IVA'}</span><span>{formatCurrency(totals.ivaMonto, form.moneda)}</span></div>
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-[18px] font-semibold text-white">
              <span>Total</span>
              <span>{formatCurrency(totals.totalFinal, form.moneda)}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Link
              href={isEdit ? `/dashboard/presupuestos/${presupuesto!.id}` : '/dashboard/presupuestos'}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-center text-[13px] font-medium text-white/50 hover:text-white"
            >
              Cancelar
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !form.titulo.trim()}
              className="rounded-xl bg-[#5448EE] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#4438DE] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar borrador'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
