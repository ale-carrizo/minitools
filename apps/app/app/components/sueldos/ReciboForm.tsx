'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearRecibo, editarRecibo } from '@/lib/actions/recibo'
import {
  DEDUCCIONES_FRECUENTES,
  HABERES_FRECUENTES,
  calcularTotales,
  formatCurrency,
  generarDeduccionesLegales,
  todayString,
  type Concepto,
  type Modalidad,
  type Recibo,
} from '@/types/recibo'

function createConcepto(tipo: 'haber' | 'deduccion', descripcion = '', monto = 0): Concepto {
  return { id: crypto.randomUUID(), tipo, descripcion, monto, esFijo: true }
}

export default function ReciboForm({
  recibo,
  empleados,
  defaultPeriodo,
}: {
  recibo?: Recibo
  empleados: { id: string; nombre: string; cargo: string | null }[]
  defaultPeriodo: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'haber' | 'deduccion'>('haber')
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(recibo?.empleadoId ?? '')
  const [modalidad, setModalidad] = useState<Modalidad>(recibo?.empModalidad ?? 'dependencia')
  const [legalBase, setLegalBase] = useState<number | null>(null)
  const [nuevoConcepto, setNuevoConcepto] = useState({ descripcion: '', monto: 0 })
  const [form, setForm] = useState({
    empNombre: recibo?.empNombre ?? '',
    empCuil: recibo?.empCuil ?? '',
    empCargo: recibo?.empCargo ?? '',
    empFechaIngreso: recibo?.empFechaIngreso ?? '',
    periodo: recibo?.periodo ?? defaultPeriodo,
    fechaPago: recibo?.fechaPago ?? todayString(),
    nroFactura: recibo?.nroFactura ?? '',
    notas: recibo?.notas ?? '',
  })
  const [conceptos, setConceptos] = useState<Concepto[]>(
    recibo?.conceptos.length ? recibo.conceptos : [createConcepto('haber')],
  )

  const totals = useMemo(() => calcularTotales(conceptos), [conceptos])
  const hasLegalDeducciones = conceptos.some((concepto) =>
    ['Jubilación', 'Obra Social', 'PAMI / INSSJP'].includes(concepto.descripcion),
  )
  const haberesTotal = conceptos.filter((concepto) => concepto.tipo === 'haber').reduce((sum, concepto) => sum + concepto.monto, 0)
  const legalNeedsRefresh = hasLegalDeducciones && legalBase !== null && legalBase !== haberesTotal

  const conceptosActivos = conceptos.filter((concepto) => concepto.tipo === activeTab)
  const sugerencias = activeTab === 'haber' ? HABERES_FRECUENTES : DEDUCCIONES_FRECUENTES

  function addConcepto() {
    if (!nuevoConcepto.descripcion.trim()) return
    setConceptos((prev) => [...prev, createConcepto(activeTab, nuevoConcepto.descripcion.trim(), Number(nuevoConcepto.monto))])
    setNuevoConcepto({ descripcion: '', monto: 0 })
  }

  function removeConcepto(id: string) {
    setConceptos((prev) => prev.filter((concepto) => concepto.id !== id))
  }

  function applyLegal() {
    const deducciones = generarDeduccionesLegales(haberesTotal)
    setConceptos((prev) => [
      ...prev.filter((concepto) => !['Jubilación', 'Obra Social', 'PAMI / INSSJP'].includes(concepto.descripcion)),
      ...deducciones,
    ])
    setLegalBase(haberesTotal)
  }

  function submit() {
    setError(null)
    const payload = {
      empleadoId: empleadoSeleccionado || undefined,
      empNombre: form.empNombre,
      empCuil: form.empCuil || undefined,
      empCargo: form.empCargo || undefined,
      empFechaIngreso: form.empFechaIngreso || undefined,
      empModalidad: modalidad,
      periodo: form.periodo,
      fechaPago: form.fechaPago,
      conceptos,
      nroFactura: modalidad === 'monotributista' ? form.nroFactura || undefined : undefined,
      notas: form.notas || undefined,
    }

    startTransition(async () => {
      try {
        if (recibo) {
          await editarRecibo(recibo.id, payload)
        } else {
          await crearRecibo(payload)
        }
      } catch (err: any) {
        setError(err.message ?? 'No se pudo guardar el recibo')
      }
    })
  }

  return (
    <div className="max-w-6xl space-y-5">
      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">{error}</div> : null}

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Empleado</p>
        <div className="flex gap-2">
          {([
            { value: 'dependencia', label: '📋 Relación de dependencia' },
            { value: 'monotributista', label: '🧾 Monotributista' },
          ] as const).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setModalidad(option.value)}
              className={`rounded-xl px-3 py-2 text-[12px] font-medium ${modalidad === option.value ? 'bg-[#5448EE] text-white' : 'bg-white/[0.06] text-white/40 hover:text-white/70'}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {empleados.length > 0 ? (
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Cargar desde empleados</label>
            <select
              value={empleadoSeleccionado}
              onChange={(e) => {
                const value = e.target.value
                setEmpleadoSeleccionado(value)
                const empleado = empleados.find((item) => item.id === value)
                if (empleado) setForm((prev) => ({ ...prev, empNombre: empleado.nombre, empCargo: empleado.cargo ?? prev.empCargo }))
              }}
              className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
            >
              <option value="">Sin selección</option>
              {empleados.map((empleado) => <option key={empleado.id} value={empleado.id}>{empleado.nombre}</option>)}
            </select>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Nombre</label>
            <input value={form.empNombre} onChange={(e) => setForm((prev) => ({ ...prev, empNombre: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">CUIL</label>
            <input value={form.empCuil} onChange={(e) => setForm((prev) => ({ ...prev, empCuil: e.target.value }))} placeholder="20-12345678-9" className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Cargo</label>
            <input value={form.empCargo} onChange={(e) => setForm((prev) => ({ ...prev, empCargo: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Fecha de ingreso</label>
            <input type="date" value={form.empFechaIngreso} onChange={(e) => setForm((prev) => ({ ...prev, empFechaIngreso: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60" />
          </div>
        </div>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-4">Período y pago</p>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Período</label>
            <input type="month" value={form.periodo} onChange={(e) => setForm((prev) => ({ ...prev, periodo: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Fecha de pago</label>
            <input type="date" value={form.fechaPago} onChange={(e) => setForm((prev) => ({ ...prev, fechaPago: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          {modalidad === 'monotributista' ? (
            <div>
              <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Nro de factura</label>
              <input value={form.nroFactura} onChange={(e) => setForm((prev) => ({ ...prev, nroFactura: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60" />
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Conceptos</p>
          <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl">
            {(['haber', 'deduccion'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-lg ${activeTab === tab ? 'bg-[#5448EE] text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                {tab === 'haber' ? 'Haberes' : 'Deducciones'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {conceptosActivos.map((concepto) => (
            <div key={concepto.id} className="grid gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 md:grid-cols-[1fr,180px,auto]">
              <div className="text-[13px] text-white">{concepto.descripcion}</div>
              <div className={`text-[13px] font-medium ${concepto.tipo === 'haber' ? 'text-emerald-400' : 'text-red-400'}`}>
                {concepto.tipo === 'deduccion' ? '-' : ''}{formatCurrency(concepto.monto)}
              </div>
              <button type="button" onClick={() => removeConcepto(concepto.id)} className="text-red-400 text-[12px]">Eliminar</button>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr,180px,auto]">
          <div>
            <input
              list={`conceptos-${activeTab}`}
              value={nuevoConcepto.descripcion}
              onChange={(e) => setNuevoConcepto((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Descripción"
              className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
            />
            <datalist id={`conceptos-${activeTab}`}>
              {sugerencias.map((item) => <option key={item} value={item} />)}
            </datalist>
          </div>
          <input
            type="number"
            min="0"
            step="any"
            value={nuevoConcepto.monto}
            onChange={(e) => setNuevoConcepto((prev) => ({ ...prev, monto: Number(e.target.value) }))}
            placeholder="0.00"
            className="px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
          />
          <button type="button" onClick={addConcepto} className="bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium">
            + Agregar concepto
          </button>
        </div>

        {modalidad === 'dependencia' && activeTab === 'deduccion' ? (
          <div className="space-y-2">
            <button type="button" onClick={applyLegal} className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium">
              ⚡ Aplicar deducciones legales (Jub. 11% + OS 3% + PAMI 3%)
            </button>
            {hasLegalDeducciones ? (
              <p className="text-[11px] text-yellow-300">⚠️ Si modificás los haberes, volvé a aplicar{legalNeedsRefresh ? ' (hay cambios pendientes)' : ''}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr,360px]">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Notas internas</label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm((prev) => ({ ...prev, notas: e.target.value }))}
            rows={5}
            className="w-full px-3 py-2.5 text-[13px] bg-white/[0.05] border border-white/[0.09] rounded-xl text-white focus:outline-none focus:border-[#5448EE]/60"
          />
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-4">Resumen</p>
          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between text-emerald-400"><span>Total haberes</span><span>{formatCurrency(totals.totalHaberes)}</span></div>
            <div className="flex justify-between text-red-400"><span>Total deducciones</span><span>-{formatCurrency(totals.totalDeducciones)}</span></div>
            <div className="border-t border-white/[0.06] pt-3 flex justify-between text-[18px] font-semibold text-white">
              <span>Neto a cobrar</span>
              <span>{formatCurrency(totals.netoAPagar)}</span>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <Link href={recibo ? `/dashboard/sueldos/${recibo.id}` : '/dashboard/sueldos'} className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-4 py-2.5 text-center text-[13px] font-medium">
              Cancelar
            </Link>
            <button
              type="button"
              onClick={submit}
              disabled={isPending || !form.empNombre.trim() || conceptos.length === 0}
              className="bg-[#5448EE] hover:bg-[#4438DE] text-white rounded-xl px-4 py-2.5 text-[13px] font-medium disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : recibo ? 'Guardar cambios' : 'Guardar borrador'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
