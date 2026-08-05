'use client'

import { useState, useTransition } from 'react'
import { getReportesResumen, guardarReportesConfig } from '@/lib/actions/reportes'
import { todayAR } from '@/lib/date'
import {
  ESTADO_COBRO_LABELS, ESTADO_PRESUPUESTO_LABELS,
  type ModulosVisibles, type PeriodoVista, type ReportesConfig, type ReportesResumen,
} from '@/types/reportes'

const money = (v: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v || 0)

type Tab = 'resumen' | 'ventas' | 'presupuestos' | 'clientes' | 'tareas' | 'config'

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
function startOfWeek(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return d.toISOString().slice(0, 10)
}
function startOfMonth(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}
function endOfMonth(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)
}
function rangoPara(vista: PeriodoVista, fecha: string, desdeCustom: string, hastaCustom: string) {
  if (vista === 'dia') return { desde: fecha, hasta: fecha }
  if (vista === 'semana') { const d = startOfWeek(fecha); return { desde: d, hasta: addDays(d, 6) } }
  if (vista === 'personalizado') return { desde: desdeCustom, hasta: hastaCustom }
  return { desde: startOfMonth(fecha), hasta: endOfMonth(fecha) }
}

function fmtFecha(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}`
}

function BarList({ data, mode }: { data: { label: string; value: number }[]; mode: 'money' | 'num' }) {
  const max = data.length ? Math.max(...data.map((d) => d.value)) : 0
  if (!data.length) return <p className="text-[12px] text-white/30 py-3 text-center">Sin datos todavía</p>
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex justify-between text-[12px] font-semibold text-white/75 mb-1">
            <span>{d.label}</span>
            <span>{mode === 'money' ? money(d.value) : d.value}</span>
          </div>
          <div className="h-[9px] rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full rounded-full bg-[#326fee]" style={{ width: `${max ? Math.max(2, Math.round((d.value / max) * 100)) : 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2.5 min-w-[150px]">
      <p className="text-[10px] font-bold uppercase text-white/40 mb-1">{label}</p>
      <p className="text-[18px] font-bold text-white">{value}</p>
    </div>
  )
}

interface Props {
  configInicial:  ReportesConfig
  resumenInicial: ReportesResumen
}

