"use client";

import { useActionState } from "react";
import { createUserManual } from "./actions";

export default function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserManual, {});

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-4">
      <h2 className="text-sm font-semibold text-white/70 mb-0.5">Crear usuario manualmente</h2>
      <p className="text-xs text-white/30 mb-4">
        Se genera una contraseña temporal para que pueda iniciar sesión con email y contraseña.
      </p>

      <form action={formAction} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="name"
            type="text"
            required
            placeholder="Nombre completo"
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#5448EE] focus:border-transparent transition"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="email@ejemplo.com"
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#5448EE] focus:border-transparent transition"
          />
        </div>

        <input
          name="password"
          type="password"
          placeholder="Contraseña (opcional — se genera una temporal si dejás esto vacío)"
          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#5448EE] focus:border-transparent transition"
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input
              name="role"
              type="checkbox"
              value="ADMIN"
              className="w-4 h-4 rounded border-white/[0.10] bg-white/[0.06] text-[#5448EE] focus:ring-[#5448EE]"
            />
            Crear como administrador
          </label>

          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2.5 rounded-xl bg-[#5448EE] hover:bg-[#4035d4] text-white btn-solid-text text-sm font-medium transition disabled:opacity-60 whitespace-nowrap"
          >
            {pending ? "Creando..." : "Crear usuario"}
          </button>
        </div>
      </form>

      {state.error && (
        <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5">⚠ {state.error}</p>
      )}

      {state.success && state.tempPassword && state.email && (
        <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
          <p className="text-sm text-emerald-300 flex items-center gap-1.5 mb-2">
            ✓ {state.success}
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-white/60">
              <span className="text-white/40">Email:</span>{" "}
              <span className="text-white/80">{state.email}</span>
            </p>
            <p className="text-white/60 flex items-center gap-2">
              <span className="text-white/40">Contraseña temporal:</span>
              <code className="rounded bg-black/30 px-2 py-0.5 text-emerald-200 font-mono">
                {state.tempPassword}
              </code>
            </p>
            <p className="text-[11px] text-white/30 mt-2">
              Copiala ahora: no se vuelve a mostrar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
