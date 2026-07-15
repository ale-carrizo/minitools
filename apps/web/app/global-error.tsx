"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", flexDirection: "column", gap: "1rem" }}>
          <p>Algo salió mal.</p>
          <button onClick={() => reset()} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #ccc", cursor: "pointer" }}>
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
