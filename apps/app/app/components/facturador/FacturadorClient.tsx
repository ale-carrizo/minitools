'use client'

import { useMemo, useState } from 'react'
import {
  conectarCertificado, crearFacturaC, crearNotaCreditoC, guardarDatosFiscales,
} from '@/lib/actions/facturador'
import ClienteCombobox from '@/app/components/shared/ClienteCombobox'
import type { ClienteSugerido } from '@/lib/actions/clientes-sugeridos'
import type { Producto } from '@/types/stock'
import {
  CONDICION_IVA_LABELS, CONDICION_VENTA, DOC_TIPO_LABELS, fmtNumeroComprobante,
  type CondicionIvaEmisor, type DocTipoCliente, type Factura, type FacturadorConfig,
} from '@/types/facturador'

const money = (v: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v || 0)

type Tab = 'emitir' | 'comprobantes' | 'clientes' | 'config'

interface ItemForm { concepto: string; cantidad: string; precio: string; productoId: string | null }

function nuevoItem(): ItemForm {
  return { concepto: '', cantidad: '1', precio: '', productoId: null }
}

interface Props {
  configInicial:      FacturadorConfig
  facturasIniciales:  Factura[]
  clientesSugeridos:  ClienteSugerido[]
  productos:          Producto[]
}

export default function FacturadorClient({ configInicial, facturasIniciales, clientesSugeridos, productos }: Props) {
  const [tab, setTab] = useState<Tab>(configInicial.conectado ? 'emitir' : 'config')
  const [config, setConfig] = useState(configInicial)
  const [facturas, setFacturas] = useState(facturasIniciales)
  const [error, setError] = useState('')

  return (
    <div className="max-w-4xl">
      {!config.conectado && (
        <div className="mb-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[13px] text-amber-300">
            <strong>Primer uso:</strong> conectá tu CUIT con ARCA para poder emitir. Zimple no guarda tu clave fiscal, solo el certificado de facturación.
          </p>
          <button onClick={() => setTab('config')} className="rounded-xl bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-[12px] font-semibold text-amber-200 hover:bg-amber-500/30 transition-colors">
            Configurar ARCA
          </button>
        </div>
      )}

      <nav className="flex gap-4 border-b border-white/[0.06] mb-4 overflow-x-auto">
        {([['emitir', 'Emitir'], ['comprobantes', 'Comprobantes'], ['clientes', 'Clientes y productos'], ['config', 'Configuración']] as [Tab, string][]).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className={`whitespace-nowrap px-1 pb-2.5 text-[12px] font-semibold border-b-2 transition-colors ${tab === id ? 'text-[#8880F5] border-[#8880F5]' : 'text-white/35 border-transparent hover:text-white/70'}`}>
            {label}
          </button>
        ))}
      </nav>

      {error && (
        <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-400">{error}</div>
      )}

      {tab === 'emitir' && (
        <EmitirTab
          config={config}
          clientesSugeridos={clientesSugeridos}
          productos={productos}
          onError={setError}
          onEmitida={(f) => { setFacturas((prev) => [f, ...prev]); setError('') }}
        />
      )}

      {tab === 'comprobantes' && (
        <ComprobantesTab facturas={facturas} onError={setError}
          onNotaCredito={(nc) => setFacturas((prev) => [nc, ...prev])} />
      )}

      {tab === 'clientes' && (
        <ClientesProductosTab clientesSugeridos={clientesSugeridos} productos={productos} facturas={facturas} />
      )}

      {tab === 'config' && (
        <ConfigTab config={config} onConfigChange={setConfig} onError={setError} />
      )}
    </div>
  )
}

