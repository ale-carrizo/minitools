import { auth } from "@/auth";
import DashboardToolsGrid from "@/app/components/DashboardToolsGrid";
import StorageWidget from "@/app/components/StorageWidget";

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Usuario";
  const hour = parseInt(
    new Date().toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "numeric",
      hour12: false,
    }),
    10
  );
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <h1 className="font-display text-[30px] font-semibold tracking-[-0.035em]">
          <span className="text-white">{greeting}, </span>
          <span className="text-gradient">{firstName}</span>
          <span className="text-white"> 👋</span>
        </h1>
        <p className="text-white/40 text-sm mt-1.5">
          Tu espacio Zimple. Podés usar una sola app o combinar varias según lo que necesites.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-[#5448EE]/20 bg-[#5448EE]/8 px-5 py-4 animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_0.04s_both]">
        <p className="text-sm font-medium text-white/85">No hace falta usar todo</p>
        <p className="mt-1 text-[13px] leading-relaxed text-white/45">
          Zimple funciona mejor cuando arrancás por una necesidad concreta. Elegí la app que te resuelve el problema de hoy y sumá otras solo si después te aportan valor.
        </p>
      </div>

      <StorageWidget />

      <DashboardToolsGrid />
    </div>
  );
}
