"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Transaction } from "@/types";

interface CashFlowChartProps {
  transactions: Transaction[];
}

export function CashFlowChart({ transactions }: CashFlowChartProps) {
  const data = useMemo(() => {
    const months = 6;
    const now = new Date();
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleString('en-US', { month: 'short' });
      const yearStr = d.getFullYear().toString().slice(-2); 
      
      let income = 0;
      let expense = 0;

      transactions.forEach(t => {
        const txDate = new Date(t.date);
        if (txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear()) {
          if (t.type === "income") income += t.amount;
          else if (t.type === "expense") expense += t.amount;
        }
      });

      result.push({
        name: `${monthStr} '${yearStr}`,
        Income: income,
        Expense: expense
      });
    }

    return result;
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-white/20 dark:border-white/5 p-3 rounded-xl shadow-xl">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((p: any, index: number) => (
             <p key={index} className={`font-bold ${p.dataKey === 'Income' ? 'text-emerald-500' : 'text-rose-500'}`}>
               {p.dataKey}: ฿{p.value.toLocaleString()}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl border border-white/20 dark:border-white/5 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-6 shadow-lg hover:-translate-y-1 transition-all duration-300">
      <h3 className="text-lg font-bold mb-4">Cash Flow Overview (Last 6 Months)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.7 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.7 }}
              tickFormatter={(value) => value > 0 ? `${value / 1000}k` : '0'}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
            <Legend 
               verticalAlign="top" 
               align="right"
               iconType="circle"
               wrapperStyle={{ paddingBottom: '20px' }}
            />
            <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
