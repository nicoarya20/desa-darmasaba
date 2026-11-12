import type { Context } from "elysia";
import { parseSampahId } from "@/lib/sampah/sampah-item";
import { parseSampahKelompok, parseSampahListQuery } from "@/lib/sampah/sampah-query";
import { serveStoredFile } from "../../fileStorage/_lib/serveStoredFile";
import { guardSampah } from "./guard";
import { kosongkanSampah } from "./sampah.bulk";
import { listSampah } from "./sampah.list";
import { sampahSourceByKey } from "./sources";

const gagal = (set: Context["set"], status: number, message: string) => {
  set.status = status;
  return { success: false as const, message };
};

/** Sumber + ID entitas dari param `:id` ("file:<id>" / "<sumber>:<id>"); null bila format/sumber tidak dikenal. */
function resolveItem(rawId: string) {
  const parsed = parseSampahId(rawId);
  const source = parsed ? sampahSourceByKey(parsed.sumber) : undefined;
  return parsed && source ? { source, id: parsed.id } : null;
}

/** GET admin: daftar Sampah per kelompok + jumlah per kelompok, terbaru dihapus dulu, dipaging. */
export async function sampahList(context: Context) {
  const denied = await guardSampah(context.set);
  if (denied) return denied;
  const query = parseSampahListQuery(context.query as Record<string, unknown>);
  if (!query.ok) return gagal(context.set, 400, query.message);
  return { success: true as const, data: await listSampah({ ...query.value, now: new Date() }) };
}

/** POST admin: pulihkan satu item (berkas → pustaka file; dokumen → entitas asalnya). */
export async function sampahPulihkan(context: Context) {
  const denied = await guardSampah(context.set);
  if (denied) return denied;
  const item = resolveItem(context.params.id);
  if (!item) return gagal(context.set, 404, "Item tidak ada di Sampah");
  const result = await item.source.restore(item.id, new Date());
  if (!result.ok) return gagal(context.set, result.status, result.message);
  return { success: true as const, message: result.message };
}

/** DELETE admin: hapus permanen satu item (baris dulu, lalu berkas FileStorage + MinIO). */
export async function sampahHapus(context: Context) {
  const denied = await guardSampah(context.set);
  if (denied) return denied;
  const item = resolveItem(context.params.id);
  if (!item) return gagal(context.set, 404, "Item tidak ada di Sampah");
  const result = await item.source.destroy(item.id);
  if (!result.ok) return gagal(context.set, result.status, result.message);
  return { success: true as const, message: result.message };
}

/** DELETE admin: kosongkan Sampah satu kelompok (`kelompok` wajib; "semua" untuk seluruh Sampah). */
export async function sampahKosongkan(context: Context) {
  const denied = await guardSampah(context.set);
  if (denied) return denied;
  const kelompok = parseSampahKelompok((context.query as Record<string, unknown>)?.kelompok, null);
  if (!kelompok.ok) return gagal(context.set, 400, kelompok.message);
  const { dihapus, dilewati } = await kosongkanSampah(kelompok.value);
  const catatan = dilewati > 0 ? `; ${dilewati} item dilewati karena masih dipakai/gagal` : "";
  return { success: true as const, message: `${dihapus} item dihapus permanen${catatan}`, data: { dihapus } };
}

/** GET admin: isi berkas item Sampah untuk pratinjau (tidak di-cache; berkas di Sampah 404 di jalur publik). */
export async function sampahPratinjau(context: Context) {
  const denied = await guardSampah(context.set);
  if (denied) return denied;
  const item = resolveItem(context.params.id);
  const file = item ? await item.source.previewFile(item.id) : null;
  if (!file) return gagal(context.set, 404, "Berkas tidak ada di Sampah");
  return serveStoredFile(context, file, "private, no-store");
}
