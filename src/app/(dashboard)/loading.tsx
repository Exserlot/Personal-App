export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-4 w-96 bg-muted rounded-lg" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-4">
         {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-border bg-card/50" />
         ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3 h-96">
         <div className="lg:col-span-2 rounded-xl border border-border bg-card/50" />
         <div className="rounded-xl border border-border bg-card/50" />
      </div>
    </div>
  );
}
