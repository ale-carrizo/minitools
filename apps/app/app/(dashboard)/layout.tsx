import { auth } from "@/auth";
import DashboardShell from "@/app/components/DashboardShell";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <DashboardShell user={{ name: session.user.name, email: session.user.email, role: session.user.role }}>
      {children}
    </DashboardShell>
  );
}
