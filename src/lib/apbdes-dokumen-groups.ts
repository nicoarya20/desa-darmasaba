// Pengelompokan dokumen APBDes untuk tampilan (panel publik & detail admin) — murni, tanpa I/O.
import { FOLDER_UMUM_KEY, FOLDER_UMUM_LABEL } from "./desa-anti-korupsi-folder";

/** Judul cadangan berkas lama bila APBDes tidak bernama. */
export const APBDES_DOKUMEN_JUDUL_DEFAULT = "Dokumen APBDes";

/** Satu dokumen siap tampil: judul + tautan unduh. */
export type ApbdesDokumenTautan = { id: string; judul: string; link: string; mimeType: string | null };

/** Satu kelompok tampilan: folder nyata (key = id folder) atau folder virtual "Umum" (key = "umum"). */
export type ApbdesDokumenGroup = { key: string; nama: string; dokumen: ApbdesDokumenTautan[] };

type DokumenSumber = { id: string; judul: string; file: { link: string; mimeType?: string | null } };

/** Bagian data APBDes (respons API) yang dibutuhkan; `folders`/`dokumenUmum` kosong pada payload lama. */
export type ApbdesDokumenSumber = {
  name?: string | null;
  folders?: readonly { id: string; nama: string; dokumen: readonly DokumenSumber[] }[];
  dokumenUmum?: readonly DokumenSumber[];
  file?: { id: string; link: string; name?: string } | null;
};

const toTautan = (d: DokumenSumber): ApbdesDokumenTautan => ({
  id: d.id,
  judul: d.judul,
  link: d.file.link,
  mimeType: d.file.mimeType ?? null,
});

/**
 * Kelompok dokumen APBDes: "Umum" dulu, lalu folder sesuai urutan API; kelompok kosong disembunyikan.
 * Bila tidak ada dokumen sama sekali tapi berkas lama `file` ada (data sebelum migrasi / klien lama),
 * berkas itu tampil sebagai satu dokumen di "Umum".
 */
export function apbdesDokumenGroups(apbdes: ApbdesDokumenSumber): ApbdesDokumenGroup[] {
  const groups: ApbdesDokumenGroup[] = [
    { key: FOLDER_UMUM_KEY, nama: FOLDER_UMUM_LABEL, dokumen: (apbdes.dokumenUmum ?? []).map(toTautan) },
    ...(apbdes.folders ?? []).map((f) => ({ key: f.id, nama: f.nama, dokumen: f.dokumen.map(toTautan) })),
  ].filter((g) => g.dokumen.length > 0);
  if (groups.length > 0) return groups;

  const legacy = apbdes.file;
  if (!legacy?.link) return [];
  const judul = apbdes.name?.trim() || legacy.name?.trim() || APBDES_DOKUMEN_JUDUL_DEFAULT;
  return [
    { key: FOLDER_UMUM_KEY, nama: FOLDER_UMUM_LABEL, dokumen: [{ id: legacy.id, judul, link: legacy.link, mimeType: null }] },
  ];
}

/** Judul kelompok hanya perlu tampil bila ada folder nyata (bukan cuma "Umum"). */
export function showGroupTitles(groups: readonly ApbdesDokumenGroup[]): boolean {
  return groups.some((g) => g.key !== FOLDER_UMUM_KEY);
}
