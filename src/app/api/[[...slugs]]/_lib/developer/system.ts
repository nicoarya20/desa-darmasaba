import fs from "fs/promises";
import path from "path";
import type { Context } from "elysia";
import prisma from "@/lib/prisma";
import minioClient, { MINIO_BUCKET } from "@/lib/minio";
import { env } from "@/lib/env";
import { getJennaReadiness } from "@/lib/jenna/service";
import type { ApiResult, ServiceStatus, SystemOverviewResponse } from "@/lib/jenna/types";
import { buildEnvChecklist } from "./env-checklist";
import { requireDeveloper } from "./guard";

const PING_TIMEOUT_MS = 5000;

async function ping(run: () => Promise<unknown>, failMessage: string): Promise<ServiceStatus> {
  const started = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      run(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), PING_TIMEOUT_MS);
      }),
    ]);
    return { ok: true, latencyMs: Date.now() - started, error: null };
  } catch (err) {
    // Pesan generik: error driver bisa memuat host/kredensial koneksi.
    const timedOut = err instanceof Error && err.message === "timeout";
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: timedOut ? `Tidak merespons dalam ${PING_TIMEOUT_MS / 1000} detik.` : failMessage,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function pingMinio(): Promise<ServiceStatus> {
  if (!MINIO_BUCKET) return { ok: false, latencyMs: 0, error: "MINIO_BUCKET belum diset." };
  return ping(async () => {
    if (!(await minioClient.bucketExists(MINIO_BUCKET))) throw new Error("bucket-missing");
  }, "Gagal terhubung ke MinIO atau bucket tidak ditemukan.");
}

async function readVersion(): Promise<string> {
  const pkg = JSON.parse(await fs.readFile(path.join(process.cwd(), "package.json"), "utf-8")) as { version: string };
  return pkg.version;
}

export async function systemOverviewGet(context: Context): Promise<ApiResult<SystemOverviewResponse>> {
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const [version, database, minio, jenna] = await Promise.all([
    readVersion(),
    ping(() => prisma.$queryRaw`SELECT 1`, "Gagal terhubung ke database."),
    pingMinio(),
    getJennaReadiness(),
  ]);

  return {
    success: true,
    data: {
      version,
      nodeEnv: env.NODE_ENV,
      uptimeSec: Math.floor(process.uptime()),
      database,
      minio: { ...minio, bucket: MINIO_BUCKET },
      env: buildEnvChecklist((name) => process.env[name]),
      jenna,
      generatedAt: new Date().toISOString(),
    },
  };
}
