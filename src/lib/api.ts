/**
 * API path constants for client fetch calls (aligned with server/server/api-routes.ts).
 */
export const API = {
  financials: "/api/financials",
  decisions: "/api/decisions",
  agentLogs: "/api/agent-logs",
  insights: "/api/insights",
  simulate: "/api/simulate",
  chat: "/api/chat",
  events: "/api/events",
} as const;
