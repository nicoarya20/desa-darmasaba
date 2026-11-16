// @vitest-environment node
// Runtime suara Jenna publik: gerbang start, satu sesi per sessionHash, kuota detik (sesi/IP/global, termasuk
// sesi berjalan), heartbeat/close/sweeper, dan hangup di setiap jalur penutupan. Repo & fetch palsu, tanpa DB.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({ env: { BETTER_AUTH_SECRET: "test-secret" } }));
vi.mock("@/lib/prisma", () => ({ default: {} }));

import { secondsUntilJakartaMidnight } from "@/lib/jenna/limits";
import { DEFAULT_JENNA_SETTINGS } from "@/lib/jenna/mappers";
import type { JennaSettingsDTO } from "@/lib/jenna/types";
import type { VoiceDeps, VoiceRuntime } from "@/lib/jenna/voice/voice.context";
import {
  closeVoiceSession,
  heartbeatVoiceSession,
  isPublicVoiceEnabled,
  isVoiceSessionLive,
} from "@/lib/jenna/voice/voice.lifecycle";
import { isOpenSession, type VoiceSessionRow } from "@/lib/jenna/voice/voice.quota";
import { hashSafetyIdentifier, type FetchLike } from "@/lib/jenna/voice/voice.relay";
import type { VoiceSessionRepo } from "@/lib/jenna/voice/voice.repo";
import { startVoiceSession } from "@/lib/jenna/voice/voice.service";
import { startJennaVoiceSweeper, sweepVoiceSessions } from "@/lib/jenna/voice/voice.sweeper";
import { createLimiter } from "@/lib/rate-limit";

const NOW = new Date("2026-11-14T03:00:00.000Z"); // 11:00 WIB
const SDP = "v=0\r\no=- 1 1 IN IP4 0.0.0.0\r\ns=-";
const GW = "gw_live_1";
const who = { sessionHash: "sess-a", ipHash: "ip-a" };
const at = (sec: number) => new Date(NOW.getTime() + sec * 1000);

const settings = (over: Partial<JennaSettingsDTO> = {}): JennaSettingsDTO => ({
  ...DEFAULT_JENNA_SETTINGS,
  enabled: true,
  dailyTokensGlobal: 1000,
  updatedAt: null,
  voiceEnabled: true,
  voiceDailyMinutesUser: 5,
  voiceDailyMinutesGlobal: 60,
  voiceSessionMaxMinutes: 5,
  voiceIdleOffSeconds: 60,
  ...over,
});

const runtime = (over: Partial<VoiceRuntime> = {}, s: Partial<JennaSettingsDTO> = {}): VoiceRuntime => ({
  settings: settings(s),
  chat: "ok",
  provider: { baseUrl: "https://gw.test", apiKey: "sk-secret", model: "gpt-live" },
  ...over,
});

let seq = 0;
function row(over: Partial<VoiceSessionRow> = {}): VoiceSessionRow {
  seq += 1;
  return {
    id: `seedsession${String(seq).padStart(10, "0")}`,
    sessionHash: "sess-x",
    ipHash: "ip-x",
    status: "active",
    gatewaySessionId: `gw_seed_${seq}`,
    startedAt: NOW,
    lastHeartbeatAt: NOW,
    maxSeconds: 300,
    endedAt: null,
    endReason: null,
    billedSeconds: 0,
    ...over,
  };
}

const closedRow = (over: Partial<VoiceSessionRow>) =>
  row({ status: "ended", endedAt: NOW, endReason: "user", gatewaySessionId: null, ...over });

