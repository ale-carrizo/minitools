import { auth } from "@/auth";
import DashboardShell from "@/app/components/DashboardShell";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fire-and-forget, throttled a la DB: solo pisa lastActiveAt si pasaron >2 min desde el último update.
  if (session.user.id) {
    prisma.user
      .updateMany({
        where: {
          id: session.user.id,
          OR: [{ lastActiveAt: null }, { lastActiveAt: { lt: new Date(Date.now() - 2 * 60 * 1000) } }],
        },
        data: { lastActiveAt: new Date() },
      })
      .catch(() => {});
  }

  return (
    <DashboardShell user={{ name: session.user.name, email: session.user.email, role: session.user.role }}>
      {children}
    </DashboardShell>
  );
}