export default function ReportesClient({ configInicial, resumenInicial }: Props) {
  const hoy = todayAR()
  const [tab, setTab] = useState<Tab>('resumen')
  const [vista, setVista] = useState<PeriodoVista>('mes')
  const [fecha, setFecha] = useState(hoy)
  const [desdeCustom, setDesdeCustom] = useState(startOfMonth(hoy))
  const [hastaCustom, setHastaCustom] = useState(hoy)
  const [resumen, setResumen] = useState(resumenInicial)
  const [config, setConfig] = useState(configInicial)
  const [, startTrans] = useTransition()

  function recargar(nuevaVista: PeriodoVista, nuevaFecha: string, d = desdeCustom, h = hastaCustom) {
    const { desde, hasta } = rangoPara(nuevaVista, nuevaFecha, d, h)
    startTrans(async () => {
      setResumen(await getReportesResumen(desde, hasta))
    })
  }

  const tabsDef: [Tab, string, boolean][] = [
    ['resumen', 'Resumen', true],
    ['ventas', 'Ventas', config.modulos.ventas],
    ['presupuestos', 'Presupuestos', config.modulos.presupuestos],
    ['clientes', 'Clientes', config.modulos.clientes],
    ['tareas', 'Tareas', config.modulos.tareas],
    ['config', 'Configuración', true],
  ]

  const ventasTotal = resumen.ventas.caja.total + resumen.ventas.libreta.total + resumen.ventas.facturador.total

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">Vista</label>
            <select value={vista} onChange={(e) => { const v = e.target.value as PeriodoVista; setVista(v); recargar(v, fecha) }}
              className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60">
              <option value="dia">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          {vista === 'personalizado' ? (
            <>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-white/50">Desde</label>
                <input type="date" value={desdeCustom} onChange={(e) => { setDesdeCustom(e.target.value); recargar('personalizado', fecha, e.target.value, hastaCustom) }}
                  className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-white/50">Hasta</label>
                <input type="date" value={hastaCustom} onChange={(e) => { setHastaCustom(e.target.value); recargar('personalizado', fecha, desdeCustom, e.target.value) }}
                  className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-white/50">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => { setFecha(e.target.value); recargar(vista, e.target.value) }}
                className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
            </div>
          )}
          <span className="ml-auto rounded-full bg-white/[0.06] text-white/60 text-[12px] font-semibold px-3 py-1.5">
            {fmtFecha(resumen.desde)} – {fmtFecha(resumen.hasta)}
          </span>
        </div>
      </div>

      <nav className="flex gap-4 border-b border-white/[0.06] overflow-x-auto">
        {tabsDef.filter(([, , visible]) => visible).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className={`whitespace-nowrap px-1 pb-2.5 text-[12px] font-semibold border-b-2 transition-colors ${tab === id ? 'text-[#8880F5] border-[#8880F5]' : 'text-white/35 border-transparent hover:text-white/70'}`}>
            {label}
          </button>
        ))}
      </nav>

      {tab === 'resumen' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2.5">
            <MetricCard label="Ventas del período" value={money(ventasTotal)} />
            <MetricCard label="Presupuestado" value={money(resumen.presupuestos.totalMonto)} />
            <MetricCard label="Cobros pendientes" value={money(resumen.clientes.pendienteMonto)} />
            <MetricCard label="Tareas abiertas" value={String(resumen.tareas.abiertas)} />
            <MetricCard label="Clientes activos" value={String(resumen.clientes.activos)} />
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <h2 className="text-[14px] font-semibold text-white mb-3">Evolución del período</h2>
            <BarList data={resumen.evolucionDiaria.map((d) => ({ label: fmtFecha(d.fecha), value: d.total }))} mode="money" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <h2 className="text-[14px] font-semibold text-white mb-3">Alertas</h2>
              <div className="space-y-2">
                {resumen.clientes.vencenHoyMonto > 0 && (
                  <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                    <span className="text-[12px] text-amber-300">Cobros que vencen hoy</span>
                    <span className="text-[12px] font-semibold text-amber-300">{money(resumen.clientes.vencenHoyMonto)}</span>
                  </div>
                )}
                {resumen.tareas.vencidas > 0 && (
                  <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2">
                    <span className="text-[12px] text-red-300">Tareas vencidas</span>
                    <span className="text-[12px] font-semibold text-red-300">{resumen.tareas.vencidas}</span>
                  </div>
                )}
                {resumen.tareas.vencenHoy > 0 && (
                  <div className="flex items-center justify-between rounded-xl border border-[#8880F5]/20 bg-[#5448EE]/10 px-3 py-2">
                    <span className="text-[12px] text-[#8880F5]">Tareas que vencen hoy</span>
                    <span className="text-[12px] font-semibold text-[#8880F5]">{resumen.tareas.vencenHoy}</span>
                  </div>
                )}
                {resumen.clientes.vencenHoyMonto === 0 && resumen.tareas.vencidas === 0 && resumen.tareas.vencenHoy === 0 && (
                  <p className="text-[12px] text-white/30 py-3 text-center">Sin alertas por ahora 🎉</p>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <h2 className="text-[14px] font-semibold text-white mb-3">Presupuestos por estado</h2>
              <BarList data={Object.entries(resumen.presupuestos.porEstado).map(([estado, v]) => ({ label: `${ESTADO_PRESUPUESTO_LABELS[estado] ?? estado} · ${v.cantidad}`, value: v.monto }))} mode="money" />
            </div>
          </div>
        </div>
      )}

      {tab === 'ventas' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2.5">
            <MetricCard label="Registro de Pagos" value={money(resumen.ventas.caja.total)} />
            <MetricCard label="Registro de Ventas y Stock" value={money(resumen.ventas.libreta.total)} />
            <MetricCard label="Facturador" value={money(resumen.ventas.facturador.total)} />
          </div>
          <p className="text-[11px] text-white/30">Se muestran por separado porque una misma venta puede estar cargada en más de un módulo — sumarlas podría duplicar el total.</p>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <h2 className="text-[14px] font-semibold text-white mb-3">Tickets / comprobantes</h2>
            <BarList data={[
              { label: 'Registro de Pagos', value: resumen.ventas.caja.tickets },
              { label: 'Registro de Ventas y Stock', value: resumen.ventas.libreta.tickets },
              { label: 'Facturador', value: resumen.ventas.facturador.comprobantes },
            ]} mode="num" />
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <h2 className="text-[14px] font-semibold text-white mb-3">Evolución diaria</h2>
            <BarList data={resumen.evolucionDiaria.map((d) => ({ label: fmtFecha(d.fecha), value: d.total }))} mode="money" />
          </div>
        </div>
      )}

      {tab === 'presupuestos' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2.5">
            <MetricCard label="Total presupuestado" value={money(resumen.presupuestos.totalMonto)} />
            {Object.entries(resumen.presupuestos.porEstado).map(([estado, v]) => (
              <MetricCard key={estado} label={ESTADO_PRESUPUESTO_LABELS[estado] ?? estado} value={String(v.cantidad)} />
            ))}
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <h2 className="text-[14px] font-semibold text-white mb-3">Monto por estado</h2>
            <BarList data={Object.entries(resumen.presupuestos.porEstado).map(([estado, v]) => ({ label: `${ESTADO_PRESUPUESTO_LABELS[estado] ?? estado} · ${v.cantidad}`, value: v.monto }))} mode="money" />
          </div>
        </div>
      )}

      {tab === 'clientes' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2.5">
            <MetricCard label="Clientes activos" value={String(resumen.clientes.activos)} />
            <MetricCard label="Pendiente de cobro" value={money(resumen.clientes.pendienteMonto)} />
            <MetricCard label="Vence hoy" value={money(resumen.clientes.vencenHoyMonto)} />
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <h2 className="text-[14px] font-semibold text-white mb-3">Cobros por estado</h2>
            <BarList data={Object.entries(resumen.clientes.porEstado).map(([estado, v]) => ({ label: `${ESTADO_COBRO_LABELS[estado] ?? estado} · ${v.cantidad}`, value: v.monto }))} mode="money" />
          </div>
        </div>
      )}

      {tab === 'tareas' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2.5">
            <MetricCard label="Abiertas" value={String(resumen.tareas.abiertas)} />
            <MetricCard label="Vencen hoy" value={String(resumen.tareas.vencenHoy)} />
            <MetricCard label="Vencidas" value={String(resumen.tareas.vencidas)} />
            <MetricCard label="Completadas" value={String(resumen.tareas.completadas)} />
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <h2 className="text-[14px] font-semibold text-white mb-3">Estado operativo</h2>
            <BarList data={[
              { label: 'Abiertas', value: resumen.tareas.abiertas },
              { label: 'Vencen hoy', value: resumen.tareas.vencenHoy },
              { label: 'Vencidas', value: resumen.tareas.vencidas },
              { label: 'Completadas', value: resumen.tareas.completadas },
            ]} mode="num" />
          </div>
        </div>
      )}

      {tab === 'config' && <ConfigTab config={config} onConfigChange={setConfig} />}
    </div>
  )
}

