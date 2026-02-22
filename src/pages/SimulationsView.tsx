import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { Play, Loader2, CheckCircle2 } from 'lucide-react';

export default function SimulationsView({
  decisionInput,
  setDecisionInput,
  handleSimulate,
  simulating,
  simulationResult
}: {
  decisionInput: string;
  setDecisionInput: (v: string) => void;
  handleSimulate: () => void;
  simulating: boolean;
  simulationResult: {
    summary: string;
    impacts: { runway: string; revenue: string; profitability: string };
    simulations?: { scenario: string; runway_impact: number; revenue_impact: number }[];
  } | null;
}) {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <motion.div 
        className="glass-card p-10 border-none shadow-2xl shadow-gray-200/50"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-2xl font-display font-bold mb-3 tracking-tight">Outcome prediction engine</h3>
        <p className="text-gray-500 text-base mb-8 font-light">Simulate the impact of hiring, pricing changes, or funding rounds before you act.</p>
        
        <div className="relative">
          <textarea
            value={decisionInput}
            onChange={(e) => setDecisionInput(e.target.value)}
            placeholder="e.g., What happens if we hire 3 senior engineers and increase marketing spend by 20% next month?"
            className="w-full h-40 p-6 bg-gray-50/50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-[#111827] focus:border-transparent outline-none transition-all resize-none text-base font-light leading-relaxed hover:border-gray-200"
          />
          <motion.button
            onClick={handleSimulate}
            disabled={simulating || !decisionInput}
            className="absolute bottom-6 right-6 btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {simulating ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
            Run simulation
          </motion.button>
        </div>
      </motion.div>

      {simulationResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div 
            className="md:col-span-3 glass-card p-8 bg-emerald-50/50 border-emerald-100/50"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="text-emerald-600" size={22} />
              <h4 className="font-display font-bold text-lg text-emerald-900 tracking-tight">Simulation complete</h4>
            </div>
            <p className="text-base text-emerald-800 font-light leading-relaxed">{simulationResult.summary}</p>
          </motion.div>

          {['runway', 'revenue', 'profitability'].map((key, i) => (
            <motion.div 
              key={key}
              className="glass-card p-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                {key === 'runway' ? 'Runway impact' : key === 'revenue' ? 'Revenue impact' : 'Profitability'}
              </p>
              <h4 className="text-2xl font-display font-bold tracking-tight">
                {simulationResult.impacts[key as keyof typeof simulationResult.impacts]}
              </h4>
            </motion.div>
          ))}

          <motion.div 
            className="md:col-span-3 glass-card p-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h4 className="font-display font-bold text-lg mb-8 tracking-tight">Probabilistic scenarios</h4>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulationResult.simulations}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
                  <XAxis dataKey="scenario" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <Tooltip cursor={{ fill: '#00000005' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.05)' }} />
                  <Bar dataKey="runway_impact" fill="#111827" radius={[6, 6, 0, 0]} name="Runway (Months)" />
                  <Bar dataKey="revenue_impact" fill="#E5E7EB" radius={[6, 6, 0, 0]} name="Revenue change (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
