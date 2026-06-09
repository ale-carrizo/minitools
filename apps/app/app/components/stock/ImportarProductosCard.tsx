'use client'

import { useState, useTransition } from 'react'
import * as XLSX from 'xlsx'
import { importarProductos } from '@/lib/actions/stock'

type ImportRow = {
  nombre?: string
  sku?: string
  categoria?: string
  descripcion?: string
  precioCosto?: number
  precioVenta?: number
  stock?: number
  stockMinimo?: number
  unidad?: string
}

const HEADER_ALIASES: Record<string, keyof ImportRow> = {
  nombre: 'nombre',
  producto: 'nombre',
  sku: 'sku',
  categoria: 'categoria',
  categoría: 'categoria',
  descripcion: 'descripcion',
  descripción: 'descripcion',
  preciocosto: 'precioCosto',
  precio_costo: 'precioCosto',
  costo: 'precioCosto',
  precioventa: 'precioVenta',
  precio_venta: 'precioVenta',
  venta: 'precioVenta',
  stock: 'stock',
  stockminimo: 'stockMinimo',
  stock_mínimo: 'stockMinimo',
  stock_minimo: 'stockMinimo',
  minimo: 'stockMinimo',
  unidad: 'unidad',
}

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/\s+/g, '').replace(/[.-]/g, '')
}

export default function ImportarProductosCard() {
  const [rows, setRows] = useState<ImportRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleFile(file: File) {
    setError(null)
    setSuccess(null)

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' })

    const mapped = data.map((row) => {
      const next: ImportRow = {}
      for (const [rawKey, rawValue] of Object.entries(row)) {
        const key = HEADER_ALIASES[normalizeKey(rawKey)]
        if (!key) continue
        ;(next as Record<string, string | number | undefined>)[key] =
          typeof rawValue === 'string' ? rawValue : Number(rawValue)
      }
      return next
    }).filter((row) => row.nombre)

    if (mapped.length === 0) {
      setError('No se encontraron filas válidas. Usá al menos una columna "nombre" o "producto".')
      return
    }

    setRows(mapped)
  }

  function handleImport() {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      try {
        const result = await importarProductos(rows)
        setSuccess(`Se importaron ${result.creados} producto(s) correctamente.`)
        setRows([])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo importar el archivo')
      }
    })
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 space-y-4">
      <div>
        <h3 className="text-white font-semibold text-[15px]">Importar desde Excel</h3>
        <p className="text-white/35 text-[12px] mt-1">
          Cargá un `.xlsx` o `.csv` con columnas como `nombre`, `sku`, `categoria`, `precioCosto`, `precioVenta`, `stock` y `stockMinimo`.
        </p>
      </div>

      <label className="block">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
          }}
        />
        <span className="inline-flex cursor-pointer rounded-xl border border-white/10 px-4 py-2.5 text-[13px] font-medium text-white/70 hover:border-white/20 hover:text-white transition-colors">
          Seleccionar archivo
        </span>
      </label>

      {rows.length > 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <p className="text-[13px] text-white/70">{rows.length} fila(s) listas para importar.</p>
          <div className="mt-3 max-h-40 overflow-auto space-y-2">
            {rows.slice(0, 5).map((row, index) => (
              <div key={`${row.nombre}-${index}`} className="text-[12px] text-white/45">
                {row.nombre} · Stock {row.stock ?? 0} · Costo {row.precioCosto ?? 0}
              </div>
            ))}
            {rows.length > 5 ? <p className="text-[11px] text-white/25">y {rows.length - 5} más...</p> : null}
          </div>
          <button
            type="button"
            onClick={handleImport}
            disabled={isPending}
            className="mt-4 bg-[#5448EE] hover:bg-[#4438DE] disabled:opacity-70 text-white rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors"
          >
            {isPending ? 'Importando...' : 'Importar productos'}
          </button>
        </div>
      ) : null}

      {error ? <p className="text-[12px] text-red-300">{error}</p> : null}
      {success ? <p className="text-[12px] text-emerald-300">{success}</p> : null}
    </div>
  )
}
