export const dynamic = "force-dynamic";

import { getTasks, getHabits } from "@/lib/actions/productivity";
import { getUserStats } from "@/lib/actions/gamification";
import { ProductivityDashboard } from "@/components/productivity/productivity-dashboard";

export default async function ProductivityPage() {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  
  const [tasks, habits, stats] = await Promise.all([
    getTasks(today),
    getHabits(),
    getUserStats()
  ]);

  return (
    <div className="">
      <ProductivityDashboard 
        tasks={tasks}
        habits={habits}
        today={today}
        stats={stats}
      />
    </div>
  );
}
