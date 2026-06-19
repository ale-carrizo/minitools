'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function enviarSugerencia(data: {
  texto:     string
  categoria: string
  tool?:     string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  await prisma.sugerencia.create({
    data: {
      userId:    session.user.id,
      texto:     data.texto.trim(),
      categoria: data.categoria,
      tool:      data.tool ?? null,
    },
  })
}
