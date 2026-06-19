import { getTablero } from '@/lib/actions/tareas'
import KanbanBoard from '@/app/components/tareas/KanbanBoard'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ id: string }> }

export default async function TableroPage({ params }: Props) {
  const { id } = await params
  try {
    const tablero = await getTablero(id)
    return <KanbanBoard tablero={tablero} />
  } catch {
    notFound()
  }
}
