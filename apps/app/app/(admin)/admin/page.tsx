import { prisma } from "@/lib/prisma";
import Link from "next/link";

function StatCard({ label, value, sub, accent = "#5448EE", icon }: { label: string; value: string | number; sub?: string; accent?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-white/40">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}20`, color: accent }}>
          {icon}
        </div>
      </div>
      <p className="text-[28px] font-semibold text-white tracking-[-0.03em]">{value}</p>
      {sub && <p className="text-[11px] text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

export default async function AdminPage() {
  const [totalUsers, activeSubscriptions, trialSubscriptions, suspendedUsers, recentUsers, mrr] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "TRIAL" } }),
    prisma.user.count({ where: { suspended: true } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { subscription: true } }),
    prisma.subscription.aggregate({ where: { status: "ACTIVE" }, _sum: { priceMonthly: true } }),
  ]);

  const mrrValue = mrr._sum.priceMonthly ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-white tracking-[-0.03em]">Resumen general</h1>
        <p className="text-white/40 text-sm mt-1">Vista en tiempo real del negocio.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Usuarios totales" value={totalUsers} icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>} />
        <StatCard label="Suscripciones activas" value={activeSubscriptions} accent="#10B981" icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>} />
        <StatCard label="MRR" value={`$${mrrValue.toFixed(0)}`} sub="ingreso mensual recurrente" accent="#8880F5" icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>} />
        <StatCard label="Prueba / Suspendidos" value={`${trialSubscriptions} / ${suspendedUsers}`} accent="#F59E0B" icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>} />
      </div>

      {/* Recent users */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-medium text-white/70">Usuarios recientes</h2>
          <Link href="/admin/users" className="text-xs text-[#8880F5] hover:text-white transition-colors">
            Ver todos →
          </Link>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {recentUsers.length === 0 ? (
            <p className="text-center text-sm text-white/30 py-10">No hay usuarios todavía.</p>
          ) : (
            recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-4 px-6 py-3.5">
                <div className="w-7 h-7 rounded-full bg-[#5448EE] flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() ?? user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">{user.name ?? "—"}</p>
                  <p className="text-xs text-white/30 truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {user.role === "ADMIN" && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#5448EE]/15 text-[#8880F5]">ADMIN</span>
                  )}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    user.suspended ? "bg-red-500/15 text-red-400"
                    : user.subscription?.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-white/[0.06] text-white/30"
                  }`}>
                    {user.suspended ? "Suspendido" : user.subscription?.status === "ACTIVE" ? "Activo" : "Sin plan"}
                  </span>
                  <span className="text-[11px] text-white/25">
                    {new Date(user.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
