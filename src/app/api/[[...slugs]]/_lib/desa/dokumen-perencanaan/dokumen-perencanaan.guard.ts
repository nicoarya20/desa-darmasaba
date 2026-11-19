import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";

export const PESAN_DOKUMEN_PERENCANAAN_BUKAN_ADMIN = "Hanya admin yang boleh mengelola dokumen perencanaan";

/** beforeHandle mutasi (POST/PUT/DELETE): sesi aktif + role admin 0-4, selain itu 401/403; GET tetap publik. */
export async function guardDokumenPerencanaanAdmin({ set }: Pick<Context, "set">) {
  return (await guardAdmin(set, PESAN_DOKUMEN_PERENCANAAN_BUKAN_ADMIN)) ?? undefined;
}
