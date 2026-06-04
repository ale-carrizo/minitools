import { prisma } from "@/lib/prisma";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  const totalMRR = subscriptions.filter((s) => s.status === "ACTIVE").reduce((acc, s) => acc + s.priceMonthly, 0);
  const totalARR = totalMRR * 12;

  const statusStyle: Record<string, string> = {
    ACTIVE: "bg-emerald-500/15 text-emerald-400",
    TRIAL: "bg-yellow-500/15 text-yellow-400",
    CANCELED: "bg-white/[0.06] text-white/30",
    SUSPENDED: "bg-red-500/15 text-red-400",
    EXPIRED: "bg-white/[0.06] text-white/25",
  };
  const statusLabel: Record<string, string> = { ACTIVE: "Activo", TRIAL: "En prueba", CANCELED: "Cancelado", SUSPENDED: "Suspendido", EXPIRED: "Expirado" };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-white tracking-[-0.03em]">Suscripciones</h1>
        <p className="text-white/40 text-sm mt-1">{subscriptions.length} en total</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "MRR", value: `$${totalMRR.toFixed(0)}`, sub: "ingreso mensual recurrente" },
          { label: "ARR", value: `$${totalARR.toFixed(0)}`, sub: "ingreso anual proyectado" },
          { label: "Activas", value: subscriptions.filter((s) => s.status === "ACTIVE").length, sub: `de ${subscriptions.length} totales` },
        ].map((c) => (
          <div key={c.label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-2">{c.label}</p>
            <p className="text-2xl font-semibold text-white tracking-[-0.02em]">{c.value}</p>
            <p className="text-[11px] text-white/30 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Usuario", "Plan", "Estado", "Precio/mes", "Inicio", "Vence"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {subscriptions.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/25 text-sm">No hay suscripciones todavía.</td></tr>
              ) : subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white/80">{sub.user.name ?? "—"}</p>
                    <p className="text-xs text-white/30">{sub.user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#5448EE]/15 text-[#8880F5]">
                      {sub.plan === "ANNUAL" ? "Anual" : "Mensual"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusStyle[sub.status] ?? "bg-white/[0.06] text-white/30"}`}>
                      {statusLabel[sub.status] ?? sub.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-white/70">${sub.priceMonthly} {sub.currency}</td>
                  <td className="px-5 py-4 text-xs text-white/30">{new Date(sub.startDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td className="px-5 py-4 text-xs text-white/30">{sub.endDate ? new Date(sub.endDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
