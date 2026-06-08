import AsistenciaShell from '@/app/components/asistencia/AsistenciaShell'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AsistenciaShell>{children}</AsistenciaShell>
}
