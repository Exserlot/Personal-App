export const dynamic = "force-dynamic";

import { getSubscriptions, getYearlySubscriptionCost } from "@/lib/actions/subscriptions";
import { SubscriptionDashboard } from "@/components/subscriptions/subscription-dashboard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SubscriptionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const subscriptions = await getSubscriptions();
  const yearlyCost = await getYearlySubscriptionCost();

  return (
    <div className="">
      <SubscriptionDashboard 
        subscriptions={subscriptions}
        userId={session.user.id}
        yearlyCost={yearlyCost}
      />
    </div>
  );
}
