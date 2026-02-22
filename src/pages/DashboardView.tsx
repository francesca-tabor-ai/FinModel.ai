import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, AlertCircle, Zap, BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';
import type { FinancialMetric, HealthScoreResult } from '../services/geminiService';
import { HealthScoreCard } from '../components/HealthScoreCard';

const StatCard = ({ label, value, trend, trendValue, icon: Icon, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.99 }}
    className="glass-card p-8 flex flex-col justify-between h-full group hover:border-gray-300 cursor-default"
  >
    <div className="flex justify-between items-start">
      <motion.div 
        className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon size={20} className="text-[#111827]" />
      </motion.div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full",
          trend === 'up' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
        )}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="mt-6">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{label}</p>
      <h3 className="text-3xl font-display font-bold mt-1.5 tracking-tight">{value}</h3>
    </div>
  </motion.div>
);

export default function DashboardView({ 
  financials, 
  insights,
  healthScore 
}: { 
  financials: FinancialMetric[]; 
  insights: { insights: string[]; recommendations: { title: string; description: string }[] } | null;
  healthScore?: HealthScoreResult | null;
}) {
  const latestCash = financials[financials.length - 1]?.cash_on_hand || 0;
  const latestBurn = financials[financials.length - 1] ? financials[financials.length - 1].expenses - financials[financials.length - 1].revenue : 0;
  const runway = latestBurn > 0 ? (latestCash / latestBurn).toFixed(1) : '∞';

  return (
    <div className="space-y-8">
      <HealthScoreCard result={healthScore ?? null} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Cash on Hand" value={`$${latestCash.toLocaleString()}`} trend="up" trendValue="12%" icon={TrendingUp} index={0} />
        <StatCard label="Monthly Burn" value={`$${latestBurn.toLocaleString()}`} trend="down" trendValue="4%" icon={AlertCircle} index={1} />
        <StatCard label="Runway" value={`${runway} Months`} trend="up" trendValue="2.1m" icon={Zap} index={2} />
        <StatCard label="Revenue (MRR)" value={`$${financials[financials.length - 1]?.revenue.toLocaleString()}`} trend="up" trendValue="18%" icon={TrendingUp} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          className="lg:col-span-2 glass-card p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-display font-bold text-xl tracking-tight">Cash flow trajectory</h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#111827] rounded-full" /> Revenue</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 bg-gray-200 rounded-full" /> Expenses</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financials}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }} tickFormatter={(v) => `$${v/1000}k`} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F3F4F6', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.05)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#E5E7EB" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-8 bg-[#111827] text-white border-none shadow-xl shadow-indigo-900/10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/10 rounded-lg">
              <BrainCircuit size={20} className="text-indigo-400" />
            </div>
            <h3 className="font-display font-bold text-xl tracking-tight">AI financial insights</h3>
          </div>
          <div className="space-y-6">
            {insights?.insights.map((insight: string, i: number) => (
              <motion.div 
                key={i} 
                className="flex gap-4"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
              >
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                <p className="text-sm text-gray-300 leading-relaxed font-light">{insight}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 pt-8 border-t border-white/5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">Strategic recommendations</p>
            <div className="space-y-4">
              {insights?.recommendations.map((rec: any, i: number) => (
                <motion.div 
                  key={i} 
                  className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold tracking-tight">{rec.title}</h4>
                    <ArrowUpRight size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 font-light leading-relaxed">{rec.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
