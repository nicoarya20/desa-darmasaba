// Akses DB percakapan Jenna publik. Semua baca/tulis percakapan dibatasi `sessionHash` pemiliknya.
import prisma from "@/lib/prisma";

export type JennaMessageStatus = "ok" | "error";

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface MessageRow {
  role: "user" | "assistant";
  content: string;
  status: JennaMessageStatus;
  errorCode?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  toolsUsed?: string[];
}

export interface Identity {
  sessionHash: string;
  ipHash: string;
}

export interface ChatRepo {
  /** null bila id tidak ada ATAU bukan milik sesi ini (tidak dibedakan). */
  findOwnedConversation(id: string, sessionHash: string): Promise<{ id: string } | null>;
  createConversation(who: Identity, now: Date): Promise<string>;
  /** `take` pesan terakhir berstatus ok, urut kronologis. */
  recentMessages(conversationId: string, take: number): Promise<HistoryMessage[]>;
  appendMessages(conversationId: string, who: Identity, rows: readonly MessageRow[], now: Date): Promise<void>;
  countUserMessagesSince(where: { sessionHash: string } | { ipHash: string }, since: Date): Promise<number>;
  sumTokensSince(since: Date): Promise<number>;
}

export const prismaChatRepo: ChatRepo = {
  async findOwnedConversation(id, sessionHash) {
    return prisma.jennaConversation.findFirst({ where: { id, sessionHash }, select: { id: true } });
  },

  async createConversation(who, now) {
    const row = await prisma.jennaConversation.create({
      data: { sessionHash: who.sessionHash, ipHash: who.ipHash, lastMessageAt: now },
      select: { id: true },
    });
    return row.id;
  },

  async recentMessages(conversationId, take) {
    if (take <= 0) return [];
    const rows = await prisma.jennaMessage.findMany({
      where: { conversationId, status: "ok" },
      orderBy: { createdAt: "desc" },
      take,
      select: { role: true, content: true },
    });
    return rows
      .reverse()
      .filter((r): r is HistoryMessage => r.role === "user" || r.role === "assistant");
  },

  async appendMessages(conversationId, who, rows, now) {
    // createdAt berurutan (+1 ms) agar urutan user → asisten stabil saat dibaca ulang.
    await prisma.$transaction([
      prisma.jennaMessage.createMany({
        data: rows.map((row, index) => ({
          conversationId,
          role: row.role,
          content: row.content,
          status: row.status,
          errorCode: row.errorCode ?? null,
          inputTokens: row.inputTokens ?? 0,
          outputTokens: row.outputTokens ?? 0,
          toolsUsed: row.toolsUsed ?? [],
          sessionHash: who.sessionHash,
          ipHash: who.ipHash,
          createdAt: new Date(now.getTime() + index),
        })),
      }),
      prisma.jennaConversation.update({ where: { id: conversationId }, data: { lastMessageAt: now } }),
    ]);
  },

  async countUserMessagesSince(where, since) {
    return prisma.jennaMessage.count({ where: { ...where, role: "user", createdAt: { gte: since } } });
  },

  async sumTokensSince(since) {
    const agg = await prisma.jennaMessage.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { inputTokens: true, outputTokens: true },
    });
    return (agg._sum.inputTokens ?? 0) + (agg._sum.outputTokens ?? 0);
  },
};

/** Hapus percakapan tanpa aktivitas sejak `cutoff`; pesan ikut terhapus (cascade). */
export async function deleteConversationsBefore(cutoff: Date): Promise<number> {
  const res = await prisma.jennaConversation.deleteMany({ where: { lastMessageAt: { lt: cutoff } } });
  return res.count;
}
