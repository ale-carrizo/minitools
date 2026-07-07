import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const MAX_SIZE = 3 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

function verificarFirma(buffer: Buffer, mime: string): boolean {
  const head = buffer.subarray(0, 12)
  switch (mime) {
    case 'image/jpeg':
      return head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF
    case 'image/png':
      return (
        head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47 &&
        head[4] === 0x0D && head[5] === 0x0A && head[6] === 0x1A && head[7] === 0x0A
      )
    case 'image/webp':
      return (
        head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
        head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50
      )
    case 'application/pdf':
      return head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46
    default:
      return false
  }
}

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

    if (!verificarFirma(buffer, file.type)) {
      return NextResponse.json({ error: 'El archivo no coincide con su tipo declarado' }, { status: 400 })
    }

    const b64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${b64}`

    return NextResponse.json({ url: dataUrl })
  } catch {
    return NextResponse.json({ error: 'Error al procesar el archivo' }, { status: 500 })
  }
}
