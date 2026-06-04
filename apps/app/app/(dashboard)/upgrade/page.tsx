"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRICES } from "@/lib/mercadopago";

const features = [
  "Acceso completo a las 10 herramientas",
  "Control de Stock con alertas automáticas",
  "Generador de presupuestos en PDF",
  "Control de Caja + lectura de comprobantes con IA",
  "Calculadora de precio de venta",
  "Recibos de sueldo y control de asistencia",
  "Agenda de turnos con recordatorios WhatsApp",
  "CRM de clientes con historial completo",
  "Soporte por email incluido",
  "Actualizaciones automáticas sin costo adicional",
];

export default function UpgradePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: selected }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al procesar el pago.");
        return;
      }

      // Redirigir al checkout de Mercado Pago
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const price = PRICES[selected];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1a2e]">Activá tu suscripción</h1>
        <p className="text-[#6b7280] text-sm mt-1">
          Accedé a todas las herramientas de Zimple Tools.
        </p>
      </div>

      {/* Plan selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setSelected("MONTHLY")}
          className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
            selected === "MONTHLY"
              ? "border-[#5448EE] bg-[#EEF0FF]"
              : "border-[#e5e7eb] bg-white hover:border-[#c7c5f8]"
          }`}
        >
          <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide mb-2">
            Mensual
          </p>
          <p className="text-2xl font-semibold text-[#1a1a2e]">
            ${(PRICES.MONTHLY.amount / 100).toLocaleString("es-AR")}
          </p>
          <p className="text-xs text-[#9ca3af] mt-0.5">por mes</p>
        </button>

        <button
          onClick={() => setSelected("ANNUAL")}
          className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
            selected === "ANNUAL"
              ? "border-[#5448EE] bg-[#EEF0FF]"
              : "border-[#e5e7eb] bg-white hover:border-[#c7c5f8]"
          }`}
        >
          <div className="absolute -top-3 left-4">
            <span className="bg-[#5448EE] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              AHORRÁS 33%
            </span>
          </div>
          <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide mb-2">
            Anual
          </p>
          <p className="text-2xl font-semibold text-[#1a1a2e]">
            ${(PRICES.ANNUAL.amount / 100 / 12).toLocaleString("es-AR")}
          </p>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            por mes · facturado ${(PRICES.ANNUAL.amount / 100).toLocaleString("es-AR")}/año
          </p>
        </button>
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 mb-6">
        <p className="text-sm font-medium text-[#1a1a2e] mb-4">Todo incluido:</p>
        <ul className="space-y-2.5">
          {features.map((f) => (
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
        className="w-full py-4 rounded-2xl bg-[#5448EE] hover:bg-[#4338ca] text-white font-semibold text-[15px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
          `Suscribirse con ${price.period} — ${price.label}`
        )}
      </button>

      <p className="text-center text-xs text-[#9ca3af] mt-4">
        Procesado de forma segura por Mercado Pago · Cancelá cuando quieras
      </p>
    </div>
  );
}
