'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { calcPricing } from '@/lib/pricing'

export async function getOnboardingState() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  })
  return {
    name: user?.name ?? '',
    completed: user?.onboardingCompleted ?? false,
    apps: user?.subscription?.appsActivas
      ? (JSON.parse(user.subscription.appsActivas) as string[])
      : [] as string[],
    paymentMethod: user?.subscription?.paymentMethod ?? null,
    mpPayerEmail: user?.subscription?.mpPayerEmail ?? null,
    priceMonthly: user?.subscription?.priceMonthly ?? 0,
    trialEndsAt: user?.subscription?.trialEndsAt ?? null,
  }
}

export async function saveAppsSelection(apps: string[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No auth')
  if (apps.length === 0) throw new Error('Seleccioná al menos 1 app')

  const { total } = calcPricing(apps.length)
  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      plan: 'MONTHLY',
      status: 'TRIAL',
      trialEndsAt,
      priceMonthly: total,
      currency: 'USD',
      appsActivas: JSON.stringify(apps),
    },
    update: {
      priceMonthly: total,
      appsActivas: JSON.stringify(apps),
    },
  })
}

export async function savePaymentMethod(method: string, mpEmail?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No auth')

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: {
      paymentMethod: method,
      mpPayerEmail: mpEmail ?? null,
      testMode: true,
    },
  })
}

export async function completeOnboarding() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No auth')

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: true },
  })

  revalidatePath('/dashboard')
}
