'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import {
  abrirCaja, cerrarCaja, crearVenta, getHistorialCajas, getReporteMes,
  getVentasDeCaja, guardarLibretaConfig,
} from '@/lib/actions/libreta'
import { crearProducto, getProductos, registrarMovimiento } from '@/lib/actions/stock'
import ImportarProductosCard from '@/app/components/stock/ImportarProductosCard'
import { todayAR } from '@/lib/date'
import {
  calcularTotales,
  type CamposConfig, type CampoKey, type LibretaCaja, type LibretaConfig, type LibretaVenta,
} from '@/types/libreta'
import type { Producto } from '@/types/stock'

const money = (v: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v || 0)
const qtyText = (v: number) => Number(v || 0).toLocaleString('es-AR', { maximumFractionDigits: 2 })

type Tab = 'caja' | 'stock' | 'historial' | 'config'

interface HistorialItem extends LibretaCaja { totalVentas: number; tickets: number }
interface Reporte {
  total: number; tickets: number; stockBajo: number
  porMedioPago: Record<string, number>; topProductos: Record<string, number>
}

interface Props {
  configInicial:     LibretaConfig
  cajaInicial:       LibretaCaja | null
  ventasIniciales:   LibretaVenta[]
  productos:         Producto[]
  historialInicial:  HistorialItem[]
  reporteInicial:    Reporte
  mesActual:         string
}

