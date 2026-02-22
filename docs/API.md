# FinModel.ai – API reference

Base URL: same origin as the app (e.g. `http://localhost:3000`).  
All JSON request/response. Errors return JSON `{ "error": "message" }` with appropriate status codes.

---

## GET /api/financials

Returns all financial data rows, ordered by month ascending.

**Response:** `200`  
**Body:** array of objects

| Field         | Type   | Description                |
|---------------|--------|----------------------------|
| id            | number | Primary key                |
| month         | string | e.g. `"2026-01"`           |
| revenue       | number | Total revenue              |
| expenses      | number | Total expenses             |
| cash_on_hand  | number | Cash balance               |
| category      | string \| null | Optional category   |

---

## GET /api/decisions

Returns decision records, newest first.

**Response:** `200`  
**Body:** array of objects

| Field           | Type   | Description        |
|-----------------|--------|--------------------|
| id              | number | Primary key        |
| timestamp       | string | ISO datetime        |
| decision_text   | string | Decision text       |
| context         | string \| null | Optional context  |
| expected_outcome| string \| null | Optional         |
| actual_outcome  | string \| null | Optional         |
| status          | string | e.g. `"pending"`   |

---

## POST /api/decisions

Create a decision record.

**Request body:**

| Field            | Type   | Required | Description   |
|------------------|--------|----------|---------------|
| decision_text    | string | Yes      | Decision text  |
| context          | string | No       | Optional       |
| expected_outcome | string | No       | Optional       |

**Response:** `201`  
**Body:** `{ "id": number }` (inserted row id)

**Errors:** `400` if `decision_text` missing or not a string; `500` on server error.

---

## GET /api/agent-logs

Returns the 50 most recent agent log entries, newest first.

**Response:** `200`  
**Body:** array of objects

| Field         | Type   | Description        |
|---------------|--------|--------------------|
| id            | number | Primary key        |
| timestamp     | string | ISO datetime       |
| agent_name    | string | e.g. `"Forecasting Agent"` |
| action        | string | e.g. `"Decision Simulation"` |
| recommendation| string \| null | Text  |
| impact_score  | number \| null | e.g. runway months |

---

## POST /api/agent-logs

Create an agent log entry.

**Request body:**

| Field         | Type   | Required | Description   |
|---------------|--------|----------|---------------|
| agent_name    | string | Yes      | Agent name    |
| action        | string | Yes      | Action type   |
| recommendation| string | No       | Optional      |
| impact_score  | number | No       | Optional      |

**Response:** `201`  
**Body:** `{ "id": number }`

**Errors:** `400` if `agent_name` or `action` missing; `500` on server error.

---

## POST /api/insights

Generate AI insights and recommendations from financial data. Uses server-side Gemini (`GEMINI_API_KEY` required).

**Request body:** array of financial metric objects (same shape as `/api/financials` rows):

| Field        | Type   | Description       |
|--------------|--------|-------------------|
| month        | string | e.g. `"2026-01"`  |
| revenue      | number | Revenue           |
| expenses     | number | Expenses          |
| cash_on_hand | number | Cash balance      |

**Response:** `200`  
**Body:**

```json
{
  "insights": [ "string", "..." ],
  "recommendations": [
    { "title": "string", "description": "string" }
  ]
}
```

**Errors:** `400` if body is not an array; `500` if Gemini fails or key missing (may still return fallback content).

---

## POST /api/simulate

Run a decision simulation (outcome prediction). Uses server-side Gemini (`GEMINI_API_KEY` required).

**Request body:**

| Field       | Type   | Required | Description                    |
|-------------|--------|----------|--------------------------------|
| decision    | string | Yes      | Scenario description           |
| financials  | array  | Yes      | Current financial metrics (see /api/insights shape) |

**Response:** `200`  
**Body:**

```json
{
  "summary": "string",
  "impacts": {
    "runway": "string",
    "revenue": "string",
    "profitability": "string"
  },
  "simulations": [
    {
      "scenario": "string",
      "runway_impact": number,
      "revenue_impact": number
    }
  ]
}
```

**Errors:** `400` if `decision` is not a string or `financials` is not an array; `500` on server/Gemini error.

---

## Static and SPA fallback

- In development, Vite serves the frontend and assets.
- In production, the server serves static files from `dist/`.  
- `GET *` (for non-API paths) returns `dist/index.html` for client-side routing.
