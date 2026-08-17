'use client'

import { useState } from 'react'
import { saveAppsSelection, createOnboardingCheckout } from '@/lib/actions/onboarding'
import { planForAppCount, PLAN_ORDER, PLANS } from '@/lib/plans'
import { ZimpleIcon } from '@/app/components/ZimpleLogo'

import { APPS } from '@/lib/apps-config'

// ── Props ───────────────────────────────────────────────────────────────────
interface Props {
  initialState: {
    apps: string[]
  } | null
}

const STEPS = ['Registro', 'Tus apps', 'Pago', 'Confirmación']

function fmtARS(n: number) {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n)
}

export default function OnboardingClient({ initialState }: Props) {
  // Start at step 2 — step 1 (registro) already done
  const [step, setStep]                 = useState(2)
  const [selectedApps, setSelectedApps] = useState<string[]>(initialState?.apps ?? [])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  // ── Pricing ──────────────────────────────────────────────────────────────
  const plan = planForAppCount(selectedApps.length)
  const nextPlanSlug = PLAN_ORDER[PLAN_ORDER.indexOf(plan.slug) + 1]
  const nextPlan = nextPlanSlug ? PLANS[nextPlanSlug] : null

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

  async function handleCheckout() {
    setError(''); setLoading(true)
    try {
      const { checkoutUrl } = await createOnboardingCheckout()
      window.location.href = checkoutUrl
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

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
                done   ? 'bg-[#5448EE] text-white btn-solid-text' :
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
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 mb-4">
            {selectedApps.length === 0 ? (
              <p className="text-[12px] text-white/30 text-center">Seleccioná al menos 1 app para continuar</p>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-white/50">
                    Plan <span className="text-[#8880F5] font-semibold">{plan.label}</span> · {selectedApps.length} app{selectedApps.length !== 1 ? 's' : ''} de hasta {plan.maxApps}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">✓ No se cobra nada hoy — recién a los 7 días</p>
                </div>
                <div className="text-right">
                  <p className="text-[22px] font-bold text-white">${fmtARS(plan.priceARS)}<span className="text-[13px] text-white/40 font-normal">/mes</span></p>
                  {plan.savingsLabel && <p className="text-[9px] text-[#8880F5]">{plan.savingsLabel}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Upsell banner al siguiente plan */}
          {selectedApps.length > 0 && nextPlan && selectedApps.length === plan.maxApps && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/08 px-3.5 py-2.5 mb-4">
              <span className="text-amber-400 text-base">💡</span>
              <p className="text-[11px] text-amber-300/80">
                Con 1 app más pasás a <strong>{nextPlan.label}</strong> (hasta {nextPlan.maxApps} apps) por ${fmtARS(nextPlan.priceARS)}/mes
              </p>
            </div>
          )}

          {error && <p className="text-red-400 text-[11px] mb-3">{error}</p>}

          <button onClick={handleStep2} disabled={loading || selectedApps.length === 0}
            className="w-full py-3 rounded-xl bg-[#5448EE] text-white btn-solid-text text-[13px] font-semibold hover:bg-[#4438DE] disabled:opacity-40 transition-colors">
            {loading ? 'Guardando…' : 'Continuar →'}
          </button>
        </div>
      )}

      {/* ── STEP 3: Medio de pago ─────────────────────────────────────────── */}
      {step === 3 && (
        <div className="animate-[fade-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">
          <h2 className="text-[22px] font-semibold text-white tracking-tight mb-1">Conectá tu tarjeta</h2>
          <p className="text-white/40 text-[13px] mb-5">7 días gratis. No se cobra nada hoy.</p>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-white/50">Plan {plan.label}</span>
              <span className="text-[14px] font-semibold text-white">${fmtARS(plan.priceARS)}/mes</span>
            </div>
            <p className="text-[10px] text-white/30">Después de los 7 días de prueba, se cobra automático todos los meses. Cancelás cuando quieras.</p>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-[#5448EE]/60 bg-[#5448EE]/08 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#009EE3] flex items-center justify-center flex-shrink-0">
              <span className="text-[#ffffff] font-black text-[11px]">MP</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[13px] font-semibold text-white">Mercado Pago</p>
              <p className="text-[10px] text-white/35">Ingresás tu tarjeta en el checkout seguro de Mercado Pago</p>
            </div>
          </div>

          <p className="text-[10px] text-white/25 text-center mb-4">
            Te vamos a redirigir a Mercado Pago para cargar tu tarjeta. El primer cobro es automático a los 7 días — antes te avisamos por email.
          </p>

          {error && <p className="text-red-400 text-[11px] mb-3">{error}</p>}

          <div className="flex gap-2">
            <button onClick={() => setStep(2)}
              className="flex-1 py-3 rounded-xl border border-white/10 text-[12px] text-white/40 hover:text-white transition-colors">
              ← Volver
            </button>
            <button onClick={handleCheckout} disabled={loading}
              className="flex-[2] py-3 rounded-xl bg-[#5448EE] text-white btn-solid-text text-[13px] font-semibold hover:bg-[#4438DE] disabled:opacity-40 transition-colors">
              {loading ? 'Redirigiendo…' : 'Continuar con Mercado Pago →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