// ── Emitir ───────────────────────────────────────────────────────────────────
function EmitirTab({ config, clientesSugeridos, productos, onError, onEmitida }: {
  config: FacturadorConfig
  clientesSugeridos: ClienteSugerido[]
  productos: Producto[]
  onError: (msg: string) => void
  onEmitida: (f: Factura) => void
}) {
  const [clienteNombre, setClienteNombre] = useState('')
  const [docTipo, setDocTipo] = useState<DocTipoCliente>('consumidor_final')
  const [docNro, setDocNro] = useState('')
  const [condicionIvaCliente, setCondicionIvaCliente] = useState<'consumidor_final' | 'monotributista' | 'responsable_inscripto' | 'exento'>('consumidor_final')
  const [condicionVenta, setCondicionVenta] = useState<string>(CONDICION_VENTA[0])
  const [items, setItems] = useState<ItemForm[]>([nuevoItem()])
  const [emitiendo, setEmitiendo] = useState(false)
  const [ultimaEmitida, setUltimaEmitida] = useState<Factura | null>(null)

  const totales = useMemo(() => {
    const total = items.reduce((sum, i) => sum + (Number(i.cantidad) || 0) * (Number(i.precio) || 0), 0)
    return { total }
  }, [items])

  function setItem(index: number, patch: Partial<ItemForm>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }
  function addItem() { setItems((prev) => [...prev, nuevoItem()]) }
  function removeItem(index: number) { setItems((prev) => (prev.length === 1 ? [nuevoItem()] : prev.filter((_, i) => i !== index))) }

  async function handleEmitir() {
    onError('')
    if (!config.conectado) { onError('Conectá ARCA primero desde Configuración'); return }
    if (!clienteNombre.trim()) { onError('Ingresá el nombre del cliente'); return }
    if (docTipo !== 'consumidor_final' && !docNro.trim()) { onError('Ingresá el documento del cliente'); return }
    const itemsValidos = items.filter((i) => i.concepto.trim() && Number(i.cantidad) > 0)
    if (itemsValidos.length === 0) { onError('Agregá al menos un ítem'); return }

    setEmitiendo(true)
    try {
      const factura = await crearFacturaC({
        clienteNombre: clienteNombre.trim(),
        clienteDocTipo: docTipo,
        clienteDocNro: docNro.trim() || undefined,
        clienteCondicionIva: docTipo === 'consumidor_final' ? 'consumidor_final' : condicionIvaCliente,
        condicionVenta,
        items: itemsValidos.map((i) => ({ concepto: i.concepto.trim(), cantidad: Number(i.cantidad), precio: Number(i.precio) || 0 })),
      })
      onEmitida(factura)
      setUltimaEmitida(factura)
      setClienteNombre(''); setDocNro(''); setDocTipo('consumidor_final'); setItems([nuevoItem()])
    } catch (err: any) {
      onError(err.message ?? 'No se pudo emitir la factura')
    } finally {
      setEmitiendo(false)
    }
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-white">Datos de la factura</h2>
          <span className="rounded-full bg-[#5448EE]/18 text-[#8880F5] text-[11px] font-bold px-2.5 py-1">PV {String(config.puntoVenta).padStart(4, '0')} · Factura C</span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">Cliente</label>
            <ClienteCombobox sugerencias={clientesSugeridos} value={clienteNombre} onChange={setClienteNombre}
              placeholder="Consumidor final o buscar cliente" />
          </div>
          <div className="sm:col-span-3">
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">Documento</label>
            <select value={docTipo} onChange={(e) => setDocTipo(e.target.value as DocTipoCliente)}
              className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60">
              {(Object.keys(DOC_TIPO_LABELS) as DocTipoCliente[]).map((k) => <option key={k} value={k}>{DOC_TIPO_LABELS[k]}</option>)}
            </select>
          </div>
          {docTipo !== 'consumidor_final' && (
            <>
              <div className="sm:col-span-4">
                <label className="mb-1.5 block text-[11px] font-medium text-white/50">Número</label>
                <input value={docNro} onChange={(e) => setDocNro(e.target.value)} placeholder="CUIT/DNI"
                  className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1.5 block text-[11px] font-medium text-white/50">Condición IVA del cliente</label>
                <select value={condicionIvaCliente} onChange={(e) => setCondicionIvaCliente(e.target.value as any)}
                  className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60">
                  <option value="consumidor_final">Consumidor final</option>
                  <option value="monotributista">Monotributista</option>
                  <option value="responsable_inscripto">Responsable Inscripto</option>
                  <option value="exento">Exento</option>
                </select>
              </div>
            </>
          )}
          <div className="sm:col-span-4">
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">Condición de venta</label>
            <select value={condicionVenta} onChange={(e) => setCondicionVenta(e.target.value)}
              className="w-full min-h-[34px] rounded-[10px] border border-white/[0.09] bg-white/[0.05] px-[9px] py-[7px] text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60">
              {CONDICION_VENTA.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <h2 className="text-[14px] font-semibold text-white mb-3">Ítems</h2>
        <div className="space-y-2.5">
          {items.map((item, index) => {
            const q = item.concepto.trim().toLowerCase()
            const sugeridos = q ? productos.filter((p) => p.nombre.toLowerCase().includes(q)).slice(0, 6) : []
            return (
              <div key={index} className="grid gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 md:grid-cols-[1.6fr_0.7fr_0.9fr_auto]">
                <div className="relative">
                  <label className="mb-1 block text-[10px] text-white/35">Concepto</label>
                  <input value={item.concepto} onChange={(e) => setItem(index, { concepto: e.target.value, productoId: null })}
                    placeholder="Ej. Servicio mensual"
                    className="w-full rounded-lg border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
                  {sugeridos.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full max-h-40 overflow-y-auto rounded-xl border border-white/[0.10] bg-[#17162f] shadow-xl">
                      {sugeridos.map((p) => (
                        <button key={p.id} type="button"
                          onClick={() => setItem(index, { concepto: p.nombre, precio: String(p.precioVenta), productoId: p.id })}
                          className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[12px] text-white hover:bg-white/[0.06]">
                          <span className="truncate">{p.nombre}</span>
                          <span className="text-white/40 text-[11px]">{money(p.precioVenta)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-white/35">Cantidad</label>
                  <input type="number" min="0.01" step="0.01" value={item.cantidad} onChange={(e) => setItem(index, { cantidad: e.target.value })}
                    className="w-full rounded-lg border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-white/35">Precio</label>
                  <input type="number" min="0" step="0.01" value={item.precio} onChange={(e) => setItem(index, { precio: e.target.value })}
                    className="w-full rounded-lg border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
                </div>
                <div className="flex items-end">
                  <button type="button" onClick={() => removeItem(index)} className="rounded-lg border border-red-500/20 px-3 py-2 text-[11px] font-medium text-red-400 hover:bg-red-500/10">
                    Quitar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <button type="button" onClick={addItem} className="mt-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[12px] font-medium text-white hover:bg-white/[0.09]">
          + Agregar ítem
        </button>
      </div>

      {ultimaEmitida && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[13px] text-emerald-300">
            Factura {fmtNumeroComprobante(ultimaEmitida.puntoVenta, ultimaEmitida.numero)} emitida · CAE {ultimaEmitida.cae}
          </p>
          <a href={`/api/facturas/${ultimaEmitida.id}/pdf`} target="_blank" rel="noreferrer"
            className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-[12px] font-semibold text-emerald-200 hover:bg-emerald-500/30">
            Ver PDF
          </a>
        </div>
      )}

      <div className="fixed left-1/2 bottom-2.5 -translate-x-1/2 z-20 flex flex-wrap items-center justify-end gap-2.5 w-[min(1180px,calc(100%-32px))] rounded-xl border border-[#8880F5]/40 bg-[#0c0b1a]/95 backdrop-blur px-3 py-2.5 shadow-2xl">
        <div className="inline-flex items-baseline gap-1.5 rounded-xl border border-[#ffffff]/[0.12] bg-[#5448EE]/20 px-3 py-1.5">
          <span className="text-[10px] font-bold uppercase text-[#ffffff]/50">Total</span>
          <strong className="text-[16px] font-extrabold text-[#ffffff]">{money(totales.total)}</strong>
        </div>
        <button type="button" onClick={handleEmitir} disabled={emitiendo || !config.conectado}
          className="rounded-xl bg-[#5448EE] px-5 py-2.5 text-[13px] font-medium text-white btn-solid-text hover:bg-[#4438DE] disabled:opacity-50">
          {emitiendo ? 'Pidiendo CAE a ARCA…' : 'Emitir factura'}
        </button>
      </div>
    </div>
  )
}

// ── Comprobantes ─────────────────────────────────────────────────────────────
function ComprobantesTab({ facturas, onError, onNotaCredito }: {
  facturas: Factura[]
  onError: (msg: string) => void
  onNotaCredito: (nc: Factura) => void
}) {
  const [query, setQuery] = useState('')
  const [ncLoadingId, setNcLoadingId] = useState<string | null>(null)

  const filtradas = facturas.filter((f) =>
    !query.trim() || `${f.clienteNombre} ${f.cae ?? ''} ${fmtNumeroComprobante(f.puntoVenta, f.numero)}`.toLowerCase().includes(query.toLowerCase()))

  async function handleNC(f: Factura) {
    setNcLoadingId(f.id)
    onError('')
    try {
      const nc = await crearNotaCreditoC(f.id)
      onNotaCredito(nc)
    } catch (err: any) {
      onError(err.message ?? 'No se pudo generar la nota de crédito')
    } finally {
      setNcLoadingId(null)
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-center justify-between mb-3 gap-3">
        <h2 className="text-[14px] font-semibold text-white">Comprobantes emitidos</h2>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar"
          className="max-w-[220px] w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
      </div>
      <div className="rounded-xl border border-white/[0.09] overflow-x-auto">
        <table className="w-full min-w-[720px] text-[12px]">
          <thead>
            <tr className="text-white/35 text-[11px] uppercase">
              <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Fecha</th>
              <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Comprobante</th>
              <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Cliente</th>
              <th className="text-right px-2.5 py-2 border-b border-white/[0.06]">Total</th>
              <th className="text-left px-2.5 py-2 border-b border-white/[0.06]">Estado</th>
              <th className="text-right px-2.5 py-2 border-b border-white/[0.06]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6 text-white/30">Sin comprobantes todavía</td></tr>
            ) : filtradas.map((f) => (
              <tr key={f.id} className="text-white/80">
                <td className="px-2.5 py-2 border-b border-white/[0.04]">{f.fecha}</td>
                <td className="px-2.5 py-2 border-b border-white/[0.04]">
                  <p className="font-medium text-white">{f.tipo === 'nc_c' ? 'Nota de Crédito C' : 'Factura C'}</p>
                  <p className="text-white/35 text-[11px]">{fmtNumeroComprobante(f.puntoVenta, f.numero)}</p>
                </td>
                <td className="px-2.5 py-2 border-b border-white/[0.04]">{f.clienteNombre}</td>
                <td className="px-2.5 py-2 border-b border-white/[0.04] text-right font-semibold">{money(f.total)}</td>
                <td className="px-2.5 py-2 border-b border-white/[0.04]">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${f.estado === 'emitida' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {f.estado === 'emitida' ? 'Emitida' : f.estado === 'anulada' ? 'Anulada' : 'Error'}
                  </span>
                </td>
                <td className="px-2.5 py-2 border-b border-white/[0.04]">
                  <div className="flex justify-end gap-1.5">
                    <a href={`/api/facturas/${f.id}/pdf`} target="_blank" rel="noreferrer"
                      className="rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-white/[0.09]">
                      PDF
                    </a>
                    {f.tipo === 'factura_c' && f.estado === 'emitida' && (
                      <button type="button" onClick={() => handleNC(f)} disabled={ncLoadingId === f.id}
                        className="rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-white/[0.09] disabled:opacity-50">
                        {ncLoadingId === f.id ? '…' : 'NC'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Clientes y productos ─────────────────────────────────────────────────────
function ClientesProductosTab({ clientesSugeridos, productos, facturas }: {
  clientesSugeridos: ClienteSugerido[]
  productos: Producto[]
  facturas: Factura[]
}) {
  const clientesFrecuentes = useMemo(() => {
    const porNombre = new Map<string, { nombre: string; ultimoTotal: number }>()
    for (const f of facturas) {
      if (!porNombre.has(f.clienteNombre)) porNombre.set(f.clienteNombre, { nombre: f.clienteNombre, ultimoTotal: f.total })
    }
    return Array.from(porNombre.values()).slice(0, 10)
  }, [facturas])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <h2 className="text-[14px] font-semibold text-white mb-3">Clientes frecuentes</h2>
        {clientesFrecuentes.length === 0 ? (
          <p className="text-[12px] text-white/30 py-4 text-center">Todavía no facturaste a nadie</p>
        ) : (
          <div className="space-y-2">
            {clientesFrecuentes.map((c) => (
              <div key={c.nombre} className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                <span className="text-[13px] font-medium text-white truncate">{c.nombre}</span>
                <span className="rounded-full bg-white/[0.06] text-white/60 text-[11px] font-semibold px-2 py-0.5">{money(c.ultimoTotal)}</span>
              </div>
            ))}
          </div>
        )}
        {clientesSugeridos.length > 0 && (
          <p className="text-[11px] text-white/25 mt-3">También podés elegir clientes ya cargados en Turnos, Recibos o Presupuestos al escribir en el campo Cliente.</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <h2 className="text-[14px] font-semibold text-white mb-3">Productos y conceptos</h2>
        {productos.length === 0 ? (
          <p className="text-[12px] text-white/30 py-4 text-center">Sin productos cargados en Stock todavía</p>
        ) : (
          <div className="space-y-2">
            {productos.slice(0, 10).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                <span className="text-[13px] font-medium text-white truncate">{p.nombre}</span>
                <span className="rounded-full bg-white/[0.06] text-white/60 text-[11px] font-semibold px-2 py-0.5">{money(p.precioVenta)}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-white/25 mt-3">Se sugieren automáticamente al escribir un concepto en Emitir. Se gestionan desde Registro de Ventas y Stock.</p>
      </div>
    </div>
  )
}

// ── Configuración ────────────────────────────────────────────────────────────
function ConfigTab({ config, onConfigChange, onError }: {
  config: FacturadorConfig
  onConfigChange: (c: FacturadorConfig) => void
  onError: (msg: string) => void
}) {
  const [cuit, setCuit] = useState(config.cuit)
  const [razonSocial, setRazonSocial] = useState(config.razonSocial)
  const [condicionIva, setCondicionIva] = useState<CondicionIvaEmisor>(config.condicionIva)
  const [puntoVenta, setPuntoVenta] = useState(String(config.puntoVenta))
  const [produccion, setProduccion] = useState(config.produccion)
  const [guardandoFiscal, setGuardandoFiscal] = useState(false)
  const [guardadoFiscal, setGuardadoFiscal] = useState(false)

  const [certFile, setCertFile] = useState<File | null>(null)
  const [keyFile, setKeyFile] = useState<File | null>(null)
  const [conectando, setConectando] = useState(false)

  async function handleGuardarFiscal(e: React.FormEvent) {
    e.preventDefault()
    onError('')
    setGuardandoFiscal(true)
    setGuardadoFiscal(false)
    try {
      await guardarDatosFiscales({ cuit, razonSocial, condicionIva, puntoVenta: Number(puntoVenta), produccion })
      onConfigChange({ ...config, cuit: cuit.replace(/\D/g, ''), razonSocial, condicionIva, puntoVenta: Number(puntoVenta), produccion, conectado: false })
      setGuardadoFiscal(true)
    } catch (err: any) {
      onError(err.message ?? 'No se pudieron guardar los datos fiscales')
    } finally {
      setGuardandoFiscal(false)
    }
  }

  async function handleConectar(e: React.FormEvent) {
    e.preventDefault()
    onError('')
    if (!certFile || !keyFile) { onError('Subí el certificado (.crt) y la clave privada (.key)'); return }
    setConectando(true)
    try {
      const [certificado, clavePrivada] = await Promise.all([certFile.text(), keyFile.text()])
      await conectarCertificado({ certificado, clavePrivada })
      onConfigChange({ ...config, conectado: true, tieneCertificado: true, ultimaVerificacion: new Date().toISOString() })
      setCertFile(null); setKeyFile(null)
    } catch (err: any) {
      onError(err.message ?? 'No se pudo conectar con ARCA. Revisá el certificado y la clave.')
    } finally {
      setConectando(false)
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <h3 className="text-[14px] font-semibold text-white mb-1">Conectar ARCA sin ayuda técnica</h3>
        <p className="text-[12px] text-white/40 mb-4">Conectá tu CUIT una sola vez. Zimple no guarda tu clave fiscal; emite usando autorización oficial y te devuelve CAE/PDF.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            ['1', 'Datos fiscales', 'CUIT, condición IVA y punto de venta.'],
            ['2', 'Certificado', 'Subís el .crt y .key generados en ARCA.'],
            ['3', 'Prueba', 'Zimple valida la conexión al guardar.'],
            ['4', 'Emitir', 'Ya podés facturar desde la pestaña Emitir.'],
          ].map(([n, title, desc]) => (
            <div key={n} className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-2.5">
              <span className="inline-grid place-items-center w-5 h-5 rounded-md bg-white/[0.08] text-white/70 text-[10px] font-bold mb-1.5">{n}</span>
              <p className="text-[11px] font-semibold text-white">{title}</p>
              <p className="text-[10px] text-white/35 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleGuardarFiscal} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold text-white">Datos fiscales</h3>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.conectado ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
            {config.conectado ? 'Conectado' : 'No conectado'}
          </span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">CUIT</label>
            <input value={cuit} onChange={(e) => setCuit(e.target.value)} placeholder="20000000000"
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">Razón social</label>
            <input value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} placeholder="Nombre o razón social"
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">Condición IVA</label>
            <select value={condicionIva} onChange={(e) => setCondicionIva(e.target.value as CondicionIvaEmisor)}
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60">
              {(Object.keys(CONDICION_IVA_LABELS) as CondicionIvaEmisor[]).map((k) => <option key={k} value={k}>{CONDICION_IVA_LABELS[k]}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">Punto de venta</label>
            <input type="number" min="1" value={puntoVenta} onChange={(e) => setPuntoVenta(e.target.value)}
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white focus:outline-none focus:border-[#5448EE]/60" />
          </div>
          <div className="sm:col-span-2">
            <label className="inline-flex items-center gap-2 text-[12px] font-semibold text-white/70">
              <input type="checkbox" checked={produccion} onChange={(e) => setProduccion(e.target.checked)} className="w-[18px] h-[18px] accent-[#5448EE]" />
              Ambiente de producción (facturas reales) — desmarcado usa homologación (pruebas)
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button type="submit" disabled={guardandoFiscal} className="rounded-xl bg-[#5448EE] px-4 py-2.5 text-[12px] font-medium text-white btn-solid-text hover:bg-[#4438DE] disabled:opacity-50">
            {guardandoFiscal ? 'Guardando…' : 'Guardar datos fiscales'}
          </button>
          {guardadoFiscal && <span className="text-[12px] text-emerald-400">Guardado ✓</span>}
        </div>
      </form>

      <form onSubmit={handleConectar} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <h3 className="text-[14px] font-semibold text-white mb-1">Autorización ARCA</h3>
        <p className="text-[12px] text-white/40 mb-3">Subí el certificado y la clave privada que generaste en el sitio de ARCA para el servicio de facturación electrónica.</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">Certificado (.crt)</label>
            <input type="file" accept=".crt,.pem" onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white file:text-[11px]" />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">Clave privada (.key)</label>
            <input type="file" accept=".key,.pem" onChange={(e) => setKeyFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[12px] text-white file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white file:text-[11px]" />
          </div>
        </div>
        <button type="submit" disabled={conectando} className="mt-4 rounded-xl bg-[#5448EE] px-4 py-2.5 text-[12px] font-medium text-white btn-solid-text hover:bg-[#4438DE] disabled:opacity-50">
          {conectando ? 'Probando conexión con ARCA…' : 'Guardar y probar conexión'}
        </button>
      </form>
    </div>
  )
}