function ConfigTab({ config, onConfigChange }: { config: ReportesConfig; onConfigChange: (c: ReportesConfig) => void }) {
  const [modulos, setModulos] = useState<ModulosVisibles>(config.modulos)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  async function handleGuardar() {
    setGuardando(true)
    setGuardado(false)
    try {
      await guardarReportesConfig(modulos)
      onConfigChange({ ...config, modulos })
      setGuardado(true)
    } finally {
      setGuardando(false)
    }
  }

  const OPCIONES: [keyof ModulosVisibles, string][] = [
    ['ventas', 'Ventas'],
    ['presupuestos', 'Presupuestos'],
    ['clientes', 'Clientes'],
    ['tareas', 'Tareas'],
  ]

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 max-w-md">
      <h2 className="text-[14px] font-semibold text-white mb-1">Módulos visibles</h2>
      <p className="text-[12px] text-white/40 mb-3">Elegí qué pestañas de reportes querés ver.</p>
      <div className="space-y-2 mb-4">
        {OPCIONES.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-[12px] font-semibold text-white/70">
            <input type="checkbox" checked={modulos[key]} onChange={(e) => setModulos((prev) => ({ ...prev, [key]: e.target.checked }))}
              className="w-[18px] h-[18px] accent-[#5448EE]" />
            {label}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={handleGuardar} disabled={guardando} className="rounded-xl bg-[#5448EE] px-4 py-2.5 text-[12px] font-medium text-white btn-solid-text hover:bg-[#4438DE] disabled:opacity-50">
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        {guardado && <span className="text-[12px] text-emerald-400">Guardado ✓</span>}
      </div>
    </div>
  )
}
