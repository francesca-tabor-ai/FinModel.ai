import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import type { FinancialMetric } from '../services/geminiService';

export default function ModelView({ financials }: { financials: FinancialMetric[] }) {
  return (
    <div className="space-y-10">
      <motion.div 
        className="glass-card overflow-hidden border-none shadow-xl shadow-gray-200/50"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-display font-bold text-xl tracking-tight">Income statement (Pro-forma)</h3>
          <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
            <motion.button 
              className="px-4 py-1.5 bg-white text-[#111827] text-xs font-bold rounded-lg shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Monthly
            </motion.button>
            <motion.button 
              className="px-4 py-1.5 text-gray-400 text-xs font-bold rounded-lg hover:text-gray-600"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Quarterly
            </motion.button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Line item</th>
                {financials.map(f => (
                  <th key={f.month} className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] text-right">{f.month}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {['Total revenue', 'Total expenses', 'Net income (Burn)', 'Cash on hand'].map((rowLabel, rowIndex) => (
                <motion.tr 
                  key={rowLabel}
                  className={cn(
                    "hover:bg-gray-50/50 transition-colors",
                    rowLabel === 'Net income (Burn)' && "bg-gray-50/50"
                  )}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + rowIndex * 0.03 }}
                >
                  <td className="px-8 py-5 text-sm font-semibold">{rowLabel}</td>
                  {financials.map(f => (
                    <td key={f.month} className={cn(
                      "px-8 py-5 text-sm text-right font-mono font-medium",
                      rowLabel === 'Total expenses' && "text-rose-500",
                      rowLabel === 'Net income (Burn)' && ((f.revenue - f.expenses) >= 0 ? "text-emerald-600" : "text-rose-600"),
                      rowLabel === 'Net income (Burn)' && "font-bold"
                    )}>
                      {rowLabel === 'Total revenue' && `$${f.revenue.toLocaleString()}`}
                      {rowLabel === 'Total expenses' && `(${f.expenses.toLocaleString()})`}
                      {rowLabel === 'Net income (Burn)' && `$${(f.revenue - f.expenses).toLocaleString()}`}
                      {rowLabel === 'Cash on hand' && `$${f.cash_on_hand.toLocaleString()}`}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <motion.div 
          className="glass-card p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h4 className="font-display font-bold text-lg mb-6 tracking-tight">Unit economics</h4>
          <div className="space-y-4">
            {[
              { label: 'LTV (Lifetime Value)', value: '$1,240', status: 'Healthy' },
              { label: 'CAC (Acquisition Cost)', value: '$320', status: 'Warning' },
              { label: 'LTV/CAC Ratio', value: '3.8x', status: 'Healthy' },
              { label: 'Payback Period', value: '4.2 Months', status: 'Healthy' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                <div className="text-right">
                  <p className="text-sm font-bold tracking-tight">{item.value}</p>
                  <p className={cn(
                    "text-[9px] font-bold uppercase tracking-widest mt-0.5",
                    item.status === 'Healthy' ? "text-emerald-500" : "text-amber-500"
                  )}>{item.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div 
          className="glass-card p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="font-display font-bold text-lg mb-6 tracking-tight">Burn analysis</h4>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financials}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#00000005' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey={(f: FinancialMetric) => f.expenses - f.revenue} fill="#111827" radius={[6, 6, 0, 0]} name="Net burn" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
