import { prisma } from "@/lib/prisma";

const invoiceStatusBadge: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-600",
};

const invoiceStatusLabel: Record<string, string> = {
  paid: "Pagada",
  pending: "Pendiente",
  failed: "Fallida",
};

export default async function AdminBillingPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: {
        include: { user: true },
      },
    },
  });

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((acc, i) => acc + i.amount, 0);

  const totalPending = invoices
    .filter((i) => i.status === "pending")
    .reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1a2e]">Facturación</h1>
        <p className="text-[#6b7280] text-sm mt-1">
          {invoices.length} factura{invoices.length !== 1 ? "s" : ""} en total
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
          <p className="text-xs text-[#6b7280] mb-2">Total cobrado</p>
          <p className="text-2xl font-semibold text-[#1a1a2e]">${totalPaid.toFixed(2)}</p>
          <p className="text-[11px] text-green-600 mt-0.5">{invoices.filter((i) => i.status === "paid").length} facturas pagas</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
          <p className="text-xs text-[#6b7280] mb-2">Pendiente de cobro</p>
          <p className="text-2xl font-semibold text-[#1a1a2e]">${totalPending.toFixed(2)}</p>
          <p className="text-[11px] text-yellow-600 mt-0.5">{invoices.filter((i) => i.status === "pending").length} facturas pendientes</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
          <p className="text-xs text-[#6b7280] mb-2">Fallidas</p>
          <p className="text-2xl font-semibold text-[#1a1a2e]">
            {invoices.filter((i) => i.status === "failed").length}
          </p>
          <p className="text-[11px] text-red-500 mt-0.5">requieren atención</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f3f4f6]">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Factura</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Usuario</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Descripción</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Monto</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Vencimiento</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9fafb]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#9ca3af] text-sm">
                    No hay facturas todavía.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice, i) => (
                  <tr key={invoice.id} className="hover:bg-[#fafafa]">
                    <td className="px-6 py-4 font-mono text-xs text-[#9ca3af]">
                      #{String(i + 1).padStart(4, "0")}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-[#1a1a2e]">{invoice.subscription.user.name ?? "—"}</p>
                      <p className="text-xs text-[#9ca3af]">{invoice.subscription.user.email}</p>
                    </td>
                    <td className="px-4 py-4 text-[#6b7280] text-xs">
                      {invoice.description ?? `Plan ${invoice.subscription.plan === "ANNUAL" ? "Anual" : "Mensual"}`}
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#1a1a2e]">
                      ${invoice.amount.toFixed(2)} {invoice.currency}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${invoiceStatusBadge[invoice.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {invoiceStatusLabel[invoice.status] ?? invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-[#9ca3af]">
                      {new Date(invoice.dueDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-4 text-xs text-[#9ca3af]">
                      {invoice.paidAt
                        ? new Date(invoice.paidAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
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
