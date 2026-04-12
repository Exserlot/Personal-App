"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowLeftRight } from "lucide-react";

interface CashFlowChartProps {
  data: {
    name: string;
    income: number;
    expense: number;
  }[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-8 shadow-lg flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <ArrowLeftRight className="text-primary" size={20} />
        <h3 className="font-bold text-lg">Cash Flow (Last 6 Months)</h3>
      </div>
      
      <div className="h-[300px] w-full mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickFormatter={(value) => `฿${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
            />
            <Tooltip 
              cursor={{ fill: "var(--secondary)" }}
              contentStyle={{ 
                backgroundColor: "var(--card)", 
                borderColor: "var(--border)",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
              }}
              labelStyle={{ color: "var(--foreground)", fontWeight: "bold", marginBottom: "4px" }}
              formatter={(value: any) => [`฿${new Intl.NumberFormat("th-TH").format(value)}`, undefined]}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <Bar 
              dataKey="income" 
              name="Income" 
              fill="#22c55e" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={40}
            />
            <Bar 
              dataKey="expense" 
              name="Expense" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
