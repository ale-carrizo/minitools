import Link from "next/link";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export default function LegalPageLayout({
  eyebrow,
  title,
  updatedAt,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updatedAt: string;
  intro: string[];
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-[#0C0B1A] text-white">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-14">
        <div className="mb-8">
          <Link href="/" className="text-sm text-white/45 transition-colors hover:text-white/80">
            ← Volver al inicio
          </Link>
        </div>

        <div className="mb-10 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 sm:p-9">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8880F5]">
            {eyebrow}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-white/35">Última actualización: {updatedAt}</p>

          <div className="mt-6 space-y-4 text-[15px] leading-7 text-white/72">
            {intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <p className="text-sm leading-6 text-amber-100/90">
            Antes de publicar estas páginas en producción, completá los datos identificatorios del proveedor donde veas campos entre corchetes:
            {" "}
            <strong>[RAZÓN SOCIAL / NOMBRE]</strong>, <strong>[CUIT]</strong>, <strong>[DOMICILIO LEGAL]</strong> y
            {" "}
            <strong>[EMAIL LEGAL / SOPORTE]</strong>.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-white">
                {section.title}
              </h2>

              {section.paragraphs?.length ? (
                <div className="mt-4 space-y-4 text-[15px] leading-7 text-white/72">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}

              {section.bullets?.length ? (
                <ul className="mt-4 space-y-3 text-[15px] leading-7 text-white/72">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#8880F5]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
