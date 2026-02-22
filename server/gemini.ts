import { GoogleGenAI, Type } from "@google/genai";

export interface FinancialMetric {
  month: string;
  revenue: number;
  expenses: number;
  cash_on_hand: number;
}

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function generateInsights(data: FinancialMetric[]) {
  if (!ai) {
    return {
      insights: ["Configure GEMINI_API_KEY to enable AI insights."],
      recommendations: [{ title: "Set API key", description: "Add GEMINI_API_KEY to your environment to get AI-powered recommendations." }],
    };
  }
  const prompt = `
    As a world-class startup CFO AI, analyze the following financial data and provide 3 key insights and 3 strategic recommendations.
    Data: ${JSON.stringify(data)}
    Focus on burn rate, runway, and revenue growth.
    Format the response as JSON with "insights" (array of strings) and "recommendations" (array of objects with "title" and "description").
  `;
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          insights: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });
  return JSON.parse(response.text || "{}");
}

export async function simulateDecision(decision: string, currentData: FinancialMetric[]) {
  if (!ai) {
    return {
      summary: "Configure GEMINI_API_KEY to enable decision simulations.",
      impacts: { runway: "—", revenue: "—", profitability: "—" },
      simulations: [],
    };
  }
  const prompt = `
    Simulate the impact of this financial decision: "${decision}"
    Current Financial State: ${JSON.stringify(currentData)}
    Predict the impact on: 1. Runway (months) 2. Revenue Trajectory 3. Profitability Date
    Provide a probabilistic forecast (Best case, Worst case, Expected). Format as JSON.
  `;
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          impacts: {
            type: Type.OBJECT,
            properties: {
              runway: { type: Type.STRING },
              revenue: { type: Type.STRING },
              profitability: { type: Type.STRING },
            },
          },
          simulations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                scenario: { type: Type.STRING },
                runway_impact: { type: Type.NUMBER },
                revenue_impact: { type: Type.NUMBER },
              },
            },
          },
        },
      },
    },
  });
  return JSON.parse(response.text || "{}");
}
