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
          Tus herramientas de negocio — MVP v1.0
        </p>
      </div>

      <StorageWidget />

      <DashboardToolsGrid />
    </div>
  );
}
