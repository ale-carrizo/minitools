/**
 * POST /api/scan-comprobante
 * Recibe imagen o PDF, lo procesa con IA y devuelve los datos extraídos.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { procesarComprobante } from '@/lib/ai/comprobante'
import { checkRateLimit } from '@/lib/rate-limit'

const MAX_FILE_SIZE  = 10 * 1024 * 1024
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

// Máximo 20 scans por usuario cada hora.
const SCAN_LIMIT = 20
const SCAN_WINDOW_MS = 60 * 60 * 1000

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const rate = checkRateLimit(`scan:${session.user.id}`, SCAN_LIMIT, SCAN_WINDOW_MS)
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Límite de escaneos alcanzado. Intentá de nuevo más tarde.' }, { status: 429 })
    }

    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'El archivo supera los 10MB' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Formato no soportado. Usá JPG, PNG, WEBP o PDF.' }, { status: 400 })
    }

    const buffer      = await file.arrayBuffer()
    const imageBase64 = Buffer.from(buffer).toString('base64')
    const mimeType    = file.type

    const result = await procesarComprobante(imageBase64, mimeType)

    return NextResponse.json({
      ok:            true,
      monto:         result.monto,
      fecha:         result.fecha,
      hora:          result.hora,
      emisor_nombre: result.emisor_nombre,
      emisor_banco:  result.emisor_banco,
      referencia:    result.referencia,
      tipo:          result.tipo,
      confidence:    result.confidence,
      ia_provider:   result.provider,
      ia_model:      result.model,
      ia_raw:        result.raw,
    })

  } catch (err: any) {
    console.error('[scan-comprobante]', err)
    return NextResponse.json({ error: err.message ?? 'Error interno' }, { status: 500 })
  }
}
