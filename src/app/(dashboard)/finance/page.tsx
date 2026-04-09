export const dynamic = "force-dynamic";

import { FinanceDashboard } from "@/components/finance/finance-dashboard";
import {
  getWallets,
  getTransactions,
  getCategories,
  getFinanceSummary,
  getSlips
} from "@/lib/actions/finance";

export default async function FinancePage() {
  const [wallets, transactions, categories, summary, slips] = await Promise.all([
    getWallets(),
    getTransactions(),
    getCategories(),
    getFinanceSummary(),
    getSlips(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance Overview</h1>
        <p className="text-muted-foreground">Manage your wealth, expenses, and income.</p>
      </div>

      <FinanceDashboard
        wallets={wallets}
        transactions={transactions}
        categories={categories}
        summary={summary}
        slips={slips}
      />
    </div>
  );
}
