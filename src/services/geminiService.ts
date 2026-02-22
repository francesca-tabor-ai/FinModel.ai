/**
 * Client-side API for AI insights and simulations.
 * All Gemini calls are made on the server to keep the API key secure.
 */

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

export const geminiService = {
  async generateInsights(data: FinancialMetric[]) {
    return apiPost<{ insights: string[]; recommendations: { title: string; description: string }[] }>(
      "/api/insights",
      data
    );
  },

  async simulateDecision(decision: string, currentData: FinancialMetric[]) {
    return apiPost<{
      summary: string;
      impacts: { runway: string; revenue: string; profitability: string };
      simulations?: { scenario: string; runway_impact: number; revenue_impact: number }[];
    }>("/api/simulate", { decision, financials: currentData });
  },
};