function memRepo(seed: VoiceSessionRow[] = []) {
  const rows = new Map(seed.map((r) => [r.id, { ...r }]));
  const hangups: Array<[string, number]> = [];
  let n = 0;
  const matches = (r: VoiceSessionRow, scope: object) =>
    Object.entries(scope).every(([k, v]) => r[k as keyof VoiceSessionRow] === v);
  const repo: VoiceSessionRepo = {
    async createSession({ sessionHash, ipHash, maxSeconds, now }) {
      n += 1;
      const r: VoiceSessionRow = {
        id: `voicesession${String(n).padStart(10, "0")}`,
        sessionHash,
        ipHash,
        status: "starting",
        gatewaySessionId: null,
        startedAt: now,
        lastHeartbeatAt: now,
        maxSeconds,
        endedAt: null,
        endReason: null,
        billedSeconds: 0,
      };
      rows.set(r.id, r);
      return { ...r };
    },
    async findSession(id) {
      const r = rows.get(id);
      return r ? { ...r } : null;
    },
    async findOpenSessions(scope) {
      return [...rows.values()]
        .filter((r) => isOpenSession(r) && matches(r, scope))
        .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime() || a.id.localeCompare(b.id))
        .map((r) => ({ ...r }));
    },
    async activateSession(id, gatewaySessionId, when) {
      const r = rows.get(id);
      if (!r || !isOpenSession(r)) return false;
      Object.assign(r, { status: "active", gatewaySessionId, lastHeartbeatAt: when });
      return true;
    },
    async touchHeartbeat(id, when) {
      const r = rows.get(id);
      if (r && isOpenSession(r)) r.lastHeartbeatAt = when;
    },
    async closeSession(id, close) {
      const r = rows.get(id);
      if (!r || r.endedAt) return false;
      Object.assign(r, { status: "ended", ...close });
      return true;
    },
    async recordHangup(id, status) {
      hangups.push([id, status]);
    },
    async sumBilledSince(scope, since) {
      return [...rows.values()]
        .filter((r) => r.startedAt >= since && matches(r, scope))
        .reduce((sum, r) => sum + r.billedSeconds, 0);
    },
  };
  return { repo, rows, hangups };
}

function gatewayFetch() {
  return vi.fn<FetchLike>(async (url) =>
    url.endsWith("/hangup")
      ? new Response(null, { status: 200 })
      : Response.json({ session: { id: GW }, transport: { sdp: "v=0 answer" } }),
  );
}

function makeDeps(opts: { seed?: VoiceSessionRow[]; rt?: VoiceRuntime; fetchImpl?: VoiceDeps["fetchImpl"] } = {}) {
  const mem = memRepo(opts.seed);
  const fetchImpl = opts.fetchImpl ?? gatewayFetch();
  const clock = { now: NOW };
  const deps: VoiceDeps = {
    loadRuntime: vi.fn(async () => opts.rt ?? runtime()),
    repo: mem.repo,
    startLimiter: createLimiter(3, 60_000),
    fetchImpl,
    now: () => clock.now,
  };
  return { deps, ...mem, fetchImpl, clock };
}

const hangupCalls = (fetchImpl: ReturnType<typeof gatewayFetch> | VoiceDeps["fetchImpl"]) =>
  (fetchImpl as ReturnType<typeof gatewayFetch>).mock.calls.filter(([url]) => url.endsWith("/hangup"));

const start = (deps: VoiceDeps, identity = who, body = { sdp: SDP, consent: true }) => startVoiceSession(identity, body, deps);

