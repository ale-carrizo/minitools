import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PLANS, type PlanSlug } from '@/lib/plans'
import { APPS } from '@/lib/apps-config'
import { ZimpleIcon } from '@/app/components/ZimpleLogo'
import { completeOnboarding } from '@/lib/actions/onboarding'
import Link from 'next/link'

const STEPS = ['Registro', 'Tus apps', 'Pago', 'Confirmación']

export default async function OnboardingCallbackPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  })
  if (!user?.subscription) redirect('/onboarding')

  await completeOnboarding()

  const sub = user.subscription
  const plan = PLANS[sub.plan as PlanSlug]
  const apps: string[] = sub.appsActivas ? JSON.parse(sub.appsActivas) : []
  const confirmado = sub.status === 'ACTIVE'
  const firstName = (user.name ?? '').split(' ')[0]
  const dateStr = sub.trialEndsAt
    ? new Date(sub.trialEndsAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div>
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-7">
        <ZimpleIcon size={36} />
        <span className="text-white font-extrabold text-[15px] tracking-tight">Zimple</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold bg-[#5448EE] text-white btn-solid-text">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              </div>
              <span className="text-[9px] font-medium hidden sm:block text-white/40">{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px mx-2 mb-4 bg-[#5448EE]/60" />}
          </div>
        ))}
      </div>

      {/* Check icon */}
      <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={2} strokeLinecap="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>

      <h2 className="text-[22px] font-semibold text-white tracking-tight mb-1">
        ¡Listo{firstName ? `, ${firstName}` : ''}! Tu cuenta está activa
      </h2>
      <p className="text-white/40 text-[13px] mb-6">
        {confirmado
          ? '7 días de prueba gratis, sin cargo'
          : 'Estamos confirmando tu tarjeta con Mercado Pago — puede demorar un minuto'}
      </p>

      {/* Summary card */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] divide-y divide-white/[0.06] mb-6">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[12px] text-white/40">Plan</span>
          <span className="text-[12px] text-white/70 font-medium">{plan?.label ?? sub.plan}</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[12px] text-white/40">Apps elegidas</span>
          <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
            {apps.slice(0, 4).map(slug => {
              const a = APPS.find(x => x.slug === slug)
              return <span key={slug} className="text-[10px] text-white/60 bg-white/[0.06] px-2 py-0.5 rounded">{a?.icon} {a?.label}</span>
            })}
            {apps.length > 4 && (
              <span className="text-[10px] text-white/40 bg-white/[0.04] px-2 py-0.5 rounded">+{apps.length - 4} más</span>
            )}
          </div>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[12px] text-white/40">Precio si no cancelás</span>
          <span className="text-[12px] text-white/70 font-medium">${new Intl.NumberFormat('es-AR').format(sub.priceMonthly)}/mes</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[12px] text-white/40">Primer cobro</span>
          <span className="text-[12px] text-[#8880F5] font-semibold">{dateStr}</span>
        </div>
      </div>

      <Link href="/dashboard"
        className="block w-full text-center py-3.5 rounded-xl bg-[#5448EE] text-white btn-solid-text text-[13px] font-semibold hover:bg-[#4438DE] transition-colors">
        Empezar a usar Zimple →
      </Link>
    </div>
  )
}
