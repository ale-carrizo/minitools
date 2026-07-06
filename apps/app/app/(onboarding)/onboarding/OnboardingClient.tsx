'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveAppsSelection, savePaymentMethod, completeOnboarding } from '@/lib/actions/onboarding'
import { calcPricing } from '@/lib/pricing'
import { ZimpleIcon } from '@/app/components/ZimpleLogo'

import { APPS } from '@/lib/apps-config'

// ── Props ───────────────────────────────────────────────────────────────────
interface Props {
  userName: string
  initialState: {
    apps: string[]
    paymentMethod: string | null
    mpPayerEmail: string | null
    priceMonthly: number
    trialEndsAt: Date | null
  } | null
}

const STEPS = ['Registro', 'Tus apps', 'Pago', 'Confirmación']

export default function OnboardingClient({ userName, initialState }: Props) {
  const router = useRouter()
  const [, startTrans] = useTransition()

  // Start at step 2 — step 1 (registro) already done
  const [step, setStep]                 = useState(2)
  const [selectedApps, setSelectedApps] = useState<string[]>(initialState?.apps ?? [])
  const [payMethod, setPayMethod]       = useState<'mercadopago' | 'tarjeta'>(
    (initialState?.paymentMethod as 'mercadopago' | 'tarjeta') ?? 'mercadopago'
  )
  const [mpEmail, setMpEmail]           = useState(initialState?.mpPayerEmail ?? '')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  // ── Pricing ──────────────────────────────────────────────────────────────
  const { pricePerApp, total } = calcPricing(selectedApps.length)
  const showDiscount = selectedApps.length >= 3

  // ── First charge date (today + 8 days) ──────────────────────────────────
  const firstChargeDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
  const dateStr = firstChargeDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

  function toggleApp(slug: string) {
    setSelectedApps(a => a.includes(slug) ? a.filter(s => s !== slug) : [...a, slug])
  }

  async function handleStep2() {
    if (selectedApps.length === 0) { setError('Elegí al menos 1 app'); return }
    setError(''); setLoading(true)
    try {
      await saveAppsSelection(selectedApps)
      setStep(3)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  async function handleStep3() {
    setError(''); setLoading(true)
    try {
      await savePaymentMethod(payMethod, payMethod === 'mercadopago' ? mpEmail : undefined)
      setStep(4)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  async function handleComplete() {
    setLoading(true)
    startTrans(async () => {
      await completeOnboarding()
      router.push('/dashboard')
    })
  }

  const firstName = userName.split(' ')[0]

  // ── Step indicator ────────────────────────────────────────────────────────
  const StepBar = () => (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const n       = i + 1
        const done    = n < step
        const active  = n === step
        const isLast  = i === STEPS.length - 1
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                done   ? 'bg-[#5448EE] text-white' :
                active ? 'bg-[#5448EE]/20 border-2 border-[#5448EE] text-[#8880F5]' :
                         'bg-white/[0.05] border border-white/[0.12] text-white/25'
              }`}>
                {done
                  ? <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  : n
                }
              </div>
              <span className={`text-[9px] font-medium hidden sm:block ${active ? 'text-[#8880F5]' : done ? 'text-white/40' : 'text-white/20'}`}>
                {label}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-px mx-2 mb-4 transition-all ${done ? 'bg-[#5448EE]/60' : 'bg-white/[0.08]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <div>
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-7">
        <ZimpleIcon size={36} />
        <span className="text-white font-extrabold text-[15px] tracking-tight">Zimple</span>
      </div>

      <StepBar />

      {/* ── STEP 2: Elegir apps ────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="animate-[fade-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">
          <h2 className="text-[22px] font-semibold text-white tracking-tight mb-1">Elegí tus mini apps</h2>
          <p className="text-white/40 text-[13px] mb-5">Empezá con la que necesitas — podés sumar más cuando quieras</p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {APPS.map(app => {
              const sel = selectedApps.includes(app.slug)
              return (
                <button key={app.slug} onClick={() => toggleApp(app.slug)}
                  className={`relative p-3.5 rounded-2xl border text-left transition-all ${
                    sel
                      ? 'border-[#5448EE]/60 bg-[#5448EE]/10'
                      : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}>
                  {sel && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#5448EE] flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 20 20" fill="white"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    </span>
                  )}
                  <span className="text-xl block mb-1.5">{app.icon}</span>
                  <p className={`text-[12px] font-semibold mb-0.5 ${sel ? 'text-[#8880F5]' : 'text-white/80'}`}>{app.label}</p>
                  <p className="text-[10px] text-white/30 leading-tight">{app.desc}</p>
                </button>
              )
            })}
          </div>

          {/* Pricing summary */}
          <div className={`rounded-2xl border p-4 mb-4 transition-all ${showDiscount ? 'border-[#5448EE]/30 bg-[#5448EE]/08' : 'border-white/[0.08] bg-white/[0.03]'}`}>
            {selectedApps.length === 0 ? (
              <p className="text-[12px] text-white/30 text-center">Seleccioná al menos 1 app para continuar</p>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-white/50">
                    {selectedApps.length} app{selectedApps.length !== 1 ? 's' : ''} · <span className={showDiscount ? 'text-[#8880F5] font-semibold' : 'text-white/50'}>US${pricePerApp}/app</span>
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">✓ No se cobra nada hoy — recién el día 8</p>
                </div>
                <div className="text-right">
                  <p className="text-[22px] font-bold text-white">US${total}<span className="text-[13px] text-white/40 font-normal">/mes</span></p>
                  {showDiscount && <p className="text-[9px] text-[#8880F5]">{selectedApps.length} × US${pricePerApp}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Upsell banner (disappears at 3+) */}
          {selectedApps.length > 0 && selectedApps.length < 3 && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/08 px-3.5 py-2.5 mb-4">
              <span className="text-amber-400 text-base">💡</span>
              <p className="text-[11px] text-amber-300/80">
                Sumá <strong>{3 - selectedApps.length} app{3 - selectedApps.length > 1 ? 's' : ''} más</strong> y pagás US$6 c/u en vez de US$7 — ahorrás desde la 3ra
              </p>
            </div>
          )}

          {error && <p className="text-red-400 text-[11px] mb-3">{error}</p>}

          <button onClick={handleStep2} disabled={loading || selectedApps.length === 0}
            className="w-full py-3 rounded-xl bg-[#5448EE] text-white text-[13px] font-semibold hover:bg-[#4438DE] disabled:opacity-40 transition-colors">
            {loading ? 'Guardando…' : 'Continuar →'}
          </button>
        </div>
      )}

      {/* ── STEP 3: Medio de pago ─────────────────────────────────────────── */}
      {step === 3 && (
        <div className="animate-[fade-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">
          <h2 className="text-[22px] font-semibold text-white tracking-tight mb-1">Conectá un medio de pago</h2>
          <p className="text-white/40 text-[13px] mb-5">No se cobra nada hoy. Recién el {dateStr}.</p>

          {/* TEST MODE badge */}
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/08 px-3.5 py-2.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[11px] text-emerald-300/80">
              <strong>Modo test activo</strong> — no se procesará ningún pago real hasta integrar Mercado Pago
            </p>
          </div>

          <div className="space-y-3 mb-5">
            {/* Mercado Pago */}
            <button onClick={() => setPayMethod('mercadopago')}
              className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border transition-all ${
                payMethod === 'mercadopago'
                  ? 'border-[#5448EE]/60 bg-[#5448EE]/08'
                  : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]'
              }`}>
              <div className="w-10 h-10 rounded-xl bg-[#009EE3] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-[11px]">MP</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-semibold text-white">Mercado Pago</p>
                <p className="text-[10px] text-white/35">Débito automático mensual</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                payMethod === 'mercadopago' ? 'border-[#5448EE] bg-[#5448EE]' : 'border-white/20'
              }`}>
                {payMethod === 'mercadopago' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>

            {/* Tarjeta */}
            <button onClick={() => setPayMethod('tarjeta')}
              className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border transition-all ${
                payMethod === 'tarjeta'
                  ? 'border-[#5448EE]/60 bg-[#5448EE]/08'
                  : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]'
              }`}>
              <div className="w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} strokeOpacity={0.6}>
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-semibold text-white">Tarjeta de crédito</p>
                <p className="text-[10px] text-white/35">Visa, Mastercard, Amex</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                payMethod === 'tarjeta' ? 'border-[#5448EE] bg-[#5448EE]' : 'border-white/20'
              }`}>
                {payMethod === 'tarjeta' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          </div>

          {/* MP email input */}
          {payMethod === 'mercadopago' && (
            <div className="mb-5">
              <label className="block text-[11px] text-white/40 mb-1.5">Email de tu cuenta Mercado Pago</label>
              <input value={mpEmail} onChange={e => setMpEmail(e.target.value)}
                type="email" placeholder="tu@email.com"
                className="w-full px-3.5 py-2.5 text-[13px] rounded-xl border border-white/[0.09] bg-white/[0.05] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5448EE]/60" />
            </div>
          )}

          <p className="text-[10px] text-white/25 text-center mb-4">
            Tu método de pago se guarda de forma segura. El primer cobro es automático el día 8 — antes te avisamos por email y WhatsApp.
          </p>

          {error && <p className="text-red-400 text-[11px] mb-3">{error}</p>}

          <div className="flex gap-2">
            <button onClick={() => setStep(2)}
              className="flex-1 py-3 rounded-xl border border-white/10 text-[12px] text-white/40 hover:text-white transition-colors">
              ← Volver
            </button>
            <button onClick={handleStep3} disabled={loading || (payMethod === 'mercadopago' && !mpEmail.trim())}
              className="flex-[2] py-3 rounded-xl bg-[#5448EE] text-white text-[13px] font-semibold hover:bg-[#4438DE] disabled:opacity-40 transition-colors">
              {loading ? 'Guardando…' : 'Continuar →'}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Confirmación ─────────────────────────────────────────── */}
      {step === 4 && (
        <div className="animate-[fade-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">
          {/* Check icon */}
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={2} strokeLinecap="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>

          <h2 className="text-[22px] font-semibold text-white tracking-tight mb-1">
            ¡Listo, {firstName}! Tu cuenta está activa
          </h2>
          <p className="text-white/40 text-[13px] mb-6">7 días de prueba gratis, sin cargo</p>

          {/* Summary card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] divide-y divide-white/[0.06] mb-6">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[12px] text-white/40">Apps elegidas</span>
              <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                {selectedApps.slice(0, 4).map(slug => {
                  const a = APPS.find(x => x.slug === slug)
                  return <span key={slug} className="text-[10px] text-white/60 bg-white/[0.06] px-2 py-0.5 rounded">{a?.icon} {a?.label}</span>
                })}
                {selectedApps.length > 4 && (
                  <span className="text-[10px] text-white/40 bg-white/[0.04] px-2 py-0.5 rounded">+{selectedApps.length - 4} más</span>
                )}
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[12px] text-white/40">Medio de pago</span>
              <span className="text-[12px] text-white/70 font-medium capitalize">{payMethod === 'mercadopago' ? 'Mercado Pago' : 'Tarjeta de crédito'}</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[12px] text-white/40">Precio si no cancelás</span>
              <span className="text-[12px] text-white/70 font-medium">US${total}/mes</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[12px] text-white/40">Primer cobro</span>
              <span className="text-[12px] text-[#8880F5] font-semibold">{dateStr}</span>
            </div>
          </div>

          <button onClick={handleComplete} disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#5448EE] text-white text-[13px] font-semibold hover:bg-[#4438DE] disabled:opacity-40 transition-colors">
            {loading ? 'Cargando…' : 'Empezar a usar Zimple →'}
          </button>
        </div>
      )}
    </div>
  )
}
