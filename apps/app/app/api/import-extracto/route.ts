/**
 * POST /api/import-extracto
 * Recibe un XLS/CSV bancario, lo parsea y devuelve los movimientos detectados.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { parsearExtracto } from '@/lib/parsers/extractos'
import type { BancoExtracto } from '@/types/caja'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    const banco    = formData.get('banco') as BancoExtracto | null

    if (!file)  return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    if (!banco) return NextResponse.json({ error: 'Banco no especificado' }, { status: 400 })
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'El archivo supera los 10MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let rows: any[][] = []

    if (file.name.endsWith('.csv') || file.type === 'text/csv') {
      const text = buffer.toString('utf-8')
      rows = text
        .split('\n')
        .map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')))
        .filter(r => r.some(c => c !== ''))
    } else {
      const XLSX = await import('xlsx')
      const wb   = XLSX.read(buffer, { type: 'buffer', cellDates: true })
      const ws   = wb.Sheets[wb.SheetNames[0]]
      rows       = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as any[][]
    }

    const movimientos = parsearExtracto(rows, banco)

    return NextResponse.json({ ok: true, banco, total: movimientos.length, movimientos })

  } catch (err: any) {
    console.error('[import-extracto]', err)
    return NextResponse.json({ error: err.message ?? 'Error al parsear el archivo' }, { status: 500 })
  }
}
