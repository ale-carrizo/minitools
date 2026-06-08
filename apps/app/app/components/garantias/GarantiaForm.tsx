'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearGarantia, editarGarantia } from '@/lib/actions/garantia'
import {
  calcularFechaVencimiento,
  CATEGORIAS_GARANTIA,
  formatFecha,
  type GarantiaProducto,
} from '@/types/garantia'

export default function GarantiaForm({ garantia }: { garantia?: GarantiaProducto }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [nombre, setNombre] = useState(garantia?.nombre ?? '')
  const [categoria, setCategoria] = useState(garantia?.categoria ?? '')
  const [marca, setMarca] = useState(garantia?.marca ?? '')
  const [modelo, setModelo] = useState(garantia?.modelo ?? '')
  const [nroSerie, setNroSerie] = useState(garantia?.nroSerie ?? '')
  const [precioCompra, setPrecioCompra] = useState(garantia?.precioCompra?.toString() ?? '')
  const [proveedor, setProveedor] = useState(garantia?.proveedor ?? '')
  const [nroFactura, setNroFactura] = useState(garantia?.nroFactura ?? '')
  const [fechaCompra, setFechaCompra] = useState(garantia?.fechaCompra ?? '')
  const [duracionValor, setDuracionValor] = useState(garantia?.mesesGarantia?.toString() ?? '')
  const [duracionUnidad, setDuracionUnidad] = useState<'meses' | 'anios'>('meses')
  const [fechaVencimiento, setFechaVencimiento] = useState(garantia?.fechaVencimiento ?? '')
  const [notas, setNotas] = useState(garantia?.notas ?? '')
  const [previewFechaVence, setPreviewFechaVence] = useState<string | null>(null)

  const mesesGarantia = useMemo(() => {
    const parsed = Number(duracionValor)
    if (!Number.isFinite(parsed) || parsed <= 0) return null
    return duracionUnidad === 'anios' ? parsed * 12 : parsed
  }, [duracionUnidad, duracionValor])

  useEffect(() => {
    if (fechaCompra && mesesGarantia) {
      setPreviewFechaVence(calcularFechaVencimiento(fechaCompra, mesesGarantia))
      return
    }
    setPreviewFechaVence(null)
  }, [fechaCompra, mesesGarantia])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!nombre.trim()) {
      setError('Completá el nombre del producto')
      return
    }

    startTransition(async () => {
      try {
        const payload = {
          nombre,
          categoria,
          marca,
          modelo,
          nroSerie,
          proveedor,
          nroFactura,
          fechaCompra,
          fechaVencimiento,
          mesesGarantia: mesesGarantia ?? undefined,
          precioCompra: precioCompra ? Number(precioCompra) : undefined,
          notas,
        }

        if (garantia) {
          await editarGarantia(garantia.id, payload)
        } else {
          await crearGarantia(payload)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar la garantía')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-white font-semibold text-[15px]">Producto</h2>
            <p className="text-white/35 text-[12px] mt-1">Datos principales para identificar el producto cubierto.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Nombre *</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Heladera Samsung 400L" className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Categoría</label>
            <input list="categorias-garantia" value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
            <datalist id="categorias-garantia">
              {CATEGORIAS_GARANTIA.map((item) => <option key={item} value={item} />)}
            </datalist>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[12px] text-white/50">Marca</label>
              <input value={marca} onChange={(e) => setMarca(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] text-white/50">Modelo</label>
              <input value={modelo} onChange={(e) => setModelo(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[12px] text-white/50">Nro de serie</label>
              <input value={nroSerie} onChange={(e) => setNroSerie(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] text-white/50">Precio de compra</label>
              <input type="number" min="0" step="0.01" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
            </div>
          </div>
        </section>

        <section className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-white font-semibold text-[15px]">Compra y garantía</h2>
            <p className="text-white/35 text-[12px] mt-1">Definí cómo se calcula o guarda el vencimiento.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[12px] text-white/50">Proveedor / Tienda</label>
              <input value={proveedor} onChange={(e) => setProveedor(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] text-white/50">Nro de factura / ticket</label>
              <input value={nroFactura} onChange={(e) => setNroFactura(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Fecha de compra</label>
            <input type="date" value={fechaCompra} onChange={(e) => setFechaCompra(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Duración de garantía</label>
            <div className="grid grid-cols-[1fr,120px] gap-3">
              <input type="number" min="0" value={duracionValor} onChange={(e) => setDuracionValor(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
              <select value={duracionUnidad} onChange={(e) => setDuracionUnidad(e.target.value as 'meses' | 'anios')} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60">
                <option value="meses">Meses</option>
                <option value="anios">Años</option>
              </select>
            </div>
            <p className="text-[11px] text-white/30">Completá este campo o la fecha exacta de vencimiento.</p>
            {previewFechaVence ? <p className="text-[12px] text-[#8880F5]">→ Vence el {formatFecha(previewFechaVence)}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Fecha de vencimiento</label>
            <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#5448EE]/60" />
            <p className="text-[11px] text-white/30">Si la completás, tiene prioridad sobre la duración.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] text-white/50">Notas</label>
            <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={5} className="w-full resize-none bg-white/[0.05] border border-white/[0.09] rounded-xl text-white px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
          </div>
        </section>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isPending} className="bg-[#5448EE] hover:bg-[#4438DE] disabled:opacity-70 text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors">
          {isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
