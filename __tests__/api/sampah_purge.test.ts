// @vitest-environment node
// Purge Sampah (hanya item > retensi, `now` diinjeksi, dryRun tidak menghapus, log hanya jumlah) dan scheduler
// in-app (sekali per proses, jeda awal lalu 24 jam, saklar env, error tidak membuat crash).
import { describe, it, expect, vi, beforeEach } from "vitest";

const { prismaMock, minioMock } = vi.hoisted(() => ({
  prismaMock: {
    fileStorage: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
    $queryRaw: vi.fn(),
    $queryRawUnsafe: vi.fn(),
  },
  minioMock: { removeObject: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: minioMock, MINIO_BUCKET: "bucket-test" }));

import { purgeSampah } from "@/app/api/[[...slugs]]/_lib/pengaturan/sampah/sampah.bulk";
import { fileSampahSource } from "@/app/api/[[...slugs]]/_lib/pengaturan/sampah/sources/file.source";
import type { SampahSource } from "@/app/api/[[...slugs]]/_lib/pengaturan/sampah/sources/types";
import { resetFileForeignKeysCache } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/fileReferences";
import {
  isSampahSchedulerEnabled,
  SAMPAH_PURGE_INTERVAL_MS,
  SAMPAH_PURGE_JEDA_AWAL_MS,
  startSampahScheduler,
} from "@/lib/sampah/sampah-scheduler";

const NOW = new Date("2026-12-31T00:00:00Z");
const HARI = 24 * 60 * 60 * 1000;

/** Sumber tiruan berisi item dengan umur tertentu (hari); `findIds` menghormati batas & cursor seperti DB. */
function fakeSource(key: string, umur: Record<string, number>, retensi = 30): SampahSource & { destroyed: string[] } {
  const destroyed: string[] = [];
  return {
    key,
    destroyed,
    retensiHari: () => retensi,
    countByKelompok: async () => ({}),
    list: async () => [],
    async findIds({ deletedBefore }, take, afterId) {
      return Object.entries(umur)
        .filter(([, h]) => !deletedBefore || NOW.getTime() - h * HARI < deletedBefore.getTime())
        .map(([id]) => id)
        .filter((id) => !afterId || id > afterId)
        .sort()
        .slice(0, take);
    },
    restore: async () => ({ ok: true, message: "" }),
    async destroy(id) {
      if (id === "dipakai") return { ok: false, status: 409, message: "masih dipakai" };
      destroyed.push(id);
      return { ok: true, message: "" };
    },
    previewFile: async () => null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  resetFileForeignKeysCache();
});

describe("purgeSampah", () => {
  it("hanya item yang lebih tua dari retensi sumbernya yang dihapus; log hanya jumlah", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const file = fakeSource("file", { baru: 29, pas: 30, lama: 31, dipakai: 40 });
    const dak = fakeSource("dak", { d1: 31, d2: 50 }, 45);
    const summary = await purgeSampah({ now: NOW }, [file, dak]);

    expect(file.destroyed).toEqual(["lama"]);
    expect(dak.destroyed).toEqual(["d2"]);
    expect(summary).toEqual({
      dryRun: false,
      kedaluwarsa: 3,
      dihapus: 2,
      dilewati: 1,
      perSumber: { file: { kedaluwarsa: 2, dihapus: 1, dilewati: 1 }, dak: { kedaluwarsa: 1, dihapus: 1, dilewati: 0 } },
    });
    expect(info).toHaveBeenCalledWith("[sampah] Purge selesai: kedaluwarsa=3 dihapus=2 dilewati=1");
    info.mockRestore();
  });

  it("dryRun hanya menghitung, tidak menghapus apa pun", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const file = fakeSource("file", { lama: 31, lebihLama: 90 });
    const summary = await purgeSampah({ now: NOW, dryRun: true }, [file]);
    expect(file.destroyed).toEqual([]);
    expect(summary).toMatchObject({ dryRun: true, kedaluwarsa: 2, dihapus: 0, dilewati: 0 });
    info.mockRestore();
  });

  it("paging cursor melewati batch penuh (100) tanpa memuat semua sekaligus", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const umur = Object.fromEntries(Array.from({ length: 250 }, (_, i) => [`f${String(i).padStart(3, "0")}`, 60]));
    const file = fakeSource("file", umur);
    const findIds = vi.spyOn(file, "findIds");
    expect((await purgeSampah({ now: NOW }, [file])).dihapus).toBe(250);
    expect(findIds).toHaveBeenCalledTimes(3);
    expect(findIds.mock.calls.every(([, take]) => take === 100)).toBe(true);
    info.mockRestore();
  });

  it("sumber berkas nyata: filter deletedAt < now − 30 hari, hapus baris lalu MinIO", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    prismaMock.$queryRaw.mockResolvedValue([]);
    prismaMock.fileStorage.findMany.mockResolvedValueOnce([{ id: "f1" }]);
    prismaMock.fileStorage.findFirst.mockResolvedValueOnce({ id: "f1" });
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ path: "image", name: "a.webp" });

    expect(await purgeSampah({ now: NOW }, [fileSampahSource])).toMatchObject({ dihapus: 1 });
    const where = prismaMock.fileStorage.findMany.mock.calls[0][0].where;
    expect(where.deletedAt).toEqual({ lt: new Date(NOW.getTime() - 30 * HARI) });
    expect(prismaMock.fileStorage.delete).toHaveBeenCalledWith({ where: { id: "f1" } });
    expect(minioMock.removeObject).toHaveBeenCalledWith("bucket-test", "image/a.webp");
    info.mockRestore();
  });

  it("error satu item dicatat dengan konteks dan purge berlanjut", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const file = fakeSource("file", { a: 40, b: 40 });
    file.destroy = vi.fn(async (id: string) => {
      if (id === "a") throw new Error("db down");
      return { ok: true as const, message: "" };
    });
    expect(await purgeSampah({ now: NOW }, [file])).toMatchObject({ dihapus: 1, dilewati: 1 });
    expect(String(err.mock.calls[0][0])).toContain("file:a");
    info.mockRestore();
    err.mockRestore();
  });
});

