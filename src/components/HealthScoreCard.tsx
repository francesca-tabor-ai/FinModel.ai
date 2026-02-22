import { motion } from 'motion/react';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { HealthScoreResult } from '../services/geminiService';
import { cn } from '../lib/utils';

const gradeColors: Record<string, string> = {
  A: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  B: 'text-blue-600 bg-blue-50 border-blue-200',
  C: 'text-amber-600 bg-amber-50 border-amber-200',
  D: 'text-orange-600 bg-orange-50 border-orange-200',
  F: 'text-rose-600 bg-rose-50 border-rose-200',
};

interface HealthScoreCardProps {
  result: HealthScoreResult | null;
}

export function HealthScoreCard({ result }: HealthScoreCardProps) {
  if (!result) return null;

  const { score, grade, trend, breakdown, summary } = result;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-card p-8 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center md:items-start shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#111827]/5 rounded-xl">
              <Activity size={20} className="text-[#111827]" />
            </div>
            <h3 className="font-display font-bold text-lg tracking-tight">Financial Health</h3>
          </div>

          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#F3F4F6"
                strokeWidth="10"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                className={cn('stroke-[length:339.292]', `stroke-[url(#healthGrad)]`)}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
              <defs>
                <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={score >= 65 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'} />
                  <stop offset="100%" stopColor={score >= 65 ? '#059669' : score >= 50 ? '#EA580C' : '#DC2626'} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-display font-bold tracking-tight"
              >
                {score}
              </motion.span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ 100</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <span
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-bold border',
                gradeColors[grade] || gradeColors.F
              )}
            >
              Grade {grade}
            </span>
            {trend === 'up' && (
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                <TrendingUp size={14} /> Improving
              </span>
            )}
            {trend === 'down' && (
              <span className="flex items-center gap-1 text-rose-600 text-xs font-semibold">
                <TrendingDown size={14} /> Declining
              </span>
            )}
            {trend === 'stable' && (
              <span className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
                <Minus size={14} /> Stable
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 leading-relaxed mb-6">{summary}</p>
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Score breakdown</p>
            {breakdown.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="group"
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-[#111827]">{item.label}</span>
                  <span className="text-xs font-semibold text-gray-500">{item.score}/100</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      item.score >= 70 ? 'bg-emerald-500' :
                      item.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-light">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
