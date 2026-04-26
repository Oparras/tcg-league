import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getDashboardData } from "@/features/dashboard/queries";
import { requireUserSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const session = await requireUserSession();
  const data = await getDashboardData(session.user.id);

  return (
    <DashboardOverview
      data={data}
      userId={session.user.id}
      userRole={session.user.role}
    />
  );
}
