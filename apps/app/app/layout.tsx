import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppSessionProvider from "./components/session-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Zimple Tools — Dashboard",
  description: "Accedé a todas tus herramientas.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <head>
        {/* Aplica el tema guardado antes del primer paint, para evitar flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('zimple-theme')==='light'){document.documentElement.setAttribute('data-theme','light')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full">
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
