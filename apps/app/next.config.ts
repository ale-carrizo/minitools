import type { NextConfig } from "next";

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
};

export default nextConfig;
