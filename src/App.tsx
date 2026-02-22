/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { LayoutDashboard, TrendingUp, BrainCircuit, Zap, History, Settings, Plus, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService, FinancialMetric } from './services/geminiService';
import { cn } from './lib/utils';
import { API } from './lib/api';
import { ChatWidget } from './components/ChatWidget';
import { PageWrapper } from './pages/PageWrapper';

type DecisionRow = { id: number; timestamp: string; decision_text: string; context?: string | null; expected_outcome?: string | null; actual_outcome?: string | null; status: string };

// Lazy-loaded page components
const DashboardView = lazy(() => import('./pages/DashboardView'));
const ModelView = lazy(() => import('./pages/ModelView'));
const SimulationsView = lazy(() => import('./pages/SimulationsView'));
const AgentsView = lazy(() => import('./pages/AgentsView'));
const HistoryView = lazy(() => import('./pages/HistoryView'));

const PageFallback = () => (
  <div className="flex items-center justify-center py-24">
    <Loader2 className="animate-spin text-[#111827]" size={32} />
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: React.ElementType; label: string; active?: boolean; onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    className={cn(
      "sidebar-link",
      active 
        ? "bg-[#111827] text-white shadow-lg shadow-black/10" 
        : "text-gray-500 hover:bg-gray-50 hover:text-[#111827]"
    )}
    whileHover={{ scale: 1.02, x: 2 }}
    whileTap={{ scale: 0.98 }}
  >
    <Icon size={18} />
    {label}
  </motion.button>
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
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

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
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div 
            className="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <BrainCircuit className="text-white" size={22} />
          </motion.div>
          <h1 className="text-2xl font-display font-bold tracking-tight">FinModel<span className="signature-text">.ai</span></h1>
        </motion.div>

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
      <main ref={mainRef} className="flex-1 overflow-y-auto p-12">
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
            <motion.button className="btn-secondary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Export report
            </motion.button>
            <motion.button className="btn-primary flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Plus size={18} /> New decision
            </motion.button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <PageWrapper key="dashboard">
              <Suspense fallback={<PageFallback />}>
                <DashboardView financials={financials} insights={insights} />
              </Suspense>
            </PageWrapper>
          )}

          {activeTab === 'model' && (
            <PageWrapper key="model">
              <Suspense fallback={<PageFallback />}>
                <ModelView financials={financials} />
              </Suspense>
            </PageWrapper>
          )}

          {activeTab === 'simulations' && (
            <PageWrapper key="simulations">
              <Suspense fallback={<PageFallback />}>
                <SimulationsView
                  decisionInput={decisionInput}
                  setDecisionInput={setDecisionInput}
                  handleSimulate={handleSimulate}
                  simulating={simulating}
                  simulationResult={simulationResult}
                />
              </Suspense>
            </PageWrapper>
          )}

          {activeTab === 'agents' && (
            <PageWrapper key="agents">
              <Suspense fallback={<PageFallback />}>
                <AgentsView agentLogs={agentLogs} />
              </Suspense>
            </PageWrapper>
          )}

          {activeTab === 'history' && (
            <PageWrapper key="history">
              <Suspense fallback={<PageFallback />}>
                <HistoryView decisions={decisions} agentLogs={agentLogs} />
              </Suspense>
            </PageWrapper>
          )}
        </AnimatePresence>
      </main>
      <ChatWidget />
    </div>
  );
}
