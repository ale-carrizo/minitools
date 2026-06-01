"use client";

import { useActionState } from "react";
import { promoteByEmail } from "./actions";

export default function PromoteForm() {
  const [state, formAction, pending] = useActionState(promoteByEmail, {});

  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 mb-2">
      <h2 className="text-sm font-semibold text-[#1a1a2e] mb-1">
        Agregar administrador
      </h2>
      <p className="text-xs text-[#9ca3af] mb-4">
        El usuario debe estar registrado en MiniTools.
      </p>
      <form action={formAction} className="flex items-center gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="email@ejemplo.com"
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-[#F6F6FB] text-sm text-[#1a1a2e] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#5448EE] focus:border-transparent transition"
        />
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-xl bg-[#5448EE] text-white text-sm font-medium hover:bg-[#4338ca] transition disabled:opacity-60 whitespace-nowrap"
        >
          {pending ? "Guardando..." : "Hacer admin"}
        </button>
      </form>
      {state.error && (
        <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5">
          <span>⚠</span> {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-3 text-sm text-green-600 flex items-center gap-1.5">
          <span>✓</span> {state.success}
        </p>
      )}
    </div>
  );
}
