import CajaShell from "@/app/components/caja/CajaShell"

export default function CajaLayout({ children }: { children: React.ReactNode }) {
  return <CajaShell>{children}</CajaShell>
}
