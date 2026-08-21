import type { NextConfig } from "next";

// Headers de seguridad base. No incluye Content-Security-Policy a propósito:
// esta app carga fuentes de Google, redirige a Mercado Pago, usa Google OAuth
// y genera PDFs — armar un CSP correcto para todo eso necesita probarse
// página por página, así que queda para una tarea aparte en vez de arriesgar
// romper algo silenciosamente acá.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Varios flujos suben archivos como data-URL base64 (logos, comprobantes,
      // adjuntos de tareas) con límites de hasta 3MB por archivo. Base64 infla
      // el tamaño ~33%, así que sin este ajuste el default de Next (1MB) rechaza
      // silenciosamente cualquier archivo de más de ~700KB antes de que el
      // server action llegue a ejecutarse.
      bodySizeLimit: "8mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
