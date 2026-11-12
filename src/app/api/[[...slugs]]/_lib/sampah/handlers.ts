import type { Context } from "elysia";
import { parseSampahListQuery } from "@/lib/sampah/sampah-query";
import { guardAdmin } from "../landing_page/desa-anti-korupsi/admin-guard";
import { listSampah } from "./sampah.list";
import { sampahSourceBySumber } from "./sources";

const PESAN_BUKAN_ADMIN = "Hanya admin yang boleh mengelola Sampah";

const gagal = (set: Context["set"], status: number, message: string) => {
  set.status = status;
  return { success: false as const, message };
};

/** Guard admin + sumber dari `:sumber`; body error (401/403/400) atau sumbernya. */
async function resolve(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_BUKAN_ADMIN);
  if (denied) return { error: denied };
  const source = sampahSourceBySumber(context.params.sumber);
  if (!source) return { error: gagal(context.set, 400, `Sumber Sampah tidak dikenal: ${context.params.sumber}`) };
  return { source };
}

/** GET admin: daftar Sampah satu fitur (scopeId wajib untuk sumber ber-scope), terbaru dihapus dulu, dipaging. */
export async function sampahList(context: Context) {
  const { error, source } = await resolve(context);
  if (!source) return error;
  const query = parseSampahListQuery(context.query as Record<string, unknown>);
  if (!query.ok) return gagal(context.set, 400, query.message);
  if (source.butuhScope && !query.value.scopeId) return gagal(context.set, 400, "Parameter scopeId wajib diisi");
  return { success: true as const, data: await listSampah(source, { ...query.value, now: new Date() }) };
}

/** POST admin: pulihkan satu item ke tempat asalnya (aturan domain sumber). */
export async function sampahPulihkan(context: Context) {
  const { error, source } = await resolve(context);
  if (!source) return error;
  const result = await source.restore(context.params.id, new Date());
  if (!result.ok) return gagal(context.set, result.status, result.message);
  return { success: true as const, message: result.message };
}

/** DELETE admin: hapus permanen satu item (baris dulu, lalu berkas FileStorage + MinIO bila tak dirujuk). */
export async function sampahHapus(context: Context) {
  const { error, source } = await resolve(context);
  if (!source) return error;
  const result = await source.destroy(context.params.id);
  if (!result.ok) return gagal(context.set, result.status, result.message);
  return { success: true as const, message: result.message };
}