describe("scheduler in-app", () => {
  const timers = () => {
    const calls: { kind: string; ms: number; fn: () => void }[] = [];
    return {
      calls,
      setTimeout: (fn: () => void, ms: number) => (calls.push({ kind: "timeout", ms, fn }), undefined),
      setInterval: (fn: () => void, ms: number) => (calls.push({ kind: "interval", ms, fn }), undefined),
    };
  };

  it("saklar: default on hanya di production; env on/off menang; mati saat next build", () => {
    expect(isSampahSchedulerEnabled({ NODE_ENV: "production" })).toBe(true);
    expect(isSampahSchedulerEnabled({ NODE_ENV: "development" })).toBe(false);
    expect(isSampahSchedulerEnabled({ NODE_ENV: "test" })).toBe(false);
    expect(isSampahSchedulerEnabled({ NODE_ENV: "development", SAMPAH_PURGE_SCHEDULER: "on" })).toBe(true);
    expect(isSampahSchedulerEnabled({ NODE_ENV: "production", SAMPAH_PURGE_SCHEDULER: "OFF" })).toBe(false);
    expect(isSampahSchedulerEnabled({ NODE_ENV: "production", NEXT_PHASE: "phase-production-build" })).toBe(false);
  });

  it("jeda awal lalu tiap 24 jam; dipasang sekali per proses (hot reload aman)", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const t = timers();
    const store = {};
    const run = vi.fn(async () => undefined);
    const env = { NODE_ENV: "production" };
    expect(startSampahScheduler({ run, env, timers: t, store })).toBe(true);
    expect(startSampahScheduler({ run, env, timers: t, store })).toBe(false);
    expect(t.calls).toEqual([{ kind: "timeout", ms: SAMPAH_PURGE_JEDA_AWAL_MS, fn: expect.any(Function) }]);

    t.calls[0].fn();
    expect(run).toHaveBeenCalledTimes(1);
    expect(t.calls[1]).toMatchObject({ kind: "interval", ms: SAMPAH_PURGE_INTERVAL_MS });
    t.calls[1].fn();
    expect(run).toHaveBeenCalledTimes(2);
    info.mockRestore();
  });

  it("scheduler mati → tidak memasang timer; purge gagal → dicatat, tidak melempar", async () => {
    const t = timers();
    expect(startSampahScheduler({ run: vi.fn(), env: { NODE_ENV: "test" }, timers: t, store: {} })).toBe(false);
    expect(t.calls).toEqual([]);

    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const run = vi.fn(async () => {
      throw new Error("db down");
    });
    startSampahScheduler({ run, env: { SAMPAH_PURGE_SCHEDULER: "on" }, timers: t, store: {} });
    expect(() => t.calls[0].fn()).not.toThrow();
    await vi.waitFor(() => expect(err).toHaveBeenCalled());
    expect(String(err.mock.calls[0][0])).toContain("Purge terjadwal gagal");
    info.mockRestore();
    err.mockRestore();
  });
});
