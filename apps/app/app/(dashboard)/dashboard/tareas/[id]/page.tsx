import { getTablero } from '@/lib/actions/tareas'
import { getClientesSugeridos } from '@/lib/actions/clientes-sugeridos'
import KanbanBoard from '@/app/components/tareas/KanbanBoard'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ id: string }> }

export default async function TableroPage({ params }: Props) {
  const { id } = await params
  try {
    const [tablero, clientesSugeridos] = await Promise.all([
      getTablero(id),
      getClientesSugeridos(),
    ])
    return <KanbanBoard tablero={tablero} clientesSugeridos={clientesSugeridos} />
  } catch {
    notFound()
  }
}
