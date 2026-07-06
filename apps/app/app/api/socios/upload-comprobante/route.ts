import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const MAX_SIZE = 3 * 1024 * 1024 // 3 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Formato no permitido (JPG, PNG, WEBP, PDF)' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'El archivo supera los 3MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const b64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${b64}`

    return NextResponse.json({ url: dataUrl })
  } catch {
    return NextResponse.json({ error: 'Error al procesar el archivo' }, { status: 500 })
  }
}
