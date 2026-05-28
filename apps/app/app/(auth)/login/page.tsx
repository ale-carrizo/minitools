"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F6FB] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#5448EE] mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
            >
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1.5"
                fill="currentColor"
              />
              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1.5"
                fill="currentColor"
                opacity="0.6"
              />
              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1.5"
                fill="currentColor"
                opacity="0.6"
              />
              <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1.5"
                fill="currentColor"
                opacity="0.3"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#1a1a2e]">
            Bienvenido de nuevo
          </h1>
          <p className="text-[#6b7280] mt-1 text-sm">
            Ingresá a tu cuenta de MiniTools
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#374151] mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tu@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-[#F6F6FB] text-[#1a1a2e] text-sm placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#5448EE] focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#374151]"
                >
                  Contraseña
                </label>
                <Link
                  href="#"
                  className="text-xs text-[#5448EE] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-[#F6F6FB] text-[#1a1a2e] text-sm placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#5448EE] focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#5448EE] text-white text-sm font-medium hover:bg-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#5448EE] focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6b7280] mt-6">
          ¿No tenés cuenta?{" "}
          <Link
            href="/register"
            className="text-[#5448EE] font-medium hover:underline"
          >
            Registrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
