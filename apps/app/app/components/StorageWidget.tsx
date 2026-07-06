import { auth } from '@/auth'
import { getUserStorageInfo } from '@/lib/storage'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export default async function StorageWidget() {
  const session = await auth()
  if (!session?.user?.id) return null

  const info = await getUserStorageInfo(session.user.id)
  const isOver = info.exceededAt !== null

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="text-white/40">
            <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          <span className="text-[12px] font-medium text-white/60">Almacenamiento</span>
        </div>
        <span className={`text-[12px] font-semibold ${isOver ? 'text-red-400' : 'text-white/50'}`}>
          {formatBytes(info.usedBytes)} / {formatBytes(info.limitBytes)}
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-[#326FEE]'}`}
          style={{ width: `${Math.max(info.percent, 1.5)}%` }}
        />
      </div>

      {isOver && (
        <p className="text-[11px] text-red-400/90 mt-2.5">
          Superaste el límite de almacenamiento. Liberá espacio (borrá logos de presupuestos viejos)
          {info.daysRemaining !== null && info.daysRemaining > 0
            ? ` — tenés ${info.daysRemaining} día${info.daysRemaining !== 1 ? 's' : ''} antes de que borremos los archivos más antiguos automáticamente.`
            : ' — vamos a borrar los archivos más antiguos automáticamente en la próxima limpieza.'}
        </p>
      )}
    </div>
  )
}
