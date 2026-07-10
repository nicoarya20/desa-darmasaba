/* eslint-disable @typescript-eslint/no-explicit-any */

// Pure where-builder untuk endpoint agregat "Riwayat Kesehatan Warga".
// Relasi banjar tidak seragam antar-model:
//   - IbuHamil & Balita : banjar via relasi posyandu (Posyandu.banjarId)
//   - GrafikKepuasan    : banjar langsung (GrafikKepuasan.banjarId)
// Fungsi di sini murni (tanpa prisma) agar bisa dites tanpa mock & mudah diport.

// Banjar via relasi posyandu (IbuHamil, Balita).
// Bentuk verbatim dari ringkasan-kesehatan/stats.ts:17 — TANPA `is:`.
// Row dengan posyanduId=null otomatis terexclude saat banjar dipilih (data-correct).
export function banjarWhereViaPosyandu(banjarId: string) {
  return { posyandu: { banjarId } };
}

// Banjar langsung di row (GrafikKepuasan).
export function banjarWhereDirect(banjarId: string) {
  return { banjarId };
}

// Field yang bisa dicari per model — disamakan dengan find-many existing tiap domain.
export const searchFields = {
  ibuHamil: ["nama", "nik", "alamat"],
  balita: ["nama", "nik", "namaOrtu", "alamat"],
  penyakit: ["nama", "alamat", "jenisKelamin", "penyakit"],
} as const;

// Bangun klausa OR case-insensitive untuk pencarian.
// trim() verbatim dari buildUserWhere (user_where.ts) — search blank ('   ') → undefined.
export function orSearch(fields: readonly string[], search: string) {
  const term = search.trim();
  if (!term) return undefined;
  return fields.map((f) => ({ [f]: { contains: term, mode: "insensitive" } }));
}
