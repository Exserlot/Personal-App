"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Transaction, Category } from "@/types";

interface ExpensePieChartProps {
  transactions: Transaction[];
  categories: Category[];
}

export function ExpensePieChart({ transactions, categories }: ExpensePieChartProps) {
  const data = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const categoryTotals: Record<string, number> = {};

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (t.type === "expense" && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (!categoryTotals[t.categoryId]) {
          categoryTotals[t.categoryId] = 0;
        }
        categoryTotals[t.categoryId] += t.amount;
      }
    });

    const result = Object.keys(categoryTotals).map(categoryId => {
      const category = categories.find(c => c.id === categoryId);
      return {
        name: category?.name || "Unknown",
        value: categoryTotals[categoryId],
        color: category?.color || "#94a3b8",
      };
    }).sort((a, b) => b.value - a.value);

    return result;
  }, [transactions, categories]);

  if (data.length === 0) {
    return (
      <div className="rounded-3xl border border-white/20 dark:border-white/5 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-6 shadow-lg h-80 flex items-center justify-center">
        <p className="text-muted-foreground">No expense data for this month</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-white/20 dark:border-white/5 p-3 rounded-xl shadow-xl">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-rose-500 font-bold">฿{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl border border-white/20 dark:border-white/5 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-6 shadow-lg hover:-translate-y-1 transition-all duration-300">
      <h3 className="text-lg font-bold mb-4">Expense Allocation (Current Month)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
               verticalAlign="bottom" 
               height={36} 
               iconType="circle"
               formatter={(value, entry: any) => (
                <span className="text-sm font-medium text-foreground">{value}</span>
               )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
