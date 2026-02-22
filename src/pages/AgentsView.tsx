import { motion } from 'motion/react';
import { TrendingUp, BrainCircuit, Zap, Bot } from 'lucide-react';

const agents = [
  { name: 'Financial analyst', status: 'Active', desc: 'Analyzing burn rate and unit economics.', icon: TrendingUp },
  { name: 'CFO agent', status: 'Active', desc: 'Optimizing runway and hiring plans.', icon: BrainCircuit },
  { name: 'Forecasting agent', status: 'Idle', desc: 'Predicting future financial outcomes.', icon: Zap },
];

export default function AgentsView({ agentLogs }: { agentLogs: any[] }) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agents.map((agent, i) => {
          const Icon = agent.icon;
          return (
            <motion.div 
              key={agent.name}
              className="glass-card p-8 group hover:border-gray-300"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-start mb-6">
                <motion.div 
                  className="p-3.5 bg-[#111827] rounded-2xl shadow-lg shadow-indigo-900/10"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="text-white" size={24} />
                </motion.div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                  {agent.status}
                </span>
              </div>
              <h3 className="font-display font-bold text-xl tracking-tight">{agent.name}</h3>
              <p className="text-sm text-gray-500 mt-3 font-light leading-relaxed">{agent.desc}</p>
              <motion.button 
                className="w-full mt-8 btn-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View activity
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        className="glass-card p-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-display font-bold text-xl mb-8 tracking-tight">Recent agent activity</h3>
        <div className="space-y-2">
          {agentLogs.map((log: any, i: number) => (
            <motion.div 
              key={i} 
              className="flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl transition-colors group cursor-default"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.03 }}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-5">
                <motion.div 
                  className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors"
                  whileHover={{ scale: 1.08 }}
                >
                  <Bot size={22} className="text-gray-400" />
                </motion.div>
                <div>
                  <p className="text-sm font-bold tracking-tight">{log.agent_name}</p>
                  <p className="text-xs text-gray-400 font-medium">{log.action}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 max-w-md truncate font-light">{log.recommendation}</p>
                <p className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-widest">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
