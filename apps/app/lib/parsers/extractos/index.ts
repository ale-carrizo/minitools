/**
 * lib/parsers/extractos/index.ts
 * Parsers de extractos bancarios XLS/CSV — normaliza cada banco a ExtractoRow
 */

import type { ExtractoRow, BancoExtracto } from '@/types/caja'
import { todayAR } from '@/lib/date'

type Parser = (rows: any[][]) => ExtractoRow[]

function parseMonto(val: any): number {
  if (typeof val === 'number') return Math.abs(val)
  const s = String(val).replace(/[^\d.,-]/g, '').replace(',', '.')
  return Math.abs(parseFloat(s) || 0)
}

function parseFecha(val: any): string {
  if (!val) return todayAR()
  if (typeof val === 'number') {
    const d = new Date((val - 25569) * 86400 * 1000)
    return d.toISOString().split('T')[0]
  }
  const s = String(val).trim()
  const m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3]
    return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`
  }
  return s
}

function parseHora(val: any): string | null {
  if (!val) return null
  const s = String(val).trim()
  const m = s.match(/(\d{1,2}):(\d{2})/)
  return m ? `${m[1].padStart(2,'0')}:${m[2]}` : null
}

/**
 * Mitigación contra CSV/formula injection: si un valor empieza con caracteres
 * que Excel/Sheets interpretan como fórmula (=, +, -, @) o con whitespace
 * de control (tab, CR), le antepone un apóstrofe para forzar texto plano.
 */
function sanitizeCsvCell(value: string): string {
  if (!value) return value
  const first = value.charAt(0)
  if (['=', '+', '-', '@', '\t', '\r'].includes(first)) {
    return `'${value}`
  }
  return value
}

// ── Banco Nación ──────────────────────────────────────────────────────────────
// Columnas: Fecha | Hora | Descripción | Débito | Crédito | Saldo
const parseBancoNacion: Parser = (rows) =>
  rows.slice(8)
    .filter(r => r[4] && parseMonto(r[4]) > 0)
    .map(r => {
      const descripcion = sanitizeCsvCell(String(r[2] ?? '').trim())
      return {
        fecha:       parseFecha(r[0]),
        hora:        parseHora(r[1]),
        descripcion,
        monto:       parseMonto(r[4]),
        tipo:        'credito' as const,
        referencia:  descripcion.match(/\d{8,}/)?.[0] ?? null,
        raw:         { cols: r }
      }
    })

// ── BBVA ──────────────────────────────────────────────────────────────────────
// Columnas: Fecha | Concepto | Referencia | Importe | Saldo
const parseBBVA: Parser = (rows) =>
  rows.slice(6)
    .filter(r => r[3] && parseMonto(r[3]) > 0 && !String(r[1]).toLowerCase().includes('debito'))
    .map(r => ({
      fecha:       parseFecha(r[0]),
      hora:        null,
      descripcion: sanitizeCsvCell(String(r[1] ?? '').trim()),
      monto:       parseMonto(r[3]),
      tipo:        'credito' as const,
      referencia:  sanitizeCsvCell(String(r[2] ?? '').trim()) || null,
      raw:         { cols: r }
    }))

// ── Santander ─────────────────────────────────────────────────────────────────
// Columnas: Fecha | Descripción | Importe | Saldo
const parseSantander: Parser = (rows) =>
  rows.slice(5)
    .filter(r => r[2] && parseMonto(r[2]) > 0 && parseFloat(String(r[2])) > 0)
    .map(r => {
      const descripcion = sanitizeCsvCell(String(r[1] ?? '').trim())
      return {
        fecha:       parseFecha(r[0]),
        hora:        null,
        descripcion,
        monto:       parseMonto(r[2]),
        tipo:        'credito' as const,
        referencia:  descripcion.match(/\d{6,}/)?.[0] ?? null,
        raw:         { cols: r }
      }
    })

