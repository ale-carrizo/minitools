import { prisma } from "@/lib/prisma";

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  TRIAL: "bg-yellow-100 text-yellow-700",
  CANCELED: "bg-gray-100 text-gray-600",
  SUSPENDED: "bg-red-100 text-red-600",
  EXPIRED: "bg-gray-100 text-gray-500",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Activo",
  TRIAL: "En prueba",
  CANCELED: "Cancelado",
  SUSPENDED: "Suspendido",
  EXPIRED: "Expirado",
};

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  const totalMRR = subscriptions
    .filter((s) => s.status === "ACTIVE")
    .reduce((acc, s) => acc + s.priceMonthly, 0);

  const totalARR = totalMRR * 12;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1a2e]">Suscripciones</h1>
        <p className="text-[#6b7280] text-sm mt-1">
          {subscriptions.length} suscripción{subscriptions.length !== 1 ? "es" : ""} en total
        </p>
      </div>

      {/* MRR / ARR Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
          <p className="text-xs text-[#6b7280] mb-2">MRR</p>
          <p className="text-2xl font-semibold text-[#1a1a2e]">${totalMRR.toFixed(0)}</p>
          <p className="text-[11px] text-[#9ca3af] mt-0.5">ingreso mensual recurrente</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
          <p className="text-xs text-[#6b7280] mb-2">ARR</p>
          <p className="text-2xl font-semibold text-[#1a1a2e]">${totalARR.toFixed(0)}</p>
          <p className="text-[11px] text-[#9ca3af] mt-0.5">ingreso anual proyectado</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
          <p className="text-xs text-[#6b7280] mb-2">Activas</p>
          <p className="text-2xl font-semibold text-[#1a1a2e]">
            {subscriptions.filter((s) => s.status === "ACTIVE").length}
          </p>
          <p className="text-[11px] text-[#9ca3af] mt-0.5">
            de {subscriptions.length} totales
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f3f4f6]">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Usuario</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Plan</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Precio/mes</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Inicio</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Vence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9fafb]">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#9ca3af] text-sm">
                    No hay suscripciones todavía.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#fafafa]">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#1a1a2e]">{sub.user.name ?? "—"}</p>
                      <p className="text-xs text-[#9ca3af]">{sub.user.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF0FF] text-[#5448EE]">
                        {sub.plan === "ANNUAL" ? "Anual" : "Mensual"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusBadge[sub.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {statusLabel[sub.status] ?? sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#1a1a2e] font-medium">
                      ${sub.priceMonthly} {sub.currency}
                    </td>
                    <td className="px-4 py-4 text-xs text-[#9ca3af]">
                      {new Date(sub.startDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-4 text-xs text-[#9ca3af]">
                      {sub.endDate
                        ? new Date(sub.endDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
                        : sub.trialEndsAt
                        ? `Trial hasta ${new Date(sub.trialEndsAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
