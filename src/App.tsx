/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BrainCircuit, 
  Zap, 
  History, 
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  Play,
  Plus,
  Bot,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService, FinancialMetric } from './services/geminiService';
import { cn } from './lib/utils';
import { API } from './lib/api';
import { ChatWidget } from './components/ChatWidget';

type DecisionRow = { id: number; timestamp: string; decision_text: string; context?: string | null; expected_outcome?: string | null; actual_outcome?: string | null; status: string };

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "sidebar-link",
      active 
        ? "bg-[#111827] text-white shadow-lg shadow-black/10" 
        : "text-gray-500 hover:bg-gray-50 hover:text-[#111827]"
    )}
  >
    <Icon size={18} />
    {label}
  </button>
);

const StatCard = ({ label, value, trend, trendValue, icon: Icon }: any) => (
  <div className="glass-card p-8 flex flex-col justify-between h-full group hover:border-gray-300">
    <div className="flex justify-between items-start">
      <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
        <Icon size={20} className="text-[#111827]" />
      </div>
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
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [financials, setFinancials] = useState<FinancialMetric[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [decisionInput, setDecisionInput] = useState('');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [agentLogs, setAgentLogs] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<DecisionRow[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const es = new EventSource(API.events);
    es.addEventListener("refresh", () => fetchData());
    return () => es.close();
  }, []);

  const fetchData = async () => {
    try {
      const [finRes, logRes, decRes] = await Promise.all([
        fetch(API.financials),
        fetch(API.agentLogs),
        fetch(API.decisions)
      ]);
      const finData = await finRes.json();
      const logData = await logRes.json();
      const decData = await decRes.json();
      
      setFinancials(finData);
      setAgentLogs(logData);
      setDecisions(Array.isArray(decData) ? decData : []);

      // Generate AI Insights (server-side; may fail if GEMINI_API_KEY not set)
      try {
        const aiInsights = await geminiService.generateInsights(finData);
        setInsights(aiInsights);
      } catch (insightError) {
        console.error("AI insights:", insightError);
        setInsights({
          insights: ["Unable to load AI insights. Check that GEMINI_API_KEY is set on the server."],
          recommendations: [],
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!decisionInput) return;
    setSimulating(true);
    try {
      const result = await geminiService.simulateDecision(decisionInput, financials);
      setSimulationResult(result);
      
      // Log agent action
      await fetch(API.agentLogs, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Forecasting Agent',
          action: 'Decision Simulation',
          recommendation: `Simulated: ${decisionInput}`,
          impact_score: result.simulations?.[0]?.runway_impact || 0
        })
      });
      fetchData();
    } catch (error) {
      console.error("Simulation error:", error);
      setSimulationResult({
        summary: error instanceof Error ? error.message : "Simulation failed. Check server logs and GEMINI_API_KEY.",
        impacts: { runway: "—", revenue: "—", profitability: "—" },
        simulations: [],
      });
    } finally {
      setSimulating(false);
    }
  };

  const latestCash = financials[financials.length - 1]?.cash_on_hand || 0;
  const latestBurn = financials[financials.length - 1] ? financials[financials.length - 1].expenses - financials[financials.length - 1].revenue : 0;
  const runway = latestBurn > 0 ? (latestCash / latestBurn).toFixed(1) : '∞';

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-black" size={40} />
          <p className="font-display font-bold text-xl animate-pulse">Initializing FinModel.ai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-100 bg-white p-8 flex flex-col gap-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <BrainCircuit className="text-white" size={22} />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight">FinModel<span className="signature-text">.ai</span></h1>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={TrendingUp} label="Financial model" active={activeTab === 'model'} onClick={() => setActiveTab('model')} />
          <SidebarItem icon={Zap} label="Simulations" active={activeTab === 'simulations'} onClick={() => setActiveTab('simulations')} />
          <SidebarItem icon={Bot} label="AI agents" active={activeTab === 'agents'} onClick={() => setActiveTab('agents')} />
          <SidebarItem icon={History} label="Decision log" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </nav>

        <div className="pt-8 border-t border-gray-100">
          <SidebarItem icon={Settings} label="Settings" onClick={() => {}} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-display font-bold tracking-tight">
              {activeTab === 'dashboard' ? 'Financial intelligence' : 
               activeTab === 'model' ? 'Financial model' :
               activeTab === 'simulations' ? 'Outcome prediction' :
               activeTab === 'agents' ? 'Autonomous agents' : 'Decision log'}
            </h2>
            <p className="text-gray-500 text-base mt-2 font-light">Real-time financial intelligence and autonomous forecasting.</p>
          </div>
          <div className="flex gap-4">
            <button className="btn-secondary">
              Export report
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Plus size={18} /> New decision
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Cash on Hand" value={`$${latestCash.toLocaleString()}`} trend="up" trendValue="12%" icon={TrendingUp} />
                <StatCard label="Monthly Burn" value={`$${latestBurn.toLocaleString()}`} trend="down" trendValue="4%" icon={AlertCircle} />
                <StatCard label="Runway" value={`${runway} Months`} trend="up" trendValue="2.1m" icon={Zap} />
                <StatCard label="Revenue (MRR)" value={`$${financials[financials.length - 1]?.revenue.toLocaleString()}`} trend="up" trendValue="18%" icon={TrendingUp} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 glass-card p-8">
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
                </div>

                {/* AI Insights */}
                <div className="glass-card p-8 bg-[#111827] text-white border-none shadow-xl shadow-indigo-900/10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <BrainCircuit size={20} className="text-indigo-400" />
                    </div>
                    <h3 className="font-display font-bold text-xl tracking-tight">AI financial insights</h3>
                  </div>
                  <div className="space-y-6">
                    {insights?.insights.map((insight: string, i: number) => (
                      <div key={i} className="flex gap-4">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        <p className="text-sm text-gray-300 leading-relaxed font-light">{insight}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 pt-8 border-t border-white/5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">Strategic recommendations</p>
                    <div className="space-y-4">
                      {insights?.recommendations.map((rec: any, i: number) => (
                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold tracking-tight">{rec.title}</h4>
                            <ArrowUpRight size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                          </div>
                          <p className="text-xs text-gray-400 mt-1.5 font-light leading-relaxed">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'model' && (
            <motion.div
              key="model"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="glass-card overflow-hidden border-none shadow-xl shadow-gray-200/50">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-display font-bold text-xl tracking-tight">Income statement (Pro-forma)</h3>
                  <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                    <button className="px-4 py-1.5 bg-white text-[#111827] text-xs font-bold rounded-lg shadow-sm">Monthly</button>
                    <button className="px-4 py-1.5 text-gray-400 text-xs font-bold rounded-lg hover:text-gray-600">Quarterly</button>
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
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5 text-sm font-semibold">Total revenue</td>
                        {financials.map(f => (
                          <td key={f.month} className="px-8 py-5 text-sm text-right font-mono font-medium">${f.revenue.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5 text-sm font-semibold">Total expenses</td>
                        {financials.map(f => (
                          <td key={f.month} className="px-8 py-5 text-sm text-right font-mono text-rose-500 font-medium">(${f.expenses.toLocaleString()})</td>
                        ))}
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="px-8 py-5 text-sm font-bold">Net income (Burn)</td>
                        {financials.map(f => (
                          <td key={f.month} className={cn(
                            "px-8 py-5 text-sm text-right font-mono font-bold",
                            (f.revenue - f.expenses) >= 0 ? "text-emerald-600" : "text-rose-600"
                          )}>
                            ${(f.revenue - f.expenses).toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5 text-sm font-semibold">Cash on hand</td>
                        {financials.map(f => (
                          <td key={f.month} className="px-8 py-5 text-sm text-right font-mono font-medium">${f.cash_on_hand.toLocaleString()}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="glass-card p-8">
                  <h4 className="font-display font-bold text-lg mb-6 tracking-tight">Unit economics</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'LTV (Lifetime Value)', value: '$1,240', status: 'Healthy' },
                      { label: 'CAC (Acquisition Cost)', value: '$320', status: 'Warning' },
                      { label: 'LTV/CAC Ratio', value: '3.8x', status: 'Healthy' },
                      { label: 'Payback Period', value: '4.2 Months', status: 'Healthy' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                        <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                        <div className="text-right">
                          <p className="text-sm font-bold tracking-tight">{item.value}</p>
                          <p className={cn(
                            "text-[9px] font-bold uppercase tracking-widest mt-0.5",
                            item.status === 'Healthy' ? "text-emerald-500" : "text-amber-500"
                          )}>{item.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-8">
                  <h4 className="font-display font-bold text-lg mb-6 tracking-tight">Burn analysis</h4>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financials}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                        <Tooltip cursor={{ fill: '#00000005' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey={(f) => f.expenses - f.revenue} fill="#111827" radius={[6, 6, 0, 0]} name="Net burn" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'simulations' && (
            <motion.div
              key="simulations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto space-y-10"
            >
              <div className="glass-card p-10 border-none shadow-2xl shadow-gray-200/50">
                <h3 className="text-2xl font-display font-bold mb-3 tracking-tight">Outcome prediction engine</h3>
                <p className="text-gray-500 text-base mb-8 font-light">Simulate the impact of hiring, pricing changes, or funding rounds before you act.</p>
                
                <div className="relative">
                  <textarea
                    value={decisionInput}
                    onChange={(e) => setDecisionInput(e.target.value)}
                    placeholder="e.g., What happens if we hire 3 senior engineers and increase marketing spend by 20% next month?"
                    className="w-full h-40 p-6 bg-gray-50/50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-[#111827] focus:border-transparent outline-none transition-all resize-none text-base font-light leading-relaxed"
                  />
                  <button
                    onClick={handleSimulate}
                    disabled={simulating || !decisionInput}
                    className="absolute bottom-6 right-6 btn-primary flex items-center gap-2"
                  >
                    {simulating ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                    Run simulation
                  </button>
                </div>
              </div>

              {simulationResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  <div className="md:col-span-3 glass-card p-8 bg-emerald-50/50 border-emerald-100/50">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2 className="text-emerald-600" size={22} />
                      <h4 className="font-display font-bold text-lg text-emerald-900 tracking-tight">Simulation complete</h4>
                    </div>
                    <p className="text-base text-emerald-800 font-light leading-relaxed">{simulationResult.summary}</p>
                  </div>

                  <div className="glass-card p-8">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Runway impact</p>
                    <h4 className="text-2xl font-display font-bold tracking-tight">{simulationResult.impacts.runway}</h4>
                  </div>
                  <div className="glass-card p-8">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Revenue impact</p>
                    <h4 className="text-2xl font-display font-bold tracking-tight">{simulationResult.impacts.revenue}</h4>
                  </div>
                  <div className="glass-card p-8">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Profitability</p>
                    <h4 className="text-2xl font-display font-bold tracking-tight">{simulationResult.impacts.profitability}</h4>
                  </div>

                  <div className="md:col-span-3 glass-card p-8">
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
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'agents' && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { name: 'Financial analyst', status: 'Active', desc: 'Analyzing burn rate and unit economics.', icon: TrendingUp },
                  { name: 'CFO agent', status: 'Active', desc: 'Optimizing runway and hiring plans.', icon: BrainCircuit },
                  { name: 'Forecasting agent', status: 'Idle', desc: 'Predicting future financial outcomes.', icon: Zap },
                ].map((agent, i) => (
                  <div key={i} className="glass-card p-8 group hover:border-gray-300">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3.5 bg-[#111827] rounded-2xl shadow-lg shadow-indigo-900/10">
                        <agent.icon className="text-white" size={24} />
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                        {agent.status}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl tracking-tight">{agent.name}</h3>
                    <p className="text-sm text-gray-500 mt-3 font-light leading-relaxed">{agent.desc}</p>
                    <button className="w-full mt-8 btn-secondary">
                      View activity
                    </button>
                  </div>
                ))}
              </div>

              <div className="glass-card p-8">
                <h3 className="font-display font-bold text-xl mb-8 tracking-tight">Recent agent activity</h3>
                <div className="space-y-2">
                  {agentLogs.map((log: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl transition-colors group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                          <Bot size={22} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold tracking-tight">{log.agent_name}</p>
                          <p className="text-xs text-gray-400 font-medium">{log.action}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 max-w-md truncate font-light">{log.recommendation}</p>
                        <p className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-widest">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Decision log table (Replit-style: status badges + table layout) */}
              <div className="glass-card overflow-hidden border-none shadow-xl shadow-gray-200/50">
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
                        {decisions.map((d) => (
                          <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="glass-card p-10">
                <h3 className="font-display font-bold text-2xl mb-10 tracking-tight">Decision intelligence log</h3>
                <p className="text-gray-500 text-sm -mt-6 mb-6 font-light">Simulations run by the forecasting agent.</p>
                <div className="space-y-4">
                  {agentLogs.filter((l: any) => l.action === 'Decision Simulation').map((log: any, i: number) => (
                    <div key={i} className="p-6 border border-gray-50 rounded-3xl hover:bg-gray-50 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                            <History size={16} className="text-gray-400" />
                          </div>
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
                    </div>
                  ))}
                  {agentLogs.filter(l => l.action === 'Decision Simulation').length === 0 && (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <History size={32} className="text-gray-200" />
                      </div>
                      <p className="text-gray-400 text-base font-light">No decisions logged yet. Run a simulation to start tracking.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <ChatWidget />
    </div>
  );
}
