import { getTableros } from '@/lib/actions/tareas'
import TablerosClient from '@/app/components/tareas/TablerosClient'

export default async function TareasPage() {
  const tableros = await getTableros()
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.035em] text-white">Tareas</h1>
        <p className="text-white/40 text-sm mt-1">Tableros Kanban para organizar tu trabajo</p>
      </div>
      <TablerosClient tableros={tableros} />
    </div>
  )
}
