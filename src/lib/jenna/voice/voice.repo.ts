// Akses DB sesi suara Jenna publik. Penutupan idempoten: hanya baris yang masih terbuka yang diubah,
// sehingga tagihan tidak tertimpa bila heartbeat, close, dan sweeper berebut.
import prisma from "@/lib/prisma";
import type { VoiceClose, VoiceSessionRow } from "./voice.quota";

/** Cakupan kuota: satu sesi, satu IP, atau global (objek kosong). */
export type VoiceScope = { sessionHash: string } | { ipHash: string } | Record<string, never>;

export interface NewVoiceSession {
  sessionHash: string;
  ipHash: string;
  maxSeconds: number;
  now: Date;
}

export interface VoiceSessionRepo {
  createSession(input: NewVoiceSession): Promise<VoiceSessionRow>;
  findSession(id: string): Promise<VoiceSessionRow | null>;
  /** Sesi starting|active yang belum ditutup, tertua lebih dulu (yang tertua menang bila dua tab berebut). */
  findOpenSessions(scope: VoiceScope): Promise<VoiceSessionRow[]>;
  /** false bila sesi sudah ditutup selama relay berjalan. */
  activateSession(id: string, gatewaySessionId: string, at: Date): Promise<boolean>;
  touchHeartbeat(id: string, at: Date): Promise<void>;
  /** false bila sesi sudah ditutup sebelumnya (tidak ada yang diubah). */
  closeSession(id: string, close: VoiceClose): Promise<boolean>;
  recordHangup(id: string, status: number): Promise<void>;
  /** Total `billedSeconds` sesi yang dimulai sejak `since`. */
  sumBilledSince(scope: VoiceScope, since: Date): Promise<number>;
}

const OPEN = { status: { in: ["starting", "active"] }, endedAt: null };

export const prismaVoiceRepo: VoiceSessionRepo = {
  createSession({ sessionHash, ipHash, maxSeconds, now }) {
    return prisma.jennaVoiceSession.create({
      data: { sessionHash, ipHash, maxSeconds, status: "starting", startedAt: now, lastHeartbeatAt: now },
    });
  },

  findSession(id) {
    return prisma.jennaVoiceSession.findUnique({ where: { id } });
  },

  findOpenSessions(scope) {
    return prisma.jennaVoiceSession.findMany({
      where: { ...scope, ...OPEN },
      orderBy: [{ startedAt: "asc" }, { id: "asc" }],
    });
  },

  async activateSession(id, gatewaySessionId, at) {
    const res = await prisma.jennaVoiceSession.updateMany({
      where: { id, ...OPEN },
      data: { status: "active", gatewaySessionId, lastHeartbeatAt: at },
    });
    return res.count > 0;
  },

  async touchHeartbeat(id, at) {
    await prisma.jennaVoiceSession.updateMany({ where: { id, ...OPEN }, data: { lastHeartbeatAt: at } });
  },

  async closeSession(id, close) {
    const res = await prisma.jennaVoiceSession.updateMany({
      where: { id, endedAt: null },
      data: { status: "ended", endedAt: close.endedAt, billedSeconds: close.billedSeconds, endReason: close.endReason },
    });
    return res.count > 0;
  },

  async recordHangup(id, status) {
    await prisma.jennaVoiceSession.update({ where: { id }, data: { hangupStatus: status } });
  },

  async sumBilledSince(scope, since) {
    const agg = await prisma.jennaVoiceSession.aggregate({
      where: { ...scope, startedAt: { gte: since } },
      _sum: { billedSeconds: true },
    });
    return agg._sum.billedSeconds ?? 0;
  },
};

/** Retensi: hapus sesi suara yang dimulai sebelum `cutoff` dan sudah ditutup (sesi hidup tidak disentuh). */
export async function deleteVoiceSessionsBefore(cutoff: Date): Promise<number> {
  const res = await prisma.jennaVoiceSession.deleteMany({
    where: { startedAt: { lt: cutoff }, endedAt: { not: null } },
  });
  return res.count;
}
