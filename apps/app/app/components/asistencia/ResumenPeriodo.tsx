import { formatHoras, type Empleado } from '@/types/asistencia'

export default function ResumenPeriodo({
  resumen,
}: {
  resumen: Array<{
    empleado: Empleado
    presentes: number
    tardanzas: number
    ausentes: number
    medioDia: number
    libres: number
    totalHoras: number
  }>
}) {
  const totales = resumen.reduce((acc, item) => ({
    presentes: acc.presentes + item.presentes,
    tardanzas: acc.tardanzas + item.tardanzas,
    ausentes: acc.ausentes + item.ausentes,
    libres: acc.libres + item.libres,
    totalHoras: acc.totalHoras + item.totalHoras,
  }), { presentes: 0, tardanzas: 0, ausentes: 0, libres: 0, totalHoras: 0 })

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-white/30 uppercase tracking-wider text-[10px] border-b border-white/[0.05]">
              <th className="px-5 py-3">Empleado</th>
              <th className="px-5 py-3">Presentes</th>
              <th className="px-5 py-3">Tardanzas</th>
              <th className="px-5 py-3">Ausentes</th>
              <th className="px-5 py-3">Franco</th>
              <th className="px-5 py-3">Horas totales</th>
            </tr>
          </thead>
          <tbody>
            {resumen.map((item) => (
              <tr key={item.empleado.id} className="border-b border-white/[0.04]">
                <td className="px-5 py-3 text-white">{item.empleado.nombre}</td>
                <td className="px-5 py-3 text-white/60">{item.presentes + item.medioDia}</td>
                <td className="px-5 py-3 text-white/60">{item.tardanzas}</td>
                <td className="px-5 py-3 text-white/60">{item.ausentes}</td>
                <td className="px-5 py-3 text-white/60">{item.libres}</td>
                <td className="px-5 py-3 text-white/60">{formatHoras(item.totalHoras)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="px-5 py-3 text-white font-medium">Totales</td>
              <td className="px-5 py-3 text-white/60">{totales.presentes}</td>
              <td className="px-5 py-3 text-white/60">{totales.tardanzas}</td>
              <td className="px-5 py-3 text-white/60">{totales.ausentes}</td>
              <td className="px-5 py-3 text-white/60">{totales.libres}</td>
              <td className="px-5 py-3 text-white/60">{formatHoras(totales.totalHoras)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
