export const JENNA_ERROR_LOG_DAYS = [1, 7, 30] as const;
export type JennaErrorLogDays = (typeof JENNA_ERROR_LOG_DAYS)[number];
export const JENNA_ERROR_LOG_PAGE = { defaultLimit: 20, maxLimit: 50 } as const;

export interface JennaUsageWindow {
  /** ISO start of the rolling window. */
  since: string;
  /** role "user" rows, including failed turns. */
  questions: number;
  /** assistant rows with status "ok". */
  answered: number;
  /** status "error" rows, excluding errorCode "client_closed". */
  failed: number;
  /** status "error" rows with errorCode "client_closed" (visitor pressed Berhenti / left). */
  cancelled: number;
  inputTokens: number;
  outputTokens: number;
  /** Mean of latencyMs over rows where it is set; null when there is none. */
  avgLatencyMs: number | null;
}

export interface JennaProviderUsage {
  slot: string;
  model: string;
  /** Rows that carry provider telemetry (one per turn). */
  turns: number;
  failed: number;
  inputTokens: number;
  outputTokens: number;
  avgLatencyMs: number | null;
}

export interface JennaToolUsage {
  name: string;
  count: number;
}

/** data of GET /api/developer/jenna/usage */
export interface JennaUsageResponse {
  last24h: JennaUsageWindow;
  last7d: JennaUsageWindow;
  /** Last 7 days, rows with providerSlot set, turns desc. */
  providers7d: JennaProviderUsage[];
  /** Last 7 days, top 10, count desc then name asc. */
  tools7d: JennaToolUsage[];
  generatedAt: string;
}

export interface JennaErrorLogItem {
  /** Message id (also the pagination cursor). */
  id: string;
  conversationId: string;
  createdAt: string;
  errorCode: string | null;
  errorDetail: string | null;
  providerSlot: string | null;
  model: string | null;
  latencyMs: number | null;
  /** The visitor's question (already masked), clipped like the conversation preview. */
  preview: string;
  /** First 8 characters of sessionHash. */
  session: string;
}

/** data of GET /api/developer/jenna/errors?days&limit&cursor */
export interface JennaErrorLogResponse {
  items: JennaErrorLogItem[];
  /** Pass as `cursor` for the next page; null on the last page. */
  nextCursor: string | null;
  days: JennaErrorLogDays;
}
