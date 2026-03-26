import { getWallets, getTransactions, getCategories, getFinanceSummary, getCashFlow } from "@/lib/actions/finance";
import { getTasks } from "@/lib/actions/productivity";
import { getWishlist } from "@/lib/actions/wishlist";
import { getSubscriptions } from "@/lib/actions/subscriptions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { UpcomingBills } from "@/components/dashboard/upcoming-bills";
import { WalletWidget } from "@/components/dashboard/wallet-widget";
import { TransactionWidget } from "@/components/dashboard/transaction-widget";
import { TodoWidget } from "@/components/dashboard/todo-widget";
import { WishlistWidget } from "@/components/dashboard/wishlist-widget";
import { LayoutDashboard } from "lucide-react";

export default async function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];
  
  // Fetch all data in parallel
  const [
    wallets, 
    transactions, 
    categories, 
    tasks, 
    wishlistItems,
    summary,
    cashFlow,
    subscriptions
  ] = await Promise.all([
    getWallets(),
    getTransactions(),
    getCategories(),
    getTasks(today),
    getWishlist(),
    getFinanceSummary(),
    getCashFlow(6),
    getSubscriptions()
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your overview.</p>
      </div>

      {/* Level 1: Summary Cards */}
      <SummaryCards 
        totalBalance={summary.totalBalance}
        monthlyIncome={summary.totalIncome}
        monthlyExpense={summary.totalExpense}
        activeSubscriptionsCount={subscriptions.length}
      />

      {/* Level 2: Charts and Upcoming */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashFlowChart data={cashFlow} />
        </div>
        <div>
          <UpcomingBills subscriptions={subscriptions} />
        </div>
      </div>

      {/* Level 3: Existing Widgets */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Spans 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wallet Widget */}
          <WalletWidget wallets={wallets} />
          
          {/* Transaction Widget */}
          <TransactionWidget 
            transactions={transactions} 
            categories={categories} 
            wallets={wallets} 
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Todo Widget */}
          <TodoWidget tasks={tasks} />
          
          {/* Wishlist Widget */}
          <WishlistWidget items={wishlistItems} />
        </div>
      </div>
    </div>
  );
}
