/**
 * API path constants (aligned with Replit shared/routes pattern).
 * Single source of truth for server routes; use src/lib/api.ts on the client for fetch URLs.
 */
export const API = {
  financials: "/api/financials",
  decisions: "/api/decisions",
  agentLogs: "/api/agent-logs",
  insights: "/api/insights",
  simulate: "/api/simulate",
  models: "/api/models",
  agents: "/api/agents",
  integrations: "/api/integrations",
  login: "/api/login",
  logout: "/api/logout",
  me: "/api/me",
  events: "/api/events",
} as const;

/** Validation error response shape (Replit-style) for 400 responses */
export function validationErrorResponse(message: string, field?: string) {
  return { message, ...(field != null && { field }) };
}
