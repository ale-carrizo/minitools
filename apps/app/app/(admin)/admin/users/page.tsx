import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { suspendUser, unsuspendUser, makeAdmin, removeAdmin } from "./actions";
import PromoteForm from "./promote-form";
import CreateUserForm from "./create-user-form";

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { subscription: true },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-white tracking-[-0.03em]">Usuarios</h1>
        <p className="text-white/40 text-sm mt-1">
          {users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      <CreateUserForm />

      <PromoteForm />

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-6 py-3.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Usuario</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Rol</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Plan</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Registro</th>
                <th className="text-right px-6 py-3.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/25 text-sm">No hay usuarios todavía.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#5448EE] flex items-center justify-center text-white btn-solid-text text-[10px] font-semibold flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() ?? user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white/80">{user.name ?? "—"}</p>
                          <p className="text-xs text-white/30">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${user.role === "ADMIN" ? "bg-[#5448EE]/15 text-[#8880F5]" : "bg-white/[0.06] text-white/30"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-white/40 text-xs">
                      {user.subscription ? `${user.subscription.plan === "ANNUAL" ? "Anual" : "Mensual"} · $${user.subscription.priceMonthly}/mes` : <span className="text-white/20">Sin plan</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        user.suspended ? "bg-red-500/15 text-red-400"
                        : user.subscription?.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400"
                        : user.subscription?.status === "TRIAL" ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-white/[0.06] text-white/30"
                      }`}>
                        {user.suspended ? "Suspendido" : user.subscription ? (user.subscription.status === "ACTIVE" ? "Activo" : user.subscription.status === "TRIAL" ? "En prueba" : user.subscription.status) : "Sin plan"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-white/25">
                      {new Date(user.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.id !== session?.user?.id ? (
                          <>
                            <form action={user.suspended ? unsuspendUser.bind(null, user.id) : suspendUser.bind(null, user.id)}>
                              <button type="submit" className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${user.suspended ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" : "bg-red-500/15 text-red-400 hover:bg-red-500/25"}`}>
                                {user.suspended ? "Reactivar" : "Suspender"}
                              </button>
                            </form>
                            <form action={user.role === "ADMIN" ? removeAdmin.bind(null, user.id) : makeAdmin.bind(null, user.id)}>
                              <button type="submit" className="text-xs px-3 py-1.5 rounded-lg font-medium bg-white/[0.06] text-white/40 hover:bg-white/[0.10] hover:text-white/70 transition-colors">
                                {user.role === "ADMIN" ? "Quitar admin" : "Hacer admin"}
                              </button>
                            </form>
                          </>
                        ) : (
                          <span className="text-xs text-white/20">Vos</span>
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
