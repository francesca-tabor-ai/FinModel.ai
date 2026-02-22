/**
 * Client-side API for AI insights and simulations.
 * All Gemini calls are made on the server to keep the API key secure.
 */

import { API } from "../lib/api";

export interface FinancialMetric {
  month: string;
  revenue: number;
  expenses: number;
  cash_on_hand: number;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface HealthScoreResult {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  trend: "up" | "stable" | "down";
  breakdown: { label: string; score: number; weight: number; description: string }[];
  summary: string;
}

export const geminiService = {
  async generateInsights(data: FinancialMetric[]) {
    return apiPost<{ insights: string[]; recommendations: { title: string; description: string }[] }>(
      API.insights,
      data
    );
  },

  async getHealthScore(data: FinancialMetric[]) {
    return apiPost<HealthScoreResult>(API.healthScore, data);
  },

  async simulateDecision(decision: string, currentData: FinancialMetric[]) {
    return apiPost<{
      summary: string;
      impacts: { runway: string; revenue: string; profitability: string };
      simulations?: { scenario: string; runway_impact: number; revenue_impact: number }[];
    }>(API.simulate, { decision, financials: currentData });
  },
};
