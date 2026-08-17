'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { planForAppCount } from '@/lib/plans'
import { createSubscription } from '@/lib/mercadopago'

const TRIAL_DIAS = 7

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
    plan: user?.subscription?.plan ?? null,
    subscriptionStatus: user?.subscription?.status ?? null,
    priceMonthly: user?.subscription?.priceMonthly ?? 0,
    trialEndsAt: user?.subscription?.trialEndsAt ?? null,
  }
}

export async function saveAppsSelection(apps: string[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No auth')
  if (apps.length === 0) throw new Error('Seleccioná al menos 1 app')

  const plan = planForAppCount(apps.length)
  const trialEndsAt = new Date(Date.now() + TRIAL_DIAS * 24 * 60 * 60 * 1000)

  const existing = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
  // Si ya pagó (o está esperando confirmación de MP), no le corremos el trial
  // solo porque volvió a este paso a cambiar de apps.
  const debeRecorrerTrial = !existing || existing.status === 'TRIAL'

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      plan: plan.slug,
      status: 'TRIAL',
      trialEndsAt,
      priceMonthly: plan.priceARS,
      currency: 'ARS',
      appsActivas: JSON.stringify(apps),
    },
    update: {
      plan: plan.slug,
      priceMonthly: plan.priceARS,
      currency: 'ARS',
      appsActivas: JSON.stringify(apps),
      ...(debeRecorrerTrial ? { trialEndsAt } : {}),
    },
  })

  return { plan: plan.label, priceARS: plan.priceARS }
}

// ─── Crea la suscripción real en Mercado Pago y devuelve la URL de checkout ──
// No se cobra nada acá: el primer cobro queda programado para trialEndsAt.
export async function createOnboardingCheckout() {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) throw new Error('No auth')

  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
  if (!sub) throw new Error('Elegí tus apps antes de continuar')
  if (!sub.trialEndsAt) throw new Error('Falta la fecha de fin de prueba')

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? 'https://app.zimple.tools'

  const mpResponse = await createSubscription({
    planSlug: sub.plan,
    userEmail: session.user.email,
    userId: session.user.id,
    backUrl: `${baseUrl}/onboarding/callback`,
    startDate: sub.trialEndsAt,
  })

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: {
      mpPreapprovalId: mpResponse.id ?? null,
      mpPayerEmail: session.user.email,
      paymentMethod: 'mercadopago',
      testMode: false,
    },
  })

  if (!mpResponse.init_point) throw new Error('Mercado Pago no devolvió un link de pago')
  return { checkoutUrl: mpResponse.init_point }
}

// No revalidatePath acá: se llama desde el render de /onboarding/callback
// (Server Component), y revalidatePath solo se permite dentro de Route
// Handlers o Server Actions disparadas por el cliente, no durante un render.
export async function completeOnboarding() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No auth')

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: true },
  })
}
