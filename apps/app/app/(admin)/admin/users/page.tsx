import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { suspendUser, unsuspendUser, makeAdmin, removeAdmin } from "./actions";

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  TRIAL: "bg-yellow-100 text-yellow-700",
  CANCELED: "bg-gray-100 text-gray-600",
  SUSPENDED: "bg-red-100 text-red-600",
  EXPIRED: "bg-gray-100 text-gray-600",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Activo",
  TRIAL: "En prueba",
  CANCELED: "Cancelado",
  SUSPENDED: "Suspendido",
  EXPIRED: "Expirado",
};

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { subscription: true },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1a2e]">Usuarios</h1>
        <p className="text-[#6b7280] text-sm mt-1">
          {users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f3f4f6]">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Usuario</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Rol</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Plan</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Registro</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9fafb]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#9ca3af] text-sm">
                    No hay usuarios todavía.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#fafafa]">
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#5448EE] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() ?? user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[#1a1a2e]">{user.name ?? "—"}</p>
                          <p className="text-xs text-[#9ca3af]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        user.role === "ADMIN" ? "bg-[#EEF0FF] text-[#5448EE]" : "bg-[#f3f4f6] text-[#6b7280]"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    {/* Plan */}
                    <td className="px-4 py-4 text-[#6b7280]">
                      {user.subscription ? (
                        <span>
                          {user.subscription.plan === "ANNUAL" ? "Anual" : "Mensual"} — ${user.subscription.priceMonthly}/mes
                        </span>
                      ) : (
                        <span className="text-[#d1d5db]">Sin plan</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        user.suspended
                          ? "bg-red-100 text-red-600"
                          : user.subscription
                          ? statusBadge[user.subscription.status] ?? "bg-gray-100 text-gray-600"
                          : "bg-[#f3f4f6] text-[#9ca3af]"
                      }`}>
                        {user.suspended
                          ? "Suspendido"
                          : user.subscription
                          ? statusLabel[user.subscription.status] ?? user.subscription.status
                          : "Sin plan"}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-4 text-[#9ca3af] text-xs">
                      {new Date(user.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Skip self */}
                        {user.id !== session?.user?.id && (
                          <>
                            {/* Suspend / Unsuspend */}
                            <form action={user.suspended ? unsuspendUser.bind(null, user.id) : suspendUser.bind(null, user.id)}>
                              <button
                                type="submit"
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                  user.suspended
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-red-100 text-red-600 hover:bg-red-200"
                                }`}
                              >
                                {user.suspended ? "Reactivar" : "Suspender"}
                              </button>
                            </form>
                            {/* Admin toggle */}
                            <form action={user.role === "ADMIN" ? removeAdmin.bind(null, user.id) : makeAdmin.bind(null, user.id)}>
                              <button
                                type="submit"
                                className="text-xs px-3 py-1.5 rounded-lg font-medium bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb] transition-colors"
                              >
                                {user.role === "ADMIN" ? "Quitar admin" : "Hacer admin"}
                              </button>
                            </form>
                          </>
                        )}
                        {user.id === session?.user?.id && (
                          <span className="text-xs text-[#d1d5db]">Vos</span>
                        )}
                      </div>
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
