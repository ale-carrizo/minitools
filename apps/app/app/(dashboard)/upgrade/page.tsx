"use client";

import { useState } from "react";
import { PLANS, PLAN_ORDER, type PlanSlug } from "@/lib/plans";

const PLAN_FEATURES: Record<PlanSlug, string[]> = {
  UNA_HERRAMIENTA: ["Elegí 1 herramienta", "Actualizaciones incluidas", "Soporte por email", "Cancelá cuando quieras"],
  STARTER: ["Elegí hasta 3 herramientas", "Cambiá herramientas cuando lo necesites", "Actualizaciones incluidas", "Soporte por email"],
  PRO: ["Elegí hasta 6 herramientas", "Cambiá herramientas cuando lo necesites", "Actualizaciones incluidas", "Soporte prioritario"],
  FULL: ["Acceso a las 12 herramientas", "Nuevas herramientas incluidas automáticamente", "Actualizaciones incluidas", "Soporte prioritario"],
};

function fmtARS(n: number) {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(n);
}

export default function UpgradePage() {
  const [selected, setSelected] = useState<PlanSlug>("PRO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: selected }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al procesar el pago.");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const plan = PLANS[selected];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1a2e]">Activá o cambiá tu plan</h1>
        <p className="text-[#6b7280] text-sm mt-1">
          Elegí cuántas herramientas necesitás.
        </p>
      </div>

      {/* Plan selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {PLAN_ORDER.map((slug) => {
          const p = PLANS[slug];
          return (
            <button
              key={slug}
              onClick={() => setSelected(slug)}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                selected === slug
                  ? "border-[#5448EE] bg-[#EEF0FF]"
                  : "border-[#e5e7eb] bg-[#ffffff] hover:border-[#c7c5f8]"
              }`}
            >
              {p.savingsLabel && (
                <div className="absolute -top-3 left-3">
                  <span className="bg-[#5448EE] text-white btn-solid-text text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
                    {p.savingsLabel.toUpperCase()}
                  </span>
                </div>
              )}
              <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-2">
                {p.label}
              </p>
              <p className="text-xl font-semibold text-[#1a1a2e]">
                ${fmtARS(p.priceARS)}
              </p>
              <p className="text-[11px] text-[#9ca3af] mt-0.5">
                por mes · hasta {p.maxApps} app{p.maxApps > 1 ? "s" : ""}
              </p>
            </button>
          );
        })}
      </div>

      {/* Features */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#e5e7eb] p-6 mb-6">
        <p className="text-sm font-medium text-[#1a1a2e] mb-4">Plan {plan.label} incluye:</p>
        <ul className="space-y-2.5">
          {PLAN_FEATURES[selected].map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-[#374151]">
              <span className="w-4 h-4 rounded-full bg-[#EEF0FF] flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 20 20" fill="#5448EE">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          ⚠ {error}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-[#5448EE] hover:bg-[#4338ca] text-white btn-solid-text font-semibold text-[15px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Redirigiendo a Mercado Pago...
          </span>
        ) : (
          `Suscribirse a ${plan.label} — $${fmtARS(plan.priceARS)}/mes`
        )}
      </button>

      <p className="text-center text-xs text-[#9ca3af] mt-4">
        Procesado de forma segura por Mercado Pago · Cancelá cuando quieras
      </p>
    </div>
  );
}
