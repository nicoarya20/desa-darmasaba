import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { toJenisLayananList, type AdministrasiValues, type JenisLayanan, type JenisLayananApiItem } from "./administrasi.logic";
import { JENIS_LAYANAN_LIMIT } from "./administrasi.meta";

/** Jenis layanan aktif untuk dropdown & daftar di kolom kiri (urut abjad). */
export async function loadJenisLayanan(): Promise<JenisLayanan[]> {
  const res = await ApiFetch.api.inovasi.layananonlinedesa.administrasionline.jenislayanan["find-many"].get({
    query: { page: 1, limit: JENIS_LAYANAN_LIMIT },
  });
  return toJenisLayananList(readFindMany<JenisLayananApiItem>("jenis layanan", res.status, res.data as FindManyBody));
}

type CreateBody = { success?: boolean; message?: string } | null | undefined;

/**
 * Kirim satu pengajuan (endpoint publik, tanpa login). Sengaja tidak memuat ulang daftar pengajuan seperti state admin:
 * daftar itu berisi data warga lain. Gagal → Error berkonteks (tanpa isi formulir).
 */
export async function submitAdministrasi(payload: AdministrasiValues): Promise<void> {
  const res = await ApiFetch.api.inovasi.layananonlinedesa.administrasionline.create.post(payload);
  const body = res.data as CreateBody;
  if (res.status !== 200 || !body?.success) {
    throw new Error(`kirim administrasi online gagal (HTTP ${res.status}): ${body?.message ?? "respons tidak valid"}`);
  }
}
