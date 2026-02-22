import { motion } from 'motion/react';
import { History } from 'lucide-react';
import { cn } from '../lib/utils';

type DecisionRow = { id: number; timestamp: string; decision_text: string; context?: string | null; expected_outcome?: string | null; actual_outcome?: string | null; status: string };

export default function HistoryView({ decisions, agentLogs }: { decisions: DecisionRow[]; agentLogs: any[] }) {
  const simulationLogs = agentLogs.filter((l: any) => l.action === 'Decision Simulation');

  return (
    <div className="space-y-8">
      <motion.div 
        className="glass-card overflow-hidden border-none shadow-xl shadow-gray-200/50"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-8 border-b border-gray-50">
          <h3 className="font-display font-bold text-xl tracking-tight">Decision log</h3>
          <p className="text-gray-500 text-sm mt-1 font-light">Track strategic decisions and their status.</p>
        </div>
        <div className="overflow-x-auto">
          {decisions.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm font-light">No decisions recorded yet. Run a simulation or add a decision to see them here.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Decision</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Expected impact</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {decisions.map((d, i) => (
                  <motion.tr 
                    key={d.id} 
                    className="hover:bg-gray-50/50 transition-colors"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                  >
                    <td className="px-8 py-5 text-sm font-medium">{d.decision_text}</td>
                    <td className="px-8 py-5 text-sm text-gray-500">{d.expected_outcome ?? '—'}</td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        d.status === 'implemented' && "bg-emerald-50 text-emerald-600",
                        d.status === 'pending' && "bg-amber-50 text-amber-600",
                        d.status === 'rejected' && "bg-rose-50 text-rose-600",
                        !['implemented', 'pending', 'rejected'].includes(d.status) && "bg-gray-100 text-gray-600"
                      )}>
                        {d.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500 text-right">{new Date(d.timestamp).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      <motion.div 
        className="glass-card p-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="font-display font-bold text-2xl mb-10 tracking-tight">Decision intelligence log</h3>
        <p className="text-gray-500 text-sm -mt-6 mb-6 font-light">Simulations run by the forecasting agent.</p>
        <div className="space-y-4">
          {simulationLogs.map((log: any, i: number) => (
            <motion.div 
              key={i} 
              className="p-6 border border-gray-50 rounded-3xl hover:bg-gray-50 transition-all group cursor-default"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
              whileHover={{ scale: 1.005, x: 4 }}
              whileTap={{ scale: 0.998 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <History size={16} className="text-gray-400" />
                  </motion.div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  log.impact_score > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  Impact: {log.impact_score > 0 ? '+' : ''}{log.impact_score} months
                </div>
              </div>
              <h4 className="text-lg font-display font-bold tracking-tight mb-2">{log.recommendation.replace('Simulated: ', '')}</h4>
              <p className="text-sm text-gray-500 font-light">Simulated by {log.agent_name}</p>
            </motion.div>
          ))}
          {simulationLogs.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <History size={32} className="text-gray-200" />
              </motion.div>
              <p className="text-gray-400 text-base font-light">No decisions logged yet. Run a simulation to start tracking.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
