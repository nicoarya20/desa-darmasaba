// Akses DB percakapan Jenna untuk Developer Console (role "0"): lintas sesi, hanya-baca + hapus.
// Hash sesi/IP dipotong ke JENNA_SHORT_HASH_LENGTH di sini — hash utuh tidak pernah keluar dari modul ini.
import prisma from "@/lib/prisma";
import {
  JENNA_PREVIEW_MAX_CHARS,
  JENNA_SHORT_HASH_LENGTH,
  type JennaConversationDetail,
  type JennaConversationListResponse,
  type JennaConversationMessageDTO,
  type JennaConversationSummary,
  type JennaMessageRole,
  type JennaMessageStatus,
} from "../admin-types";
import type { ConversationListQuery } from "../validation";
import { prismaChatRepo } from "./conversation.repo";

export const shortHash = (hash: string) => hash.slice(0, JENNA_SHORT_HASH_LENGTH);

/** Satu baris, spasi dirapatkan, maks `max` karakter (code point) termasuk elipsis. */
export function clipPreview(text: string, max = JENNA_PREVIEW_MAX_CHARS): string {
  const chars = Array.from(text.replace(/\s+/g, " ").trim());
  return chars.length <= max ? chars.join("") : `${chars.slice(0, max - 1).join("").trimEnd()}…`;
}

export interface TodayMessageStats {
  userMessages: number;
  assistantMessages: number;
  errorTurns: number;
  tokensUsed: number;
}

export async function messageStatsSince(since: Date): Promise<TodayMessageStats> {
  const [groups, tokensUsed] = await Promise.all([
    prisma.jennaMessage.groupBy({
      by: ["role", "status"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prismaChatRepo.sumTokensSince(since),
  ]);
  const stats: TodayMessageStats = { userMessages: 0, assistantMessages: 0, errorTurns: 0, tokensUsed };
  for (const g of groups) {
    const n = g._count._all;
    if (g.role === "user") stats.userMessages += n;
    if (g.role === "assistant" && g.status === "ok") stats.assistantMessages += n;
    if (g.status === "error") stats.errorTurns += n;
  }
  return stats;
}

export function countConversations(): Promise<number> {
  return prisma.jennaConversation.count();
}

export async function listConversations({ page, limit, session }: ConversationListQuery): Promise<JennaConversationListResponse> {
  const where = session ? { sessionHash: { startsWith: session } } : {};
  const [total, rows] = await Promise.all([
    prisma.jennaConversation.count({ where }),
    prisma.jennaConversation.findMany({
      where,
      orderBy: [{ lastMessageAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, createdAt: true, lastMessageAt: true, sessionHash: true, ipHash: true },
    }),
  ]);
  if (rows.length === 0) return { items: [], total, page, limit };

  const ids = rows.map((r) => r.id);
  const [groups, firstUser] = await Promise.all([
    prisma.jennaMessage.groupBy({
      by: ["conversationId", "status"],
      where: { conversationId: { in: ids } },
      _count: { _all: true },
      _sum: { inputTokens: true, outputTokens: true },
    }),
    prisma.jennaMessage.findMany({
      where: { conversationId: { in: ids }, role: "user" },
      orderBy: [{ conversationId: "asc" }, { createdAt: "asc" }],
      distinct: ["conversationId"],
      select: { conversationId: true, content: true },
    }),
  ]);

  const agg = new Map<string, { messageCount: number; errorCount: number; tokens: number }>();
  for (const g of groups) {
    const cur = agg.get(g.conversationId) ?? { messageCount: 0, errorCount: 0, tokens: 0 };
    cur.messageCount += g._count._all;
    if (g.status === "error") cur.errorCount += g._count._all;
    cur.tokens += (g._sum.inputTokens ?? 0) + (g._sum.outputTokens ?? 0);
    agg.set(g.conversationId, cur);
  }
  const previews = new Map(firstUser.map((m) => [m.conversationId, m.content]));

  const items: JennaConversationSummary[] = rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    lastMessageAt: r.lastMessageAt.toISOString(),
    ...(agg.get(r.id) ?? { messageCount: 0, errorCount: 0, tokens: 0 }),
    preview: clipPreview(previews.get(r.id) ?? ""),
    session: shortHash(r.sessionHash),
    ip: shortHash(r.ipHash),
  }));
  return { items, total, page, limit };
}

export async function getConversationDetail(id: string): Promise<JennaConversationDetail | null> {
  const row = await prisma.jennaConversation.findUnique({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      lastMessageAt: true,
      sessionHash: true,
      ipHash: true,
      messages: {
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: {
          role: true,
          content: true,
          status: true,
          errorCode: true,
          inputTokens: true,
          outputTokens: true,
          toolsUsed: true,
          createdAt: true,
        },
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    lastMessageAt: row.lastMessageAt.toISOString(),
    session: shortHash(row.sessionHash),
    ip: shortHash(row.ipHash),
    messages: row.messages.map(
      (m): JennaConversationMessageDTO => ({
        role: m.role as JennaMessageRole,
        content: m.content,
        status: m.status as JennaMessageStatus,
        errorCode: m.errorCode,
        inputTokens: m.inputTokens,
        outputTokens: m.outputTokens,
        toolsUsed: m.toolsUsed,
        createdAt: m.createdAt.toISOString(),
      }),
    ),
  };
}

/** Hapus permanen (pesan ikut, cascade). false bila id tidak ada. */
export async function deleteConversation(id: string): Promise<boolean> {
  const res = await prisma.jennaConversation.deleteMany({ where: { id } });
  return res.count > 0;
}
