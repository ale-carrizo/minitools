'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'

// Máximo 5 sugerencias por usuario cada 10 minutos.
const SUGERENCIA_LIMIT = 5
const SUGERENCIA_WINDOW_MS = 10 * 60 * 1000

export async function enviarSugerencia(data: {
  texto:     string
  categoria: string
  tool?:     string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const rate = checkRateLimit(`sugerencia:${session.user.id}`, SUGERENCIA_LIMIT, SUGERENCIA_WINDOW_MS)
  if (!rate.allowed) {
    throw new Error('Esperá unos minutos antes de enviar otra sugerencia')
  }

  await prisma.sugerencia.create({
    data: {
      userId:    session.user.id,
      texto:     data.texto.trim(),
      categoria: data.categoria,
      tool:      data.tool ?? null,
    },
  })
}