// ── Galicia ───────────────────────────────────────────────────────────────────
// Columnas: Fecha | Hora | Descripción | Monto | Tipo | Saldo
const parseGalicia: Parser = (rows) =>
  rows.slice(4)
    .filter(r => r[4] && String(r[4]).toLowerCase() === 'haber')
    .map(r => {
      const descripcion = sanitizeCsvCell(String(r[2] ?? '').trim())
      return {
        fecha:       parseFecha(r[0]),
        hora:        parseHora(r[1]),
        descripcion,
        monto:       parseMonto(r[3]),
        tipo:        'credito' as const,
        referencia:  descripcion.match(/\d{8,}/)?.[0] ?? null,
        raw:         { cols: r }
      }
    })

// ── Brubank ───────────────────────────────────────────────────────────────────
// CSV: fecha,hora,descripcion,monto,saldo
const parseBrubank: Parser = (rows) =>
  rows.slice(1)
    .filter(r => r[3] && parseMonto(r[3]) > 0 && parseFloat(String(r[3])) > 0)
    .map(r => ({
      fecha:       parseFecha(r[0]),
      hora:        parseHora(r[1]),
      descripcion: sanitizeCsvCell(String(r[2] ?? '').trim()),
      monto:       parseMonto(r[3]),
      tipo:        'credito' as const,
      referencia:  null,
      raw:         { cols: r }
    }))

// ── Mercado Pago (extracto CSV) ───────────────────────────────────────────────
// Columnas: Fecha | Hora | Tipo | Nombre | Descripcion | Monto | Estado
const parseMercadoPago: Parser = (rows) =>
  rows.slice(1)
    .filter(r => {
      const tipo  = String(r[2] ?? '').toLowerCase()
      const monto = parseFloat(String(r[5]))
      return monto > 0 && (tipo.includes('transferencia') || tipo.includes('cobro') || tipo.includes('pago'))
    })
    .map(r => ({
      fecha:       parseFecha(r[0]),
      hora:        parseHora(r[1]),
      descripcion: sanitizeCsvCell(`${r[3] ?? ''} — ${r[4] ?? ''}`.trim()),
      monto:       parseMonto(r[5]),
      tipo:        'credito' as const,
      referencia:  sanitizeCsvCell(String(r[6] ?? '').trim()) || null,
      raw:         { cols: r }
    }))

// ── Genérico (fallback) ───────────────────────────────────────────────────────
const parseGenerico: Parser = (rows) => {
  if (rows.length < 2) return []
  const header   = rows[0].map((h: any) => String(h ?? '').toLowerCase())
  const iCol     = (terms: string[]) => header.findIndex(h => terms.some(t => h.includes(t)))
  const fechaCol = iCol(['fecha', 'date'])
  const montoCol = iCol(['credito', 'crédito', 'haber', 'importe', 'monto', 'amount'])
  const descCol  = iCol(['descripcion', 'descripción', 'concepto', 'detalle', 'description'])
  if (fechaCol === -1 || montoCol === -1) return []
  return rows.slice(1)
    .filter(r => r[montoCol] && parseMonto(r[montoCol]) > 0 && parseFloat(String(r[montoCol])) > 0)
    .map(r => ({
      fecha:       fechaCol >= 0 ? parseFecha(r[fechaCol]) : todayAR(),
      hora:        null,
      descripcion: descCol >= 0 ? sanitizeCsvCell(String(r[descCol] ?? '').trim()) : '',
      monto:       parseMonto(r[montoCol]),
      tipo:        'credito' as const,
      referencia:  null,
      raw:         { cols: r }
    }))
}

const PARSERS: Record<BancoExtracto, Parser> = {
  'Banco Nación': parseBancoNacion,
  'BBVA':         parseBBVA,
  'Santander':    parseSantander,
  'Galicia':      parseGalicia,
  'Brubank':      parseBrubank,
  'Mercado Pago': parseMercadoPago,
  'Otro':         parseGenerico,
}

export function parsearExtracto(rows: any[][], banco: BancoExtracto): ExtractoRow[] {
  const parser = PARSERS[banco] ?? parseGenerico
  try {
    return parser(rows).filter(r => r.monto > 0)
  } catch (err) {
    console.error(`[parsearExtracto] Error parseando ${banco}:`, err)
    return []
  }
}
