export default function EstadoBadge({ estado }: { estado: 'borrador' | 'emitido' }) {
  const cfg = estado === 'emitido'
    ? 'text-emerald-400 bg-emerald-500/10'
    : 'text-white/50 bg-white/[0.06]'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${cfg}`}>
      {estado === 'emitido' ? 'Emitido' : 'Borrador'}
    </span>
  )
}
