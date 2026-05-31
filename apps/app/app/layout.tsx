import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import AppSessionProvider from "./components/session-provider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MiniTools — Dashboard",
  description: "Accedé a todas tus herramientas.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${dmSans.variable} h-full`}>
      <body className="min-h-full">
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
