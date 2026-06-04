"use client";

import { useActionState } from "react";
import { promoteByEmail } from "./actions";

export default function PromoteForm() {
  const [state, formAction, pending] = useActionState(promoteByEmail, {});

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-2">
      <h2 className="text-sm font-semibold text-white/70 mb-0.5">Agregar administrador</h2>
      <p className="text-xs text-white/30 mb-4">El usuario debe estar registrado en Zimple Tools.</p>
      <form action={formAction} className="flex items-center gap-3">
        <input
          name="email" type="email" required
          placeholder="email@ejemplo.com"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#5448EE] focus:border-transparent transition"
        />
        <button
          type="submit" disabled={pending}
          className="px-5 py-2.5 rounded-xl bg-[#5448EE] hover:bg-[#4035d4] text-white text-sm font-medium transition disabled:opacity-60 whitespace-nowrap"
        >
          {pending ? "Guardando..." : "Hacer admin"}
        </button>
      </form>
      {state.error && <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5">⚠ {state.error}</p>}
      {state.success && <p className="mt-3 text-sm text-emerald-400 flex items-center gap-1.5">✓ {state.success}</p>}
    </div>
  );
}
