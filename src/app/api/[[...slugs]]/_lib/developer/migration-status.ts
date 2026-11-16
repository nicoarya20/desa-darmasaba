import fs from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import type { SystemOverviewResponse } from "@/lib/jenna/types";

export type MigrationStatus = SystemOverviewResponse["migrations"];
export type MigrationRow = { migration_name: string; finished_at: Date | null; rolled_back_at: Date | null };

/** Folder migrasi vs baris `_prisma_migrations`. Baris rolled back diabaikan; folder gagal tidak dihitung tertunda. */
export function diffMigrations(folders: readonly string[], rows: readonly MigrationRow[]): MigrationStatus {
  const active = rows.filter((r) => r.rolled_back_at === null);
  const succeeded = active.flatMap((r) => (r.finished_at ? [{ name: r.migration_name, at: r.finished_at }] : []));
  const appliedNames = new Set(succeeded.map((r) => r.name));
  const failed = [
    ...new Set(active.filter((r) => r.finished_at === null && !appliedNames.has(r.migration_name)).map((r) => r.migration_name)),
  ].sort();
  const failedNames = new Set(failed);
  const sortedFolders = [...folders].sort();

  let latest: (typeof succeeded)[number] | null = null;
  for (const r of succeeded) {
    if (!latest || r.at.getTime() > latest.at.getTime()) latest = r;
  }

  return {
    ok: true,
    total: sortedFolders.length,
    applied: sortedFolders.filter((f) => appliedNames.has(f)).length,
    pending: sortedFolders.filter((f) => !appliedNames.has(f) && !failedNames.has(f)),
    failed,
    latestApplied: latest?.name ?? null,
    latestAppliedAt: latest?.at.toISOString() ?? null,
  };
}

export async function readMigrationStatus(): Promise<MigrationStatus> {
  let folders: string[];
  try {
    const entries = await fs.readdir(path.join(process.cwd(), "prisma/migrations"), { withFileTypes: true });
    folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch (err) {
    console.warn("[developer/system] gagal membaca folder prisma/migrations:", err);
    return { ok: false, error: "Folder migrasi tidak ditemukan di server." };
  }

  try {
    const rows = await prisma.$queryRaw<MigrationRow[]>`
      SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations"`;
    return diffMigrations(folders, rows);
  } catch (err) {
    // Pesan generik: error driver bisa memuat host/kredensial koneksi.
    console.warn("[developer/system] gagal membaca tabel _prisma_migrations:", err);
    return { ok: false, error: "Gagal membaca riwayat migrasi dari database." };
  }
}
