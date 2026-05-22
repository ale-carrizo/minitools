import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MiniTools — Todas las herramientas en una sola suscripción",
  description: "Una suscripción. Acceso ilimitado. Sin complicaciones.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${dmSans.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
