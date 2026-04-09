export const dynamic = "force-dynamic";

import { getGoals } from "@/lib/actions/goals";
import { GoalDashboard } from "@/components/goals/goal-dashboard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const goals = await getGoals();

  return (
    <div className="">
      <GoalDashboard 
        goals={goals}
        userId={session.user.id}
      />
    </div>
  );
}
