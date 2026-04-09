export const dynamic = "force-dynamic";

import { getInvestments, getInvestmentSummary } from "@/lib/actions/investments";
import { InvestmentDashboard } from "@/components/investments/investment-dashboard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function InvestmentsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const investments = await getInvestments();
  const summary = await getInvestmentSummary();

  return (
    <div className="">
      <InvestmentDashboard 
        investments={investments}
        userId={session.user.id}
        summary={summary}
      />
    </div>
  );
}
