"use client";

import { useState } from "react";
import { Subscription } from "@/types";
import { AddSubscriptionModal } from "./add-subscription-modal";
import { EditSubscriptionModal } from "./edit-subscription-modal";
import { Plus, RefreshCw, Calendar, ExternalLink, CheckCircle2, Loader2 } from "lucide-react";
import { updateSubscription, markSubscriptionAsPaid, unmarkSubscriptionAsPaid } from "@/lib/actions/subscriptions";
import { cn } from "@/lib/utils";

interface SubscriptionDashboardProps {
  subscriptions: Subscription[];
  userId: string;
  yearlyCost: {
    dailyTotal: number;
    monthlyTotal: number;
    yearlyTotal: number;
    totalFixedYearlyCost: number;
  };
}

export function SubscriptionDashboard({ subscriptions, userId, yearlyCost }: SubscriptionDashboardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Split into cycles
  const dailySubs = subscriptions.filter(s => s.cycle === "daily");
  const monthlySubs = subscriptions.filter(s => s.cycle === "monthly");
  const yearlySubs = subscriptions.filter(s => s.cycle === "yearly");

  function isCyclePaid(sub: Subscription): boolean {
    if (!sub.lastPaidDate) return false;
    const paidDate = new Date(sub.lastPaidDate);
    const now = new Date();
    
    if (sub.cycle === "daily") {
      return paidDate.toDateString() === now.toDateString();
    }
    if (sub.cycle === "monthly") {
      return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
    }
    if (sub.cycle === "yearly") {
      return paidDate.getFullYear() === now.getFullYear();
    }
    return false;
  }

  async function handleTogglePaid(e: React.MouseEvent, sub: Subscription) {
    e.stopPropagation();
    if (updatingId) return;
    
    setUpdatingId(sub.id);
    const currentlyPaid = isCyclePaid(sub);
    
    try {
      if (currentlyPaid) {
        const result = await unmarkSubscriptionAsPaid(sub.id);
        if (!result.success) {
          alert(result.error || "Failed to unmark as paid");
        }
      } else {
        const result = await markSubscriptionAsPaid(sub.id);
        if (!result.success) {
          alert(result.error || "Failed to mark as paid");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(isoString?: string) {
    if (!isoString) return "No date set";
    return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function renderSubCard(sub: Subscription) {
    const isPaid = isCyclePaid(sub);
    const isUpdating = updatingId === sub.id;

    return (
      <div 
        key={sub.id}
        onClick={() => setEditingSub(sub)}
        className="flex flex-col p-5 rounded-2xl border border-border bg-card cursor-pointer hover:shadow-md hover:border-primary/40 transition-all group relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">{sub.name}</h4>
          {sub.url && (
            <a 
              href={sub.url} 
              target="_blank" 
              rel="noreferrer" 
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-primary transition-colors shrink-0"
            >
                <ExternalLink size={16} />
            </a>
          )}
        </div>
        {sub.note && <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{sub.note}</p>}
        
        <div className="mt-auto pt-3 border-t border-border/50 flex justify-between items-end">
          <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Next Bill</p>
              <p className="text-sm font-semibold">{formatDate(sub.nextBillingDate)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-xl font-bold text-rose-600">฿{sub.price.toLocaleString()}</p>
          </div>
        </div>

        {/* Paid Status Toggle Bottom Bar */}
        <div className="mt-4 flex">
           <button
             onClick={(e) => handleTogglePaid(e, sub)}
             disabled={isUpdating}
             className={cn(
               "w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all border",
               isPaid 
                 ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20" 
                 : "bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80",
               isUpdating && "opacity-50 cursor-not-allowed"
             )}
           >
             {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
             {isPaid ? "Paid (Undo)" : "Mark as Paid"}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <RefreshCw className="text-primary" />
            Subscriptions
          </h2>
          <p className="text-muted-foreground">Manage your recurring payments.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold shadow-md hover:opacity-90 transition-all"
        >
          <Plus size={18} />
          Add Subscription
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
           <h3 className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Daily Total</h3>
           <p className="text-2xl lg:text-3xl font-bold text-foreground">฿{yearlyCost.dailyTotal.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
           <h3 className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Monthly Total</h3>
           <p className="text-2xl lg:text-3xl font-bold text-foreground">฿{yearlyCost.monthlyTotal.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
           <h3 className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Yearly Total</h3>
           <p className="text-2xl lg:text-3xl font-bold text-foreground">฿{yearlyCost.yearlyTotal.toLocaleString()}</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 shadow-sm col-span-2 lg:col-span-1">
           <h3 className="text-xs lg:text-sm font-semibold text-primary/80 uppercase tracking-wider mb-2">Total Fixed / Year</h3>
           <p className="text-2xl lg:text-3xl font-bold text-primary">฿{yearlyCost.totalFixedYearlyCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-8">
         {/* Daily Section */}
         {dailySubs.length > 0 && (
           <div className="space-y-4">
             <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar size={18} className="text-muted-foreground" />
                Daily Billing
             </h3>
             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
               {dailySubs.map(renderSubCard)}
             </div>
           </div>
         )}

         {/* Monthly Section */}
         {monthlySubs.length > 0 && (
           <div className="space-y-4">
             <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar size={18} className="text-muted-foreground" />
                Monthly Billing
             </h3>
             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
               {monthlySubs.map(renderSubCard)}
             </div>
           </div>
         )}
         
         {/* Yearly Section */}
         {yearlySubs.length > 0 && (
           <div className="space-y-4">
             <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar size={18} className="text-muted-foreground" />
                Yearly Billing
             </h3>
             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
               {yearlySubs.map(renderSubCard)}
             </div>
           </div>
         )}

         {subscriptions.length === 0 && (
            <div 
              onClick={() => setShowAddModal(true)}
              className="w-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-8 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer min-h-[200px]"
            >
               <RefreshCw size={32} className="mb-2 opacity-30" />
               <span className="font-medium">No Subscriptions added</span>
               <span className="text-xs">Click to add your recurring payments</span>
            </div>
         )}
      </div>

      {/* FAB for Mobile */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center sm:hidden hover:scale-110 active:scale-90 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      <AddSubscriptionModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        userId={userId}
      />

      {editingSub && (
        <EditSubscriptionModal
          subscription={editingSub}
          isOpen={true}
          onClose={() => setEditingSub(null)}
        />
      )}
    </div>
  );
}
