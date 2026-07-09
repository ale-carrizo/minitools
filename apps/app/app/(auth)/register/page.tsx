"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "./actions";
import ParticleField from "../../components/ParticleField";
import { ZimpleIcon } from "../../components/ZimpleLogo";

export default function RegisterPage() {
  const router = useRouter();
  const emailRef    = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(registerUser, {});

  // Esta página es siempre oscura (fondo hardcodeado); si se llega acá por
  // navegación client-side desde una página en tema claro, --color-white
  // seguiría invertido y el texto quedaría invisible.
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
  }, []);

  useEffect(() => {
    if (state.success) {
      signIn("credentials", {
        email:       emailRef.current?.value,
        password:    passwordRef.current?.value,
        callbackUrl: "/onboarding",
        redirect:    true,
      });
    }
  }, [state.success]);

  return (
    <div className="min-h-screen bg-[#0C0B1A] flex items-center justify-center px-4 relative overflow-hidden grain">
      {/* Aurora mesh */}
      <div className="aurora" />

      {/* Constellation particles */}
      <ParticleField className="z-[1] opacity-70" />

      {/* Central glow */}
      <div
        className="absolute pointer-events-none z-[1] animate-[pulse-glow_6s_ease-in-out_infinite]"
        style={{
          width: "640px", height: "440px", borderRadius: "50%",
          background: "radial-gradient(ellipse at center, #642AEB 0%, #326FEE 40%, #00BDE6 70%, transparent 85%)",
          filter: "blur(4px)", opacity: 0.16,
          top: "50%", left: "50%", transform: "translate(-50%, -58%)",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo + step indicator */}
        <div className="text-center mb-8 animate-[fade-up_0.7s_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="inline-flex items-center justify-center mb-4 animate-[float_7s_ease-in-out_infinite] rounded-[14px] shadow-[0_8px_30px_-6px_rgba(50,111,238,0.7)]">
            <ZimpleIcon size={48} />
          </div>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {['Registro','Tus apps','Pago','Confirmación'].map((label, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i === 0 ? 'bg-[#5448EE]/20 border-2 border-[#5448EE] text-[#8880F5]' : 'bg-white/[0.05] border border-white/[0.10] text-white/20'
                }`}>{i + 1}</div>
                {i < 3 && <div className="w-5 h-px bg-white/[0.08]" />}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/30 mb-3">PASO 1 DE 4</p>
          <h1 className="text-[26px] font-semibold text-white tracking-[-0.035em]">
            Creá tu cuenta
          </h1>
          <p className="text-white/45 text-sm mt-2">
            Empezá gratis — <span className="text-gradient font-medium">7 días sin cargo</span>
          </p>
        </div>

        {/* Glass card */}
        <div className="glass rounded-2xl p-7 animate-[scale-in_0.6s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/60 mb-1.5">
                Nombre completo
              </label>
              <input
                id="name" name="name" type="text"
                autoComplete="name" required placeholder="Tu nombre"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.10] text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#5448EE]/70 focus:border-transparent focus:bg-white/[0.07]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-1.5">
                Email
              </label>
              <input
                ref={emailRef}
                id="email" name="email" type="email"
                autoComplete="email" required placeholder="tu@email.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.10] text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#5448EE]/70 focus:border-transparent focus:bg-white/[0.07]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/60 mb-1.5">
                Contraseña
              </label>
              <input
                ref={passwordRef}
                id="password" name="password" type="password"
                autoComplete="new-password" required minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.10] text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#5448EE]/70 focus:border-transparent focus:bg-white/[0.07]"
              />
            </div>

            {state.error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {state.error}
              </div>
            )}

            <button
              type="submit" disabled={pending}
              className="btn-brand w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creando cuenta...
                </span>
              ) : "Crear cuenta gratis"}
            </button>

            <p className="text-[11px] text-center text-white/25">
              Al registrarte aceptás nuestros{" "}
              <Link href="#" className="underline hover:text-white/50 transition-colors">Términos</Link>
              {" "}y{" "}
              <Link href="#" className="underline hover:text-white/50 transition-colors">Privacidad</Link>.
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-xs text-white/30">o registrate con</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.10] text-white/80 text-sm font-medium hover:bg-white/[0.10] hover:text-white hover:border-white/20"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/30 mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-[#8880F5] hover:text-white font-medium transition-colors">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  );
}
