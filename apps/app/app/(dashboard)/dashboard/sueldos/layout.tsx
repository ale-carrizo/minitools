export default function SueldosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.035em] text-white">
          Recibo de Sueldo
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Subí tu planilla Excel y generá los PDFs para imprimir
        </p>
      </div>
      {children}
    </div>
  )
}