// ── Combobox de concepto con sugerencias de stock ──────────────────────────────
function ConceptoCombobox({ productos, value, onChange, onSeleccionar }: {
  productos: Producto[]
  value: string
  onChange: (v: string) => void
  onSeleccionar: (p: Producto) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickFuera)
    return () => document.removeEventListener('mousedown', onClickFuera)
  }, [])

  const q = value.trim().toLowerCase()
  const filtrados = (q ? productos.filter((p) => p.nombre.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q)) : productos).slice(0, 8)

  return (
    <div ref={ref} className="relative">
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Escribir o buscar en stock"
        className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
      />
      {open && filtrados.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-white/[0.10] light:border-black/[0.10] bg-[#17162f] light:bg-[#ffffff] shadow-xl">
          {filtrados.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onSeleccionar(p); setOpen(false) }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] text-white hover:bg-white/[0.06] transition-colors"
            >
              <span className="truncate">{p.nombre}<span className="text-white/30"> · stock {p.stock}</span></span>
              <span className="flex-shrink-0 text-white/40 text-[11px]">{money(p.precioVenta)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LibretaClient({
  configInicial, cajaInicial, ventasIniciales, productos, historialInicial, reporteInicial, mesActual,
}: Props) {
  const [tab, setTab] = useState<Tab>('caja')
  const [config, setConfig] = useState(configInicial)
  const [caja, setCaja] = useState(cajaInicial)
  const [ventas, setVentas] = useState(ventasIniciales)
  const [error, setError] = useState('')
  const [, startTrans] = useTransition()

  // ── Abrir caja ──────────────────────────────────────────────────────────────
  const [fecha, setFecha] = useState(todayAR())
  const [montoInicial, setMontoInicial] = useState('0')
  const [notaApertura, setNotaApertura] = useState('')
  const [abriendo, setAbriendo] = useState(false)

  async function handleAbrirCaja(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setAbriendo(true)
    try {
      const nueva = await abrirCaja({ fecha, montoInicial: Number(montoInicial) || 0, nota: notaApertura })
      setCaja(nueva)
      setVentas([])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAbriendo(false)
    }
  }

  // ── Agregar venta ───────────────────────────────────────────────────────────
  const [concepto, setConcepto] = useState('')
  const [productoId, setProductoId] = useState<string | null>(null)
  const [cantidad, setCantidad] = useState('1')
  const [precio, setPrecio] = useState('')
  const [medioPago, setMedioPago] = useState(config.mediosPago[0] ?? 'Efectivo')
  const [cliente, setCliente] = useState('')
  const [nota, setNota] = useState('')
  const [guardandoVenta, setGuardandoVenta] = useState(false)

  function resetVentaForm() {
    setConcepto(''); setProductoId(null); setCantidad('1'); setPrecio('')
    setCliente(''); setNota('')
  }

  async function handleAgregarVenta(e: React.FormEvent) {
    e.preventDefault()
    if (!caja) return
    setError('')
    if (!concepto.trim()) { setError('Ingresá el concepto o mercadería'); return }
    const cant = config.campos.qty.visible ? Number(cantidad) : 1
    const prec = config.campos.price.visible ? Number(precio) : 0
    if (!cant || cant <= 0) { setError('Ingresá una cantidad válida'); return }
    setGuardandoVenta(true)
    try {
      const nueva = await crearVenta({
        cajaId: caja.id,
        productoId,
        concepto,
        cantidad: cant,
        precio: prec,
        medioPago: config.campos.payment.visible ? medioPago : undefined,
        cliente: config.campos.customer.visible ? cliente : undefined,
        nota: config.campos.note.visible ? nota : undefined,
        descontarStock: config.controlarStock && Boolean(productoId),
      })
      setVentas((prev) => [nueva, ...prev])
      if (config.controlarStock && productoId) {
        const descontado = Math.round(cant)
        setStockList((prev) => prev.map((p) => (p.id === productoId ? { ...p, stock: p.stock - descontado } : p)))
      }
      resetVentaForm()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGuardandoVenta(false)
    }
  }

  // ── Cerrar caja ─────────────────────────────────────────────────────────────
  const [efectivoContado, setEfectivoContado] = useState('')
  const [notaCierre, setNotaCierre] = useState('')
  const [cerrando, setCerrando] = useState(false)

  async function handleCerrarCaja(e: React.FormEvent) {
    e.preventDefault()
    if (!caja) return
    setCerrando(true)
    setError('')
    try {
      await cerrarCaja(caja.id, {
        efectivoContado: efectivoContado ? Number(efectivoContado) : undefined,
        notaCierre,
      })
      setCaja(null)
      setVentas([])
      setEfectivoContado('')
      setNotaCierre('')
      startTrans(async () => {
        const h = await getHistorialCajas()
        setHistorial(h)
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCerrando(false)
    }
  }

  const totales = calcularTotales(caja, ventas)

  // ── Stock rápido ────────────────────────────────────────────────────────────
  const [stockList, setStockList] = useState(productos)
  const [stockSearch, setStockSearch] = useState('')
  const [movQuery, setMovQuery] = useState('')
  const [movProductoId, setMovProductoId] = useState('')
  const [movOpen, setMovOpen] = useState(false)
  const [movCantidad, setMovCantidad] = useState('')
  const [movTipo, setMovTipo] = useState<'entrada' | 'salida'>('entrada')
  const [movLoading, setMovLoading] = useState(false)
  const movRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (movRef.current && !movRef.current.contains(e.target as Node)) setMovOpen(false)
    }
    document.addEventListener('mousedown', onClickFuera)
    return () => document.removeEventListener('mousedown', onClickFuera)
  }, [])

  const stockFiltrado = useMemo(() => {
    const q = stockSearch.trim().toLowerCase()
    return (q ? stockList.filter((p) => p.nombre.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q)) : stockList)
      .slice().sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [stockList, stockSearch])

  const movFiltrados = useMemo(() => {
    const q = movQuery.trim().toLowerCase()
    return (q ? stockList.filter((p) => p.nombre.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q)) : stockList).slice(0, 8)
  }, [stockList, movQuery])

  const movHayCoincidenciaExacta = stockList.some((p) => p.nombre.trim().toLowerCase() === movQuery.trim().toLowerCase())

  async function handleMovimiento(e: React.FormEvent) {
    e.preventDefault()
    if (!movCantidad) return
    setMovLoading(true)
    setError('')
    try {
      if (movProductoId) {
        const actualizado = await registrarMovimiento(movProductoId, movTipo, Number(movCantidad), 'Libreta de ventas')
        setStockList((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)))
      } else if (movQuery.trim()) {
        const nuevo = await crearProducto({
          nombre: movQuery.trim(),
          precioCosto: 0,
          precioVenta: 0,
          stock: Number(movCantidad) || 0,
          stockMinimo: 0,
          unidad: 'unidad',
        })
        setStockList((prev) => [...prev, nuevo])
      } else {
        setMovLoading(false)
        return
      }
      setMovCantidad('')
      setMovQuery('')
      setMovProductoId('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setMovLoading(false)
    }
  }

  // ── Historial y reportes ────────────────────────────────────────────────────
  const [historial, setHistorial] = useState(historialInicial)
  const [historyDate, setHistoryDate] = useState('')
  const [historyMonth, setHistoryMonth] = useState(mesActual)
  const [reporte, setReporte] = useState(reporteInicial)

  function filtrarHistorial(fechaFiltro: string, mesFiltro: string) {
    startTrans(async () => {
      const h = fechaFiltro
        ? await getHistorialCajas(fechaFiltro, fechaFiltro)
        : await getHistorialCajas(`${mesFiltro}-01`, `${mesFiltro}-31`)
      setHistorial(h)
    })
  }

  // Los datos de historial/reportes se piden una sola vez al cargar la página,
  // así que quedan desactualizados si el usuario abre caja, agrega ventas o
  // cierra caja sin recargar. Refrescamos cada vez que entra a esta pestaña.
  useEffect(() => {
    if (tab !== 'historial') return
    filtrarHistorial(historyDate, historyMonth)
    startTrans(async () => {
      const r = await getReporteMes(historyMonth)
      setReporte(r)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  function cambiarMesReporte(mes: string) {
    setHistoryMonth(mes)
    setHistoryDate('')
    filtrarHistorial('', mes)
    startTrans(async () => {
      const r = await getReporteMes(mes)
      setReporte(r)
    })
  }

  // ── Configuración ───────────────────────────────────────────────────────────
  const [campos, setCampos] = useState<CamposConfig>(config.campos)
  const [controlarStock, setControlarStock] = useState(config.controlarStock)
  const [mediosPago, setMediosPago] = useState(config.mediosPago)
  const [nuevoMedio, setNuevoMedio] = useState('')
  const [guardandoConfig, setGuardandoConfig] = useState(false)

  function setCampo(key: CampoKey, patch: Partial<CamposConfig[CampoKey]>) {
    setCampos((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  async function handleGuardarConfig(e: React.FormEvent) {
    e.preventDefault()
    setGuardandoConfig(true)
    setError('')
    try {
      await guardarLibretaConfig({ controlarStock, campos, mediosPago })
      setConfig({ ...config, controlarStock, campos, mediosPago })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGuardandoConfig(false)
    }
  }

  function agregarMedio() {
    const name = nuevoMedio.trim()
    if (!name) return
    if (mediosPago.some((m) => m.toLowerCase() === name.toLowerCase())) { setNuevoMedio(''); return }
    setMediosPago((prev) => [...prev, name])
    setNuevoMedio('')
  }

  function quitarMedio(name: string) {
    if (mediosPago.length === 1) { setError('Tiene que quedar al menos un tipo de pago'); return }
    setMediosPago((prev) => prev.filter((m) => m !== name))
  }

  const CAMPO_LABELS: { key: CampoKey; tipos: string[] }[] = [
    { key: 'concept',  tipos: ['texto'] },
    { key: 'qty',      tipos: ['numero'] },
    { key: 'price',    tipos: ['numero'] },
    { key: 'payment',  tipos: ['lista'] },
    { key: 'customer', tipos: ['texto', 'numero', 'fecha'] },
    { key: 'note',     tipos: ['texto', 'numero', 'fecha'] },
  ]

  return (
    <div className="max-w-5xl">
      <div className="mb-5 flex items-center justify-end">
        <span className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[12px] font-semibold ${caja ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}>
          <span className={`w-2 h-2 rounded-full ${caja ? 'bg-emerald-400' : 'bg-red-400'}`} />
          {caja ? `Caja abierta: ${caja.fecha}` : 'Caja cerrada'}
        </span>
      </div>

      <nav className="flex gap-4 border-b border-white/[0.06] mb-4 overflow-x-auto">
        {([['caja', 'Caja'], ['stock', 'Stock'], ['historial', 'Historial y reportes'], ['config', 'Configuración']] as [Tab, string][]).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className={`whitespace-nowrap px-1 pb-2.5 text-[12px] font-semibold border-b-2 transition-colors ${tab === id ? 'text-[#8880F5] border-[#8880F5]' : 'text-white/35 border-transparent hover:text-white/70'}`}>
            {label}
          </button>
        ))}
      </nav>

      {error && (
        <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-400">{error}</div>
      )}

      {tab === 'caja' && (
        <div className="pb-20">
          {!caja ? (
            <form onSubmit={handleAbrirCaja} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-white/50">Fecha</label>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-white/50">Monto inicial</label>
                <input type="number" min="0" step="0.01" value={montoInicial} onChange={(e) => setMontoInicial(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-white/50">Nota</label>
                <input value={notaApertura} onChange={(e) => setNotaApertura(e.target.value)} placeholder="Turno o responsable"
                  className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
              </div>
              <div className="sm:col-span-3">
                <button type="submit" disabled={abriendo} className="rounded-xl bg-[#5448EE] px-4 py-2.5 text-[12px] font-medium text-white btn-solid-text hover:bg-[#4438DE] disabled:opacity-50">
                  {abriendo ? 'Abriendo…' : 'Abrir caja'}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl border border-[#8880F5]/20 bg-white/[0.03] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <h2 className="text-[14px] font-semibold text-white">Agregar venta</h2>
                <span className="rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold px-2.5 py-1">Caja abierta · {caja.fecha}</span>
              </div>
              <div className="p-4">
                <form onSubmit={handleAgregarVenta} className="grid gap-2.5 sm:grid-cols-12 items-end">
                  <div className="sm:col-span-4">
                    <label className="mb-1.5 block text-[11px] font-medium text-white/50">{campos.concept.label}</label>
                    <ConceptoCombobox
                      productos={stockList}
                      value={concepto}
                      onChange={(v) => { setConcepto(v); setProductoId(null) }}
                      onSeleccionar={(p) => { setConcepto(p.nombre); setProductoId(p.id); setPrecio(String(p.precioVenta)) }}
                    />
                  </div>
                  {campos.qty.visible && (
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[11px] font-medium text-white/50">{campos.qty.label}</label>
                      <input type="number" min="0.01" step="0.01" value={cantidad} onChange={(e) => setCantidad(e.target.value)}
                        className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
                    </div>
                  )}
                  {campos.price.visible && (
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[11px] font-medium text-white/50">{campos.price.label}</label>
                      <input type="number" min="0" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)}
                        className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
                    </div>
                  )}
                  {campos.payment.visible && (
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[11px] font-medium text-white/50">{campos.payment.label}</label>
                      <select value={medioPago} onChange={(e) => setMedioPago(e.target.value)}
                        className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60">
                        {config.mediosPago.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  )}
                  {campos.customer.visible && (
                    <div className="sm:col-span-3">
                      <label className="mb-1.5 block text-[11px] font-medium text-white/50">{campos.customer.label}</label>
                      <input value={cliente} onChange={(e) => setCliente(e.target.value)}
                        className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
                    </div>
                  )}
                  {campos.note.visible && (
                    <div className="sm:col-span-4">
                      <label className="mb-1.5 block text-[11px] font-medium text-white/50">{campos.note.label}</label>
                      <input value={nota} onChange={(e) => setNota(e.target.value)}
                        className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={guardandoVenta} className="w-full rounded-xl bg-[#5448EE] px-3 py-2.5 text-[12px] font-medium text-white btn-solid-text hover:bg-[#4438DE] disabled:opacity-50">
                      {guardandoVenta ? 'Agregando…' : 'Agregar'}
                    </button>
                  </div>
                </form>

                <div className="mt-4 rounded-xl border border-white/[0.08] overflow-x-auto">
                  <table className="w-full min-w-[640px] text-[12px]">
                    <thead>
                      <tr className="text-white/35 text-[11px] uppercase">
                        <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Hora</th>
                        <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Concepto</th>
                        <th className="text-right px-2.5 py-2 border-b border-white/[0.06]">Cant.</th>
                        <th className="text-right px-2.5 py-2 border-b border-white/[0.06]">Precio</th>
                        <th className="text-right px-2.5 py-2 border-b border-white/[0.06]">Total</th>
                        <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventas.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-5 text-white/30">Todavía no hay ventas en esta caja</td></tr>
                      ) : ventas.map((v) => (
                        <tr key={v.id} className="text-white/80">
                          <td className="px-2.5 py-2 border-b border-white/[0.04]">{new Date(v.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="px-2.5 py-2 border-b border-white/[0.04] font-medium">{v.concepto}</td>
                          <td className="px-2.5 py-2 border-b border-white/[0.04] text-right">{qtyText(v.cantidad)}</td>
                          <td className="px-2.5 py-2 border-b border-white/[0.04] text-right">{money(v.precio)}</td>
                          <td className="px-2.5 py-2 border-b border-white/[0.04] text-right font-semibold">{money(v.total)}</td>
                          <td className="px-2.5 py-2 border-b border-white/[0.04] text-white/50">
                            {[v.medioPago, v.cliente, v.nota].filter(Boolean).join(' · ') || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <form onSubmit={handleCerrarCaja} className="mt-4 grid gap-2.5 sm:grid-cols-12 items-end">
                  <div className="sm:col-span-3">
                    <label className="mb-1.5 block text-[11px] font-medium text-white/50">Efectivo contado</label>
                    <input type="number" min="0" step="0.01" value={efectivoContado} onChange={(e) => setEfectivoContado(e.target.value)}
                      className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
                  </div>
                  <div className="sm:col-span-6">
                    <label className="mb-1.5 block text-[11px] font-medium text-white/50">Nota de cierre</label>
                    <input value={notaCierre} onChange={(e) => setNotaCierre(e.target.value)} placeholder="Diferencias, retiros, observaciones"
                      className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
                  </div>
                  <div className="sm:col-span-3">
                    <button type="submit" disabled={cerrando} className="w-full rounded-xl bg-amber-600 px-3 py-2.5 text-[12px] font-medium text-white btn-solid-text hover:bg-amber-700 disabled:opacity-50">
                      {cerrando ? 'Cerrando…' : 'Cerrar caja'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {caja && (
            <div className="fixed left-1/2 bottom-2.5 -translate-x-1/2 z-20 flex flex-wrap items-center justify-end gap-2.5 w-[min(1180px,calc(100%-32px))] rounded-xl border border-[#8880F5]/40 bg-[#0c0b1a]/95 backdrop-blur px-3 py-2.5 shadow-2xl">
              {[['Inicial', totales.opening], ['Ventas', totales.sales], ['Esperado', totales.expected], ['Diferencia', totales.diff ?? 0]].map(([label, value]) => (
                <div key={label as string} className="inline-flex items-baseline gap-1.5 rounded-xl border border-[#ffffff]/[0.12] bg-[#ffffff]/[0.055] px-2.5 py-1.5">
                  <span className="text-[10px] font-bold uppercase text-[#ffffff]/40">{label}</span>
                  <strong className="text-[14px] font-extrabold text-[#ffffff]">{money(value as number)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'stock' && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-[14px] font-semibold text-white">Stock</h2>
            <input value={stockSearch} onChange={(e) => setStockSearch(e.target.value)} placeholder="Buscar producto"
              className="max-w-[220px] w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
          </div>

          <form onSubmit={handleMovimiento} className="mb-4 grid gap-2.5 sm:grid-cols-12 items-end">
            <div className="sm:col-span-5">
              <label className="mb-1.5 block text-[11px] font-medium text-white/50">Producto</label>
              <div ref={movRef} className="relative">
                <input
                  value={movQuery}
                  onChange={(e) => { setMovQuery(e.target.value); setMovProductoId(''); setMovOpen(true) }}
                  onFocus={() => setMovOpen(true)}
                  placeholder="Escribir para buscar o crear…"
                  className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60"
                />
                {movOpen && (movFiltrados.length > 0 || movQuery.trim()) && (
                  <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-white/[0.10] light:border-black/[0.10] bg-[#17162f] light:bg-[#ffffff] shadow-xl">
                    {movFiltrados.map((p) => (
                      <button key={p.id} type="button"
                        onClick={() => { setMovProductoId(p.id); setMovQuery(p.nombre); setMovOpen(false) }}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] text-white hover:bg-white/[0.06] transition-colors">
                        <span className="truncate">{p.nombre}</span>
                        <span className="flex-shrink-0 text-white/40 text-[11px]">stock {p.stock}</span>
                      </button>
                    ))}
                    {movQuery.trim() && !movHayCoincidenciaExacta && (
                      <button type="button"
                        onClick={() => { setMovProductoId(''); setMovTipo('entrada'); setMovOpen(false) }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-[#8880F5] hover:bg-white/[0.06] transition-colors border-t border-white/[0.06]">
                        + Crear &quot;{movQuery.trim()}&quot; como producto nuevo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[11px] font-medium text-white/50">Cantidad</label>
              <input type="number" min="1" step="1" value={movCantidad} onChange={(e) => setMovCantidad(e.target.value)}
                className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1.5 block text-[11px] font-medium text-white/50">Movimiento</label>
              <select value={movTipo} disabled={!movProductoId} onChange={(e) => setMovTipo(e.target.value as 'entrada' | 'salida')}
                className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60 disabled:opacity-50">
                <option value="entrada">Cargar stock</option>
                <option value="salida">Descontar stock</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={movLoading || !movCantidad || (!movProductoId && !movQuery.trim())} className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-[12px] font-medium text-white hover:bg-white/[0.09] disabled:opacity-40">
                {movLoading ? 'Aplicando…' : movProductoId ? 'Aplicar' : 'Crear y cargar'}
              </button>
            </div>
          </form>

          <div className="rounded-xl border border-white/[0.09] overflow-x-auto">
            <table className="w-full min-w-[600px] text-[12px]">
              <thead>
                <tr className="text-white/35 text-[11px] uppercase">
                  <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Mercadería</th>
                  <th className="text-right px-2.5 py-2 border-b border-white/[0.06]">Precio</th>
                  <th className="text-right px-2.5 py-2 border-b border-white/[0.06]">Stock</th>
                  <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {stockFiltrado.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-5 text-white/30">Sin mercadería cargada</td></tr>
                ) : stockFiltrado.map((p) => {
                  const bajo = p.stock <= p.stockMinimo
                  return (
                    <tr key={p.id} className="text-white/80">
                      <td className="px-2.5 py-2 border-b border-white/[0.04] font-medium">{p.nombre}</td>
                      <td className="px-2.5 py-2 border-b border-white/[0.04] text-right">{money(p.precioVenta)}</td>
                      <td className="px-2.5 py-2 border-b border-white/[0.04] text-right">{qtyText(p.stock)}</td>
                      <td className="px-2.5 py-2 border-b border-white/[0.04]">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${bajo ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                          {bajo ? 'Bajo' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <ImportarProductosCard onImported={() => { startTrans(async () => { setStockList(await getProductos()) }) }} />
          </div>
        </div>
      )}

      {tab === 'historial' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-end gap-3 mb-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-white/50">Día</label>
                <input type="date" value={historyDate} onChange={(e) => { setHistoryDate(e.target.value); filtrarHistorial(e.target.value, historyMonth) }}
                  className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-white/50">Mes</label>
                <input type="month" value={historyMonth} onChange={(e) => cambiarMesReporte(e.target.value)}
                  className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.09] overflow-x-auto">
              <table className="w-full min-w-[640px] text-[12px]">
                <thead>
                  <tr className="text-white/35 text-[11px] uppercase">
                    <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Fecha</th>
                    <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Estado</th>
                    <th className="text-right px-2.5 py-2 border-b border-white/[0.06]">Tickets</th>
                    <th className="text-right px-2.5 py-2 border-b border-white/[0.06]">Ventas</th>
                    <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-5 text-white/30">Sin cajas para el filtro elegido</td></tr>
                  ) : historial.map((c) => (
                    <tr key={c.id} className="text-white/80">
                      <td className="px-2.5 py-2 border-b border-white/[0.04] font-medium">{c.fecha}</td>
                      <td className="px-2.5 py-2 border-b border-white/[0.04]">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.estado === 'abierta' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.08] text-white/50'}`}>
                          {c.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                        </span>
                      </td>
                      <td className="px-2.5 py-2 border-b border-white/[0.04] text-right">{c.tickets}</td>
                      <td className="px-2.5 py-2 border-b border-white/[0.04] text-right font-semibold">{money(c.totalVentas)}</td>
                      <td className="px-2.5 py-2 border-b border-white/[0.04] text-white/50">{[c.nota, c.notaCierre].filter(Boolean).join(' / ') || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <h3 className="text-[14px] font-semibold text-white mb-3">Reportes del mes</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {[['Total', money(reporte.total)], ['Tickets', String(reporte.tickets)], ['Promedio', money(reporte.tickets ? reporte.total / reporte.tickets : 0)], ['Stock bajo', String(reporte.stockBajo)]].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2">
                  <span className="text-[11px] font-semibold text-white/40 mr-2">{label}</span>
                  <strong className="text-[13px] text-white">{value}</strong>
                </div>
              ))}
            </div>

            <p className="text-[13px] font-semibold text-white/80 mb-2">Ventas por forma de cobro</p>
            <BarList data={reporte.porMedioPago} mode="money" />

            <p className="text-[13px] font-semibold text-white/80 mt-5 mb-2">Mercadería más vendida</p>
            <BarList data={reporte.topProductos} mode="qty" />
          </div>
        </div>
      )}

      {tab === 'config' && (
        <form onSubmit={handleGuardarConfig} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 text-[12px] font-semibold text-white/70">
              <input type="checkbox" checked={controlarStock} onChange={(e) => setControlarStock(e.target.checked)}
                className="w-[18px] h-[18px] accent-[#5448EE]" />
              Controlar stock
            </label>
            <button type="submit" disabled={guardandoConfig} className="rounded-xl bg-[#5448EE] px-4 py-2.5 text-[12px] font-medium text-white btn-solid-text hover:bg-[#4438DE] disabled:opacity-50">
              {guardandoConfig ? 'Guardando…' : 'Guardar configuración'}
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.09] overflow-x-auto">
            <table className="w-full min-w-[560px] text-[12px]">
              <thead>
                <tr className="text-white/35 text-[11px] uppercase">
                  <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Nombre del campo</th>
                  <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Visible</th>
                  <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Obligatorio</th>
                  <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Tipo de dato</th>
                </tr>
              </thead>
              <tbody>
                {CAMPO_LABELS.map(({ key, tipos }) => {
                  const c = campos[key]
                  return (
                    <tr key={key} className="text-white/80">
                      <td className="px-2.5 py-2 border-b border-white/[0.04]">
                        <input value={c.label} onChange={(e) => setCampo(key, { label: e.target.value })}
                          className="w-full rounded-lg border border-white/[0.09] bg-white/[0.05] px-2 py-1.5 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
                      </td>
                      <td className="px-2.5 py-2 border-b border-white/[0.04]">
                        <input type="checkbox" checked={c.visible} disabled={c.locked} onChange={(e) => setCampo(key, { visible: e.target.checked })}
                          className="w-[18px] h-[18px] accent-[#5448EE] disabled:opacity-40" />
                      </td>
                      <td className="px-2.5 py-2 border-b border-white/[0.04]">
                        <input type="checkbox" checked={c.required} onChange={(e) => setCampo(key, { required: e.target.checked })}
                          className="w-[18px] h-[18px] accent-[#5448EE]" />
                      </td>
                      <td className="px-2.5 py-2 border-b border-white/[0.04]">
                        <select value={c.type} disabled={c.lockedType} onChange={(e) => setCampo(key, { type: e.target.value as any })}
                          className="rounded-lg border border-white/[0.09] bg-white/[0.05] px-2 py-1.5 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60 disabled:opacity-40">
                          {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">Tipos de pago</label>
            <div className="flex gap-2 mb-2.5">
              <input value={nuevoMedio} onChange={(e) => setNuevoMedio(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarMedio() } }}
                placeholder="Agregar nuevo tipo de pago"
                className="flex-1 rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
              <button type="button" onClick={agregarMedio} className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[12px] font-medium text-white hover:bg-white/[0.09]">
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mediosPago.map((m) => (
                <span key={m} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.05] px-2.5 py-1 text-[12px] font-medium text-white/80">
                  {m}
                  <button type="button" onClick={() => quitarMedio(m)} aria-label={`Quitar ${m}`}
                    className="w-[18px] h-[18px] inline-grid place-items-center rounded-full bg-white/[0.08] text-white/60 hover:text-white">×</button>
                </span>
              ))}
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

function BarList({ data, mode }: { data: Record<string, number>; mode: 'money' | 'qty' }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const max = entries.length ? entries[0][1] : 0
  if (!entries.length) return <p className="text-[12px] text-white/30">Sin datos todavía</p>
  return (
    <div className="space-y-2.5">
      {entries.map(([label, value]) => (
        <div key={label}>
          <div className="flex justify-between text-[12px] font-semibold text-white/75 mb-1">
            <span>{label}</span>
            <span>{mode === 'money' ? money(value) : qtyText(value)}</span>
          </div>
          <div className="h-[9px] rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full rounded-full bg-[#326fee]" style={{ width: `${max ? Math.round((value / max) * 100) : 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