async function started(opts: Parameters<typeof makeDeps>[0] = {}) {
  const ctx = makeDeps(opts);
  const out = await start(ctx.deps);
  if (!out.ok) throw new Error(`start gagal: ${out.code}`);
  return { ...ctx, id: out.value.sessionId };
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("startVoiceSession — gerbang", () => {
  it.each([
    ["chat nonaktif", runtime({ chat: "disabled" }), 409, "VOICE_DISABLED"],
    ["suara nonaktif", runtime({}, { voiceEnabled: false }), 409, "VOICE_DISABLED"],
    ["chat belum siap", runtime({ chat: "not_ready" }), 409, "VOICE_NOT_READY"],
    ["kuota global 0", runtime({}, { voiceDailyMinutesGlobal: 0 }), 409, "VOICE_NOT_READY"],
    ["provider suara belum siap", runtime({ provider: null }), 409, "VOICE_NOT_READY"],
  ])("%s → %i %s sebelum consent/SDP", async (_label, rt, status, code) => {
    const { deps, fetchImpl, rows } = makeDeps({ rt });
    const out = await start(deps, who, { sdp: "rusak", consent: false });
    expect(out).toMatchObject({ ok: false, status, code });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(rows.size).toBe(0);
  });

  it("consent bukan true → 403 (sebelum SDP), SDP rusak → 422; keduanya tanpa baris & relay", async () => {
    const { deps, fetchImpl, rows } = makeDeps();
    expect(await start(deps, who, { sdp: "rusak", consent: false })).toMatchObject({ status: 403, code: "VOICE_CONSENT_REQUIRED" });
    expect(await start(deps, who, { sdp: "o=tanpa-v0", consent: true })).toMatchObject({ status: 422, code: "VOICE_INVALID_INPUT" });
    expect(await start(deps, who, { sdp: `v=0${"a".repeat(64 * 1024)}`, consent: true })).toMatchObject({ status: 422 });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(rows.size).toBe(0);
  });

  it("start per IP dibatasi 3/menit → 429 VOICE_RATE_LIMITED + retryAfterSec", async () => {
    const { deps } = makeDeps();
    for (const sid of ["s1", "s2", "s3"]) expect((await start(deps, { sessionHash: sid, ipHash: "ip-a" })).ok).toBe(true);
    const out = await start(deps, { sessionHash: "s4", ipHash: "ip-a" });
    expect(out).toMatchObject({ ok: false, status: 429, code: "VOICE_RATE_LIMITED" });
    expect(!out.ok && out.retryAfterSec).toBeGreaterThan(0);
    expect((await start(deps, { sessionHash: "s5", ipHash: "ip-b" })).ok).toBe(true);
  });
});

describe("startVoiceSession — sukses & relay", () => {
  it("relay ke gateway dengan kunci slot suara + safety id; id gateway tidak dikirim ke klien", async () => {
    const { deps, fetchImpl, rows } = makeDeps({ rt: runtime({}, { voiceName: "marin", assistantName: "Jenna" }) });
    const out = await start(deps);
    expect(out).toEqual({
      ok: true,
      value: { sessionId: expect.any(String), sdp: "v=0 answer", maxSeconds: 300, idleOffSeconds: 60, remainingTodaySeconds: 300 },
    });
    expect(JSON.stringify(out)).not.toContain(GW);

    const [url, init] = (fetchImpl as ReturnType<typeof gatewayFetch>).mock.calls[0];
    expect(url).toBe("https://gw.test/live/sessions");
    const headers = init.headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer sk-secret");
    expect(headers["OpenAI-Safety-Identifier"]).toBe(hashSafetyIdentifier("sess-a"));
    expect(headers["OpenAI-Safety-Identifier"]).not.toContain("sess-a");
    const sent = JSON.parse(String(init.body));
    expect(sent.session).toMatchObject({ model: "gpt-live", voice: "marin", delegation: { type: "client" } });
    expect(sent.session.instructions).toContain("Jenna");
    expect(sent.transport).toEqual({ type: "webrtc", sdp: `${SDP}\r\n` });

    const saved = out.ok ? rows.get(out.value.sessionId) : undefined;
    expect(saved).toMatchObject({ status: "active", gatewaySessionId: GW, maxSeconds: 300, ipHash: "ip-a" });
  });

  it("satu sesi hidup per sessionHash → 409 VOICE_SESSION_ACTIVE tanpa relay kedua; sessionHash lain boleh", async () => {
    const { deps, fetchImpl } = await started();
    expect(await start(deps)).toMatchObject({ ok: false, status: 409, code: "VOICE_SESSION_ACTIVE" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect((await start(deps, { sessionHash: "sess-b", ipHash: "ip-a" })).ok).toBe(true);
  });

  it("sesi basi milik sendiri dilepas (tagih s/d heartbeat terakhir, hangup) lalu start baru boleh", async () => {
    const stale = row({ sessionHash: "sess-a", ipHash: "ip-a", startedAt: at(-120), lastHeartbeatAt: at(-60) });
    const { deps, rows, hangups, fetchImpl } = makeDeps({ seed: [stale] });
    expect((await start(deps)).ok).toBe(true);
    expect(rows.get(stale.id)).toMatchObject({ status: "ended", endReason: "stale", billedSeconds: 60, endedAt: at(-60) });
    expect(hangups).toEqual([[stale.id, 200]]);
    expect(hangupCalls(fetchImpl)[0][0]).toBe(`https://gw.test/live/sessions/${stale.gatewaySessionId}/hangup`);
  });

  it("relay gagal → 502 VOICE_UPSTREAM_FAILED, baris start_failed tidak ditagih, log tanpa SDP/kunci", async () => {
    const fetchImpl = vi.fn(async () => new Response("secret body", { status: 500 }));
    const { deps, rows, hangups } = makeDeps({ fetchImpl });
    expect(await start(deps)).toMatchObject({ ok: false, status: 502, code: "VOICE_UPSTREAM_FAILED" });
    expect([...rows.values()]).toEqual([expect.objectContaining({ status: "ended", endReason: "start_failed", billedSeconds: 0 })]);
    expect(hangups).toEqual([]);
    const logged = JSON.stringify(vi.mocked(console.warn).mock.calls);
    expect(logged).toContain("500");
    for (const secret of ["sk-secret", "secret body", "v=0"]) expect(logged).not.toContain(secret);
  });

  it("model slot suara tidak valid → 422 VOICE_INVALID_INPUT tanpa relay", async () => {
    const { deps, fetchImpl } = makeDeps({ rt: runtime({ provider: { baseUrl: "https://gw.test", apiKey: "k", model: "-bad model" } }) });
    expect(await start(deps)).toMatchObject({ status: 422, code: "VOICE_INVALID_INPUT" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("dua tab berebut: sesi tertua menang, baris baru ditutup duplicate (0 detik) tanpa relay", async () => {
    const ctx = makeDeps();
    const create = ctx.repo.createSession;
    ctx.repo.createSession = async (input) => {
      const created = await create(input);
      const older = row({ sessionHash: "sess-a", status: "starting", gatewaySessionId: null, startedAt: at(-1) });
      ctx.rows.set(older.id, older);
      return created;
    };
    expect(await start(ctx.deps)).toMatchObject({ ok: false, status: 409, code: "VOICE_SESSION_ACTIVE" });
    expect(ctx.fetchImpl).not.toHaveBeenCalled();
    expect([...ctx.rows.values()].find((r) => r.id.startsWith("voice"))).toMatchObject({ endReason: "duplicate", billedSeconds: 0 });
  });

  it("baris ditutup selama relay → sesi gateway baru di-hangup, 409 VOICE_SESSION_ENDED", async () => {
    const ctx = makeDeps();
    const base = gatewayFetch();
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      if (!url.endsWith("/hangup")) for (const r of ctx.rows.values()) Object.assign(r, { status: "ended", endedAt: NOW, endReason: "disabled" });
      return base(url, init);
    });
    ctx.deps.fetchImpl = fetchImpl;
    expect(await start(ctx.deps)).toMatchObject({ ok: false, status: 409, code: "VOICE_SESSION_ENDED" });
    expect(hangupCalls(fetchImpl)[0][0]).toBe(`https://gw.test/live/sessions/${GW}/hangup`);
    expect(ctx.hangups).toHaveLength(1);
  });
});

describe("startVoiceSession — kuota hari ini (WIB)", () => {
  it.each([
    ["sesi", [closedRow({ sessionHash: "sess-a", ipHash: "ip-z", billedSeconds: 300 })]],
    ["IP (sesi anonim lain)", [closedRow({ sessionHash: "sess-z", ipHash: "ip-a", billedSeconds: 300 })]],
    ["IP termasuk sesi berjalan", [row({ sessionHash: "sess-z", ipHash: "ip-a", startedAt: at(-300), lastHeartbeatAt: at(-5), maxSeconds: 600 })]],
  ])("kuota %s habis → 429 VOICE_QUOTA_EXHAUSTED sampai tengah malam WIB", async (_label, seed) => {
    const { deps, fetchImpl } = makeDeps({ seed });
    const out = await start(deps);
    expect(out).toEqual({
      ok: false,
      status: 429,
      code: "VOICE_QUOTA_EXHAUSTED",
      message: expect.any(String),
      retryAfterSec: secondsUntilJakartaMidnight(NOW),
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("kuota global termasuk sesi berjalan pengunjung lain", async () => {
    const seed = [row({ startedAt: at(-60), lastHeartbeatAt: at(-5) })];
    const { deps } = makeDeps({ seed, rt: runtime({}, { voiceDailyMinutesGlobal: 1 }) });
    expect(await start(deps)).toMatchObject({ status: 429, code: "VOICE_QUOTA_EXHAUSTED" });
  });

  it("pemakaian kemarin (sebelum 00:00 WIB) tidak dihitung; sisa = minimum sesi/IP/global", async () => {
    const yesterday = new Date("2026-11-13T16:59:00.000Z"); // 23:59 WIB
    const seed = [
      closedRow({ sessionHash: "sess-a", ipHash: "ip-a", startedAt: yesterday, endedAt: yesterday, billedSeconds: 300 }),
      closedRow({ sessionHash: "sess-a", ipHash: "ip-a", billedSeconds: 100 }),
    ];
    const { deps } = makeDeps({ seed });
    expect(await start(deps)).toMatchObject({ ok: true, value: { remainingTodaySeconds: 200 } });
  });
});

describe("heartbeatVoiceSession", () => {
  it("sesi milik sesi anonim lain / tidak ada → 404", async () => {
    const { deps, id } = await started();
    expect(await heartbeatVoiceSession({ sessionHash: "sess-b", ipHash: "ip-a" }, id, deps)).toMatchObject({ status: 404, code: "VOICE_SESSION_NOT_FOUND" });
    expect(await heartbeatVoiceSession(who, "voicesession9999999999", deps)).toMatchObject({ status: 404 });
  });

  it("normal → stop null, detik dari jam server, heartbeat diperbarui", async () => {
    const { deps, id, clock, rows } = await started();
    clock.now = at(30);
    expect(await heartbeatVoiceSession(who, id, deps)).toEqual({
      ok: true,
      value: { elapsedSeconds: 30, maxSeconds: 300, remainingTodaySeconds: 270, stop: null },
    });
    expect(rows.get(id)?.lastHeartbeatAt).toEqual(at(30));
  });

  it("lewat batas durasi → stop max_duration, ditagih maksimal, hangup", async () => {
    const { deps, id, clock, rows, hangups } = await started({ rt: runtime({}, { voiceDailyMinutesUser: 10 }) });
    clock.now = at(310);
    rows.get(id)!.lastHeartbeatAt = at(300);
    expect(await heartbeatVoiceSession(who, id, deps)).toMatchObject({ ok: true, value: { stop: "max_duration", elapsedSeconds: 310 } });
    expect(rows.get(id)).toMatchObject({ status: "ended", endReason: "max_duration", billedSeconds: 300 });
    expect(hangups).toEqual([[id, 200]]);
  });

  it("kuota harian habis selama sesi → stop quota + hangup", async () => {
    const seed = [closedRow({ sessionHash: "sess-a", ipHash: "ip-a", billedSeconds: 280 })];
    const { deps, id, clock, rows, hangups } = await started({ seed });
    clock.now = at(20);
    expect(await heartbeatVoiceSession(who, id, deps)).toMatchObject({ ok: true, value: { stop: "quota", remainingTodaySeconds: 0 } });
    expect(rows.get(id)).toMatchObject({ endReason: "quota", billedSeconds: 20 });
    expect(hangups).toHaveLength(1);
  });

  it("basi → stop ended, ditagih sampai heartbeat terakhir", async () => {
    const { deps, id, clock, rows, hangups } = await started();
    clock.now = at(90);
    expect(await heartbeatVoiceSession(who, id, deps)).toMatchObject({ ok: true, value: { stop: "ended", elapsedSeconds: 0 } });
    expect(rows.get(id)).toMatchObject({ endReason: "stale", billedSeconds: 0, endedAt: NOW });
    expect(hangups).toHaveLength(1);
  });

  it("suara dimatikan admin → stop ended (disabled) + hangup; sesi yang sudah tutup → ended tanpa hangup lagi", async () => {
    const ctx = await started();
    ctx.clock.now = at(10);
    vi.mocked(ctx.deps.loadRuntime).mockResolvedValue(runtime({}, { voiceEnabled: false }));
    expect(await heartbeatVoiceSession(who, ctx.id, ctx.deps)).toMatchObject({ ok: true, value: { stop: "ended", elapsedSeconds: 10 } });
    expect(ctx.rows.get(ctx.id)).toMatchObject({ endReason: "disabled", billedSeconds: 10 });
    expect(await heartbeatVoiceSession(who, ctx.id, ctx.deps)).toMatchObject({ ok: true, value: { stop: "ended", elapsedSeconds: 10 } });
    expect(ctx.hangups).toHaveLength(1);
  });
});

describe("closeVoiceSession", () => {
  it("tagih waktu nyata, idempoten (hangup sekali), sesi lain → 404", async () => {
    const { deps, id, clock, rows, hangups } = await started();
    clock.now = at(42);
    expect(await closeVoiceSession(who, id, "user", deps)).toEqual({ ok: true, value: { billedSeconds: 42 } });
    expect(rows.get(id)).toMatchObject({ status: "ended", endReason: "user", endedAt: at(42) });
    clock.now = at(100);
    expect(await closeVoiceSession(who, id, "pagehide", deps)).toEqual({ ok: true, value: { billedSeconds: 42 } });
    expect(hangups).toEqual([[id, 200]]);
    expect(await closeVoiceSession({ sessionHash: "sess-b", ipHash: "ip-a" }, id, "user", deps)).toMatchObject({ status: 404 });
  });

  it("hangup gagal jaringan → hangupStatus -1, penutupan tetap berhasil", async () => {
    const ctx = await started();
    ctx.deps.fetchImpl = vi.fn(async () => {
      throw new Error("ECONNRESET");
    });
    ctx.clock.now = at(5);
    expect(await closeVoiceSession(who, ctx.id, "error", ctx.deps)).toEqual({ ok: true, value: { billedSeconds: 5 } });
    expect(ctx.hangups).toEqual([[ctx.id, -1]]);
  });

  it("sesi basi ditutup klien → tagih sampai heartbeat terakhir", async () => {
    const { deps, id, clock, rows } = await started();
    clock.now = at(20);
    await heartbeatVoiceSession(who, id, deps);
    clock.now = at(200);
    expect(await closeVoiceSession(who, id, "user", deps)).toEqual({ ok: true, value: { billedSeconds: 20 } });
    expect(rows.get(id)).toMatchObject({ endReason: "stale" });
  });

  it("kalah balapan dengan jalur lain → laporkan tagihan tersimpan", async () => {
    const ctx = await started();
    ctx.clock.now = at(30);
    const closeSession = ctx.repo.closeSession;
    ctx.repo.closeSession = async (id) => {
      await closeSession(id, { endedAt: at(25), billedSeconds: 25, endReason: "max_duration" });
      return false;
    };
    expect(await closeVoiceSession(who, ctx.id, "user", ctx.deps)).toEqual({ ok: true, value: { billedSeconds: 25 } });
    expect(ctx.hangups).toEqual([]);
  });
});

describe("isVoiceSessionLive & isPublicVoiceEnabled", () => {
  it("hanya sesi aktif milik sessionHash, belum basi, belum lewat batas", async () => {
    const { deps, id, clock } = await started();
    expect(await isVoiceSessionLive("sess-a", id, deps)).toBe(true);
    expect(await isVoiceSessionLive("sess-b", id, deps)).toBe(false);
    expect(await isVoiceSessionLive("sess-a", "voicesession9999999999", deps)).toBe(false);
    clock.now = at(60);
    expect(await isVoiceSessionLive("sess-a", id, deps)).toBe(false);
  });

  it("starting, tertutup, dan lewat batas durasi → false", async () => {
    const starting = row({ sessionHash: "sess-a", status: "starting" });
    const ended = closedRow({ sessionHash: "sess-a" });
    const over = row({ sessionHash: "sess-a", startedAt: at(-301), lastHeartbeatAt: at(-1) });
    const { deps } = makeDeps({ seed: [starting, ended, over] });
    for (const r of [starting, ended, over]) expect(await isVoiceSessionLive("sess-a", r.id, deps)).toBe(false);
  });

  it("voiceEnabled publik: runtime siap dan kuota global tersisa", async () => {
    expect(await isPublicVoiceEnabled(makeDeps().deps)).toBe(true);
    expect(await isPublicVoiceEnabled(makeDeps({ rt: runtime({}, { voiceEnabled: false }) }).deps)).toBe(false);
    expect(await isPublicVoiceEnabled(makeDeps({ rt: runtime({ provider: null }) }).deps)).toBe(false);
    const used = [closedRow({ billedSeconds: 60 })];
    expect(await isPublicVoiceEnabled(makeDeps({ seed: used, rt: runtime({}, { voiceDailyMinutesGlobal: 1 }) }).deps)).toBe(false);
  });
});

describe("sweepVoiceSessions", () => {
  it("tanpa sesi terbuka → 0, runtime tidak dimuat", async () => {
    const { deps } = makeDeps({ seed: [closedRow({})] });
    expect(await sweepVoiceSessions(deps)).toBe(0);
    expect(deps.loadRuntime).not.toHaveBeenCalled();
  });

  it("tutup sesi basi & lewat batas (dengan hangup), sesi sehat dibiarkan", async () => {
    const stale = row({ startedAt: at(-100), lastHeartbeatAt: at(-50) });
    const over = row({ startedAt: at(-305), lastHeartbeatAt: at(-3) });
    const fresh = row({ startedAt: at(-30), lastHeartbeatAt: at(-3) });
    const { deps, rows, hangups } = makeDeps({ seed: [stale, over, fresh] });
    expect(await sweepVoiceSessions(deps)).toBe(2);
    expect(rows.get(stale.id)).toMatchObject({ endReason: "stale", billedSeconds: 50 });
    expect(rows.get(over.id)).toMatchObject({ endReason: "max_duration", billedSeconds: 300 });
    expect(rows.get(fresh.id)).toMatchObject({ status: "active", endedAt: null });
    expect(hangups.map(([id]) => id).sort()).toEqual([stale.id, over.id].sort());
  });

  it("suara dimatikan → semua sesi ditutup disabled", async () => {
    const seed = [row({ startedAt: at(-10) }), row({ startedAt: at(-20) })];
    const { deps, rows } = makeDeps({ seed, rt: runtime({}, { voiceEnabled: false }) });
    expect(await sweepVoiceSessions(deps)).toBe(2);
    expect([...rows.values()].map((r) => r.endReason)).toEqual(["disabled", "disabled"]);
  });

  it("kuota global habis (termasuk sesi berjalan) → ditutup quota", async () => {
    const seed = [row({ startedAt: at(-40), lastHeartbeatAt: at(-2) }), row({ startedAt: at(-30), lastHeartbeatAt: at(-2) })];
    const { deps, rows } = makeDeps({ seed, rt: runtime({}, { voiceDailyMinutesGlobal: 1 }) });
    expect(await sweepVoiceSessions(deps)).toBe(2);
    expect([...rows.values()].map((r) => [r.endReason, r.billedSeconds])).toEqual([["quota", 40], ["quota", 30]]);
  });

  it("provider suara hilang → sesi tetap ditutup, hangup dilewati dengan peringatan", async () => {
    const seed = [row({ startedAt: at(-305), lastHeartbeatAt: at(-3) })];
    const { deps, hangups, fetchImpl } = makeDeps({ seed, rt: runtime({ provider: null }) });
    expect(await sweepVoiceSessions(deps)).toBe(1);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(hangups).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("hangup dilewati"), { sessionId: seed[0].id });
  });
});

describe("startJennaVoiceSweeper", () => {
  const setup = (env: Record<string, string | undefined>) => {
    const unref = vi.fn();
    const setIntervalMock = vi.fn<(fn: () => void, ms: number) => { unref: () => void }>(() => ({ unref }));
    const store: { __jennaVoiceSweeper?: boolean } = {};
    return { unref, setIntervalMock, store, env };
  };

  it("hanya production (bukan saat build), sekali per proses, interval 15 detik, unref", () => {
    const dev = setup({ NODE_ENV: "development" });
    expect(startJennaVoiceSweeper({ run: vi.fn(), env: dev.env, timers: { setInterval: dev.setIntervalMock }, store: dev.store })).toBe(false);
    const build = setup({ NODE_ENV: "production", NEXT_PHASE: "phase-production-build" });
    expect(startJennaVoiceSweeper({ run: vi.fn(), env: build.env, timers: { setInterval: build.setIntervalMock }, store: build.store })).toBe(false);

    const prod = setup({ NODE_ENV: "production" });
    const opts = { run: vi.fn(), env: prod.env, timers: { setInterval: prod.setIntervalMock }, store: prod.store };
    expect(startJennaVoiceSweeper(opts)).toBe(true);
    expect(startJennaVoiceSweeper(opts)).toBe(false);
    expect(prod.setIntervalMock).toHaveBeenCalledTimes(1);
    expect(prod.setIntervalMock.mock.calls[0][1]).toBe(15_000);
    expect(prod.unref).toHaveBeenCalled();
  });

  it("sweep tidak tumpang tindih; galat dicatat dan putaran berikutnya tetap jalan", async () => {
    const prod = setup({ NODE_ENV: "production" });
    let release: () => void = () => {};
    const run = vi
      .fn<() => Promise<unknown>>()
      .mockImplementationOnce(() => new Promise<void>((resolve) => (release = resolve)))
      .mockRejectedValueOnce(new Error("db down"))
      .mockResolvedValue(0);
    startJennaVoiceSweeper({ run, env: prod.env, timers: { setInterval: prod.setIntervalMock }, store: prod.store });
    const tick = prod.setIntervalMock.mock.calls[0][0];

    tick();
    tick();
    expect(run).toHaveBeenCalledTimes(1);
    release();
    await vi.waitFor(() => {
      tick();
      expect(run).toHaveBeenCalledTimes(2);
    });
    await vi.waitFor(() => expect(console.error).toHaveBeenCalled());
    await vi.waitFor(() => {
      tick();
      expect(run).toHaveBeenCalledTimes(3);
    });
  });
});
