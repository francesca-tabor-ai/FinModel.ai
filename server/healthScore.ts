/**
 * Financial Health Score - composite 0-100 score from runway, cash, revenue, burn.
 * Designed for founders: one number to gauge company health at a glance.
 */

export interface FinancialMetric {
  month: string;
  revenue: number;
  expenses: number;
  cash_on_hand: number;
}

export interface HealthScoreBreakdown {
  label: string;
  score: number;
  weight: number;
  description: string;
}

export interface HealthScoreResult {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  trend: "up" | "stable" | "down";
  breakdown: HealthScoreBreakdown[];
  summary: string;
}

function runwayScore(monthsRunway: number): number {
  if (monthsRunway >= 18) return 100;
  if (monthsRunway >= 12) return 85;
  if (monthsRunway >= 9) return 70;
  if (monthsRunway >= 6) return 55;
  if (monthsRunway >= 4) return 40;
  if (monthsRunway >= 2) return 25;
  return Math.max(5, Math.round(monthsRunway * 10));
}

function revenueMomentumScore(data: FinancialMetric[]): number {
  if (data.length < 3) return 60;
  const recent = data.slice(-3);
  const prev = data.slice(-6, -3);
  if (prev.length === 0) return 70;
  const recentAvg = recent.reduce((s, d) => s + d.revenue, 0) / recent.length;
  const prevAvg = prev.reduce((s, d) => s + d.revenue, 0) / prev.length;
  if (prevAvg <= 0) return 70;
  const growth = ((recentAvg - prevAvg) / prevAvg) * 100;
  // 15%+ growth = 100, 0% = 50, -20% = 20
  if (growth >= 15) return 100;
  if (growth >= 10) return 90;
  if (growth >= 5) return 80;
  if (growth >= 0) return 50 + Math.round(growth * 6);
  if (growth >= -10) return 40 + Math.round(growth + 10);
  if (growth >= -20) return 25 + Math.round((growth + 20) / 2);
  return Math.max(10, 25 + Math.round(growth));
}

function burnSustainabilityScore(data: FinancialMetric[]): number {
  if (data.length < 1) return 60;
  const latest = data[data.length - 1];
  const burn = latest.expenses - latest.revenue;
  if (burn <= 0) return 100; // profitable
  const revExpRatio = latest.revenue / latest.expenses;
  // 1.0 = 100, 0.8 = 80, 0.5 = 50, 0.2 = 25
  return Math.min(100, Math.round(revExpRatio * 100));
}

function cashTrendScore(data: FinancialMetric[]): number {
  if (data.length < 4) return 70;
  const last = data[data.length - 1].cash_on_hand;
  const threeAgo = data[data.length - 4].cash_on_hand;
  if (threeAgo <= 0) return 70;
  const change = ((last - threeAgo) / threeAgo) * 100;
  if (change >= 5) return 100;
  if (change >= 0) return 70 + Math.round(change * 6);
  if (change >= -10) return 60 + Math.round(change + 10);
  if (change >= -25) return 40 + Math.round((change + 25) / 1.5);
  return Math.max(15, 40 + Math.round(change));
}

export function computeHealthScore(data: FinancialMetric[]): HealthScoreResult {
  if (!data.length) {
    return {
      score: 0,
      grade: "F",
      trend: "stable",
      breakdown: [],
      summary: "No financial data available to compute health score.",
    };
  }

  const latest = data[data.length - 1];
  const burn = latest.expenses - latest.revenue;
  const monthsRunway = burn > 0 ? latest.cash_on_hand / burn : 24;

  const runway = runwayScore(monthsRunway);
  const revenue = revenueMomentumScore(data);
  const burnScore = burnSustainabilityScore(data);
  const cash = cashTrendScore(data);

  const weights = { runway: 0.3, revenue: 0.25, burn: 0.25, cash: 0.2 };
  const score = Math.round(
    runway * weights.runway +
    revenue * weights.revenue +
    burnScore * weights.burn +
    cash * weights.cash
  );

  const breakdown: HealthScoreBreakdown[] = [
    {
      label: "Runway",
      score: runway,
      weight: 30,
      description: monthsRunway >= 12 ? "Strong runway" : monthsRunway >= 6 ? "Adequate runway" : "Runway needs attention",
    },
    {
      label: "Revenue momentum",
      score: revenue,
      weight: 25,
      description: revenue >= 70 ? "Revenue trending up" : revenue >= 50 ? "Stable revenue" : "Revenue under pressure",
    },
    {
      label: "Burn sustainability",
      score: burnScore,
      weight: 25,
      description: burnScore >= 80 ? "Path to profitability visible" : burnScore >= 50 ? "Moderate burn" : "High burn relative to revenue",
    },
    {
      label: "Cash trend",
      score: cash,
      weight: 20,
      description: cash >= 80 ? "Cash position improving" : cash >= 50 ? "Stable cash" : "Cash declining",
    },
  ];

  let grade: "A" | "B" | "C" | "D" | "F" = "F";
  if (score >= 80) grade = "A";
  else if (score >= 65) grade = "B";
  else if (score >= 50) grade = "C";
  else if (score >= 35) grade = "D";

  let trend: "up" | "stable" | "down" = "stable";
  if (data.length >= 6) {
    const recentThree = data.slice(-3);
    const prevThree = data.slice(-6, -3);
    const recentAvg = recentThree.reduce((s, d) => s + d.cash_on_hand, 0) / 3;
    const prevAvg = prevThree.reduce((s, d) => s + d.cash_on_hand, 0) / 3;
    const pct = prevAvg > 0 ? ((recentAvg - prevAvg) / prevAvg) * 100 : 0;
    if (pct > 2) trend = "up";
    else if (pct < -2) trend = "down";
  }

  const summary =
    score >= 80
      ? "Strong financial health. Runway and momentum support growth."
      : score >= 65
        ? "Good financial position. Monitor burn and runway trends."
        : score >= 50
          ? "Moderate health. Consider optimizing burn or accelerating revenue."
          : score >= 35
            ? "Needs attention. Focus on runway extension or revenue growth."
            : "Critical. Prioritize cash preservation and revenue.";

  return {
    score: Math.min(100, Math.max(0, score)),
    grade,
    trend,
    breakdown,
    summary,
  };
}
