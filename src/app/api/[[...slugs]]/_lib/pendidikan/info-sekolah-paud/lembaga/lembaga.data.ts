import { Prisma } from "@prisma/client";
import {
  MAX_FOTO_KEGIATAN_LEMBAGA,
  MAX_PENGURUS_LEMBAGA,
  type LembagaCreateBody,
  type LembagaUpdateBody,
} from "@/lib/lembaga-pendidikan/lembaga.validation";
import { bacaMediaSosial } from "@/lib/konten-bersama/media-sosial.validation";
import { GALERI_SELECT, PENGURUS_SELECT, URUTAN_ANAK } from "../../../_konten-bersama/daftar-anak.config";
import { kolomMediaSosial } from "../../../_konten-bersama/media-sosial.data";

/** Nama model untuk konteks log hapus berkas lembaga. */
export const LEMBAGA_FILE_OWNER = "Lembaga";

/** Kolom berat yang tidak dikirim find-many (daftar tetap ringan; detail lewat find-unique). */
export const LEMBAGA_LIST_OMIT = { deskripsi: true, mediaSosial: true } as const;

const GAMBAR = { select: { id: true, name: true, link: true } } as const;
const AKTIF = { where: { isActive: true } } as const;

/**
 * Relasi detail untuk find-unique (halaman detail publik + admin). Siswa/pengajar hanya dihitung: nama siswa
 * adalah data anak dan endpoint ini publik (dulu mengirim daftar lengkap `siswa`/`pengajar`).
 */
export const LEMBAGA_DETAIL_INCLUDE = {
  jenjangPendidikan: { select: { id: true, nama: true } },
  fotoSekolah: GAMBAR,
  fotoBaganStruktur: GAMBAR,
  pengurus: { select: PENGURUS_SELECT, orderBy: [...URUTAN_ANAK], take: MAX_PENGURUS_LEMBAGA },
  fotoKegiatan: { select: GALERI_SELECT, orderBy: [...URUTAN_ANAK], take: MAX_FOTO_KEGIATAN_LEMBAGA },
  _count: { select: { siswa: AKTIF, pengajar: AKTIF } },
} satisfies Prisma.LembagaInclude;

type DetailRow = Prisma.LembagaGetPayload<{ include: typeof LEMBAGA_DETAIL_INCLUDE }>;

/** Bentuk detail untuk klien: media sosial dibaca aman (entri rusak dibuang). */
export function keDetail(row: DetailRow) {
  return { ...row, mediaSosial: bacaMediaSosial(row.mediaSosial) };
}

/** Data Prisma dari body tervalidasi: field `undefined` tidak disentuh, media sosial kosong disimpan NULL. */
export function dataLembaga<T extends LembagaCreateBody | LembagaUpdateBody>(body: T) {
  const { mediaSosial, ...kolom } = body;
  return { ...kolom, ...kolomMediaSosial(mediaSosial) };
}

/** ID berkas milik lembaga (foto sekolah + bagan) untuk pembersihan berkas yang dilepas. */
export function berkasLembaga(row: { fotoSekolahId?: string | null; fotoBaganStrukturId?: string | null }) {
  return [row.fotoSekolahId, row.fotoBaganStrukturId];
}
