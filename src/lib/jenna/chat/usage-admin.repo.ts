// Query pemakaian & log error Jenna untuk Developer Console (role "0"): hanya-baca, lintas sesi.
// Jendela bergulir dihitung dari `now` pemanggil; hash sesi dipotong lewat `shortHash`.
import prisma from "@/lib/prisma";
import type {
  JennaErrorLogItem,
  JennaErrorLogResponse,
  JennaProviderUsage,
  JennaToolUsage,
  JennaUsageResponse,
  JennaUsageWindow,
} from "../usage-types";
import type { ErrorLogQuery } from "../validation";
import { clipPreview, shortHash } from "./conversation-admin.repo";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const CLIENT_CLOSED = "client_closed";

/** Rata-rata dibulatkan ke ms; null bila tidak ada baris ber-latensi. */
const avgLatency = (sum: number, count: number) => (count > 0 ? Math.round(sum / count) : null);

async function usageWindow(since: Date): Promise<JennaUsageWindow> {
  const groups = await prisma.jennaMessage.groupBy({
    by: ["role", "status", "errorCode"],
    where: { createdAt: { gte: since } },
    _count: { _all: true, latencyMs: true },
    _sum: { inputTokens: true, outputTokens: true, latencyMs: true },
  });

  const win = { questions: 0, answered: 0, failed: 0, cancelled: 0, inputTokens: 0, outputTokens: 0 };
  let latencySum = 0;
  let latencyCount = 0;
  for (const g of groups) {
    const n = g._count._all;
    if (g.role === "user") win.questions += n;
    if (g.role === "assistant" && g.status === "ok") win.answered += n;
    if (g.status === "error") {
      if (g.errorCode === CLIENT_CLOSED) win.cancelled += n;
      else win.failed += n;
    }
    win.inputTokens += g._sum.inputTokens ?? 0;
    win.outputTokens += g._sum.outputTokens ?? 0;
    latencySum += g._sum.latencyMs ?? 0;
    latencyCount += g._count.latencyMs;
  }
  return { since: since.toISOString(), ...win, avgLatencyMs: avgLatency(latencySum, latencyCount) };
}

async function providerUsage(since: Date): Promise<JennaProviderUsage[]> {
  const groups = await prisma.jennaMessage.groupBy({
    by: ["providerSlot", "model", "status", "errorCode"],
    where: { createdAt: { gte: since }, providerSlot: { not: null }, model: { not: null } },
    _count: { _all: true, latencyMs: true },
    _sum: { inputTokens: true, outputTokens: true, latencyMs: true },
  });

  const byProvider = new Map<string, JennaProviderUsage & { latencySum: number; latencyCount: number }>();
  for (const g of groups) {
    // Sudah disaring `where`; pemeriksaan ini hanya mempersempit tipe.
    if (g.providerSlot === null || g.model === null) continue;
    const key = JSON.stringify([g.providerSlot, g.model]);
    const cur = byProvider.get(key) ?? {
      slot: g.providerSlot,
      model: g.model,
      turns: 0,
      failed: 0,
      inputTokens: 0,
      outputTokens: 0,
      avgLatencyMs: null,
      latencySum: 0,
      latencyCount: 0,
    };
    cur.turns += g._count._all;
    if (g.status === "error" && g.errorCode !== CLIENT_CLOSED) cur.failed += g._count._all;
    cur.inputTokens += g._sum.inputTokens ?? 0;
    cur.outputTokens += g._sum.outputTokens ?? 0;
    cur.latencySum += g._sum.latencyMs ?? 0;
    cur.latencyCount += g._count.latencyMs;
    byProvider.set(key, cur);
  }

  return [...byProvider.values()]
    .map(({ latencySum, latencyCount, ...row }) => ({ ...row, avgLatencyMs: avgLatency(latencySum, latencyCount) }))
    .sort((a, b) => b.turns - a.turns || a.slot.localeCompare(b.slot) || a.model.localeCompare(b.model));
}

function toolUsage(since: Date): Promise<JennaToolUsage[]> {
  // `toolsUsed` adalah text[]: unnest hanya tersedia lewat SQL mentah (tagged template = parameterised).
  return prisma.$queryRaw<JennaToolUsage[]>`
    SELECT t.name AS name, COUNT(*)::int AS count
    FROM "JennaMessage" m, unnest(m."toolsUsed") AS t(name)
    WHERE m."createdAt" >= ${since}
    GROUP BY t.name
    ORDER BY COUNT(*) DESC, t.name ASC
    LIMIT 10`;
}

export async function getUsage(now: Date): Promise<JennaUsageResponse> {
  const since24h = new Date(now.getTime() - DAY_MS);
  const since7d = new Date(now.getTime() - 7 * DAY_MS);
  const [last24h, last7d, providers7d, tools7d] = await Promise.all([
    usageWindow(since24h),
    usageWindow(since7d),
    providerUsage(since7d),
    toolUsage(since7d),
  ]);
  return { last24h, last7d, providers7d, tools7d, generatedAt: now.toISOString() };
}

/**
 * Giliran gagal terbaru dulu (tanpa `client_closed`), keyset pagination dengan id pesan sebagai cursor.
 * Cursor yang barisnya sudah terhapus (retensi) menghasilkan halaman kosong.
 */
export async function listErrorLog({ days, limit, cursor }: ErrorLogQuery, now: Date): Promise<JennaErrorLogResponse> {
  const rows = await prisma.jennaMessage.findMany({
    where: {
      status: "error",
      createdAt: { gte: new Date(now.getTime() - days * DAY_MS) },
      // `not` saja akan ikut membuang errorCode NULL (semantik SQL); baris itu tetap giliran gagal.
      OR: [{ errorCode: null }, { errorCode: { not: CLIENT_CLOSED } }],
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      conversationId: true,
      createdAt: true,
      errorCode: true,
      errorDetail: true,
      providerSlot: true,
      model: true,
      latencyMs: true,
      content: true,
      sessionHash: true,
    },
  });

  const items: JennaErrorLogItem[] = rows.slice(0, limit).map((r) => ({
    id: r.id,
    conversationId: r.conversationId,
    createdAt: r.createdAt.toISOString(),
    errorCode: r.errorCode,
    errorDetail: r.errorDetail,
    providerSlot: r.providerSlot,
    model: r.model,
    latencyMs: r.latencyMs,
    preview: clipPreview(r.content),
    session: shortHash(r.sessionHash),
  }));
  return { items, nextCursor: rows.length > limit ? items[items.length - 1].id : null, days };
}
