import { prisma } from "@/lib/prisma";

const invoiceStyle: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-yellow-500/15 text-yellow-400",
  failed: "bg-red-500/15 text-red-400",
};
const invoiceLabel: Record<string, string> = { paid: "Pagada", pending: "Pendiente", failed: "Fallida" };

export default async function AdminBillingPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { subscription: { include: { user: true } } },
  });

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((acc, i) => acc + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === "pending").reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-white tracking-[-0.03em]">Facturación</h1>
        <p className="text-white/40 text-sm mt-1">{invoices.length} factura{invoices.length !== 1 ? "s" : ""} en total</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <p className="text-xs text-white/40 mb-2">Total cobrado</p>
          <p className="text-2xl font-semibold text-white tracking-[-0.02em]">${totalPaid.toFixed(2)}</p>
          <p className="text-[11px] text-emerald-400 mt-0.5">{invoices.filter((i) => i.status === "paid").length} facturas pagas</p>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <p className="text-xs text-white/40 mb-2">Pendiente de cobro</p>
          <p className="text-2xl font-semibold text-white tracking-[-0.02em]">${totalPending.toFixed(2)}</p>
          <p className="text-[11px] text-yellow-400 mt-0.5">{invoices.filter((i) => i.status === "pending").length} pendientes</p>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <p className="text-xs text-white/40 mb-2">Fallidas</p>
          <p className="text-2xl font-semibold text-white tracking-[-0.02em]">{invoices.filter((i) => i.status === "failed").length}</p>
          <p className="text-[11px] text-red-400 mt-0.5">requieren atención</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["#", "Usuario", "Descripción", "Monto", "Estado", "Vence", "Pago"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {invoices.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-white/25 text-sm">No hay facturas todavía.</td></tr>
              ) : invoices.map((inv, i) => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-white/25">#{String(i + 1).padStart(4, "0")}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-white/80">{inv.subscription.user.name ?? "—"}</p>
                    <p className="text-xs text-white/30">{inv.subscription.user.email}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-white/40">{inv.description ?? `Plan ${inv.subscription.plan === "ANNUAL" ? "Anual" : "Mensual"}`}</td>
                  <td className="px-5 py-4 font-semibold text-white/80">${inv.amount.toFixed(2)} {inv.currency}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${invoiceStyle[inv.status] ?? "bg-white/[0.06] text-white/30"}`}>
                      {invoiceLabel[inv.status] ?? inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-white/30">{new Date(inv.dueDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td className="px-5 py-4 text-xs text-white/30">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
