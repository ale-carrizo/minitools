import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MiniTools — Todas las herramientas en una sola suscripción",
  description: "Una suscripción. Acceso ilimitado. Sin complicaciones.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${syne.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
