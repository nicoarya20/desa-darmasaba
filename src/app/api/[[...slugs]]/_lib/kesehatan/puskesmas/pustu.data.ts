import { Prisma } from "@prisma/client";
import { bacaMediaSosial } from "@/lib/konten-bersama/media-sosial.validation";
import { MAX_FOTO_PUSTU, MAX_PENGURUS_PUSTU, bacaJadwal, bacaLayananUnggulan, type PustuBody } from "@/lib/pustu/pustu.validation";
import { htmlToPlainText } from "@/lib/rich-text";
import { sanitizeRichTextForStorage } from "@/lib/rich-text-server";
import { GALERI_SELECT, PENGURUS_SELECT, URUTAN_ANAK } from "../../_konten-bersama/daftar-anak.config";

/** Nama model untuk konteks log hapus berkas PUSTU. */
export const PUSTU_FILE_OWNER = "Puskesmas";

const GAMBAR = { select: { id: true, name: true, link: true } } as const;

/** Field daftar PUSTU (find-many ringan: tanpa teks panjang, galeri, dan pengurus). */
export const PUSTU_RINGKAS_SELECT = {
  id: true,
  name: true,
  alamat: true,
  imageId: true,
  image: GAMBAR,
  jam: { select: { jadwal: true } },
  kontak: { select: { kontakPuskesmas: true, email: true, kontakUGD: true } },
} satisfies Prisma.PuskesmasSelect;

/** Field detail PUSTU (find-unique: halaman publik + form edit admin). */
export const PUSTU_DETAIL_SELECT = {
  ...PUSTU_RINGKAS_SELECT,
  mediaSosial: true,
  layananUnggulan: true,
  linkPetunjukArah: true,
  prosedurPendaftaran: true,
  tarifBpjs: true,
  tarifUmum: true,
  fotoBaganStrukturId: true,
  fotoBaganStruktur: GAMBAR,
  pengurus: { select: PENGURUS_SELECT, orderBy: [...URUTAN_ANAK], take: MAX_PENGURUS_PUSTU },
  fotoKegiatan: { select: GALERI_SELECT, orderBy: [...URUTAN_ANAK], take: MAX_FOTO_PUSTU },
} satisfies Prisma.PuskesmasSelect;

type RingkasRow = Prisma.PuskesmasGetPayload<{ select: typeof PUSTU_RINGKAS_SELECT }>;
type DetailRow = Prisma.PuskesmasGetPayload<{ select: typeof PUSTU_DETAIL_SELECT }>;

/** Bentuk daftar untuk klien: jam operasional dibaca aman dari kolom Json. */
export function keRingkas({ jam, ...row }: RingkasRow) {
  return { ...row, jadwal: bacaJadwal(jam?.jadwal) };
}

/** Bentuk detail untuk klien: Json (jadwal, media sosial, layanan unggulan) dibaca aman, entri rusak dibuang. */
export function keDetail({ jam, ...row }: DetailRow) {
  return {
    ...row,
    jadwal: bacaJadwal(jam?.jadwal),
    mediaSosial: bacaMediaSosial(row.mediaSosial),
    layananUnggulan: bacaLayananUnggulan(row.layananUnggulan),
  };
}

/** Daftar Json kosong disimpan NULL; `undefined` = tidak diubah. */
function json(list: readonly Prisma.InputJsonObject[] | null | undefined) {
  if (list === undefined) return undefined;
  return list?.length ? list : Prisma.DbNull;
}

/** HTML editor → disanitasi (allowlist tag publik); isi kosong ("<p></p>") → null; `undefined` = tidak diubah. */
export function teksKayaTersimpan(html: string | null | undefined): string | null | undefined {
  if (html === undefined) return undefined;
  const bersih = html ? sanitizeRichTextForStorage(html) : "";
  return htmlToPlainText(bersih) === "" ? null : bersih;
}

// Relasi gambar ditulis sebagai input Prisma "checked" (connect/disconnect), bukan FK skalar, karena digabung
// dengan nested write jam/kontak dalam satu operasi — Prisma menolak campuran FK skalar + nested relasi.

/** Relasi gambar saat create: id → connect, kosong → tidak dihubungkan. */
export function hubungkanGambar(id: string | null | undefined) {
  return id ? { connect: { id } } : undefined;
}

/** Relasi gambar saat update: id → connect, null → disconnect, `undefined` → tidak diubah. */
export function ubahGambar(id: string | null | undefined) {
  if (id === undefined) return undefined;
  return id ? { connect: { id } } : { disconnect: true as const };
}

/** Data Prisma kolom skalar induk `Puskesmas` dari body tervalidasi (tanpa relasi gambar/jam/kontak). */
export function dataPustu(body: PustuBody) {
  return {
    name: body.name,
    alamat: body.alamat,
    mediaSosial: json(body.mediaSosial),
    layananUnggulan: json(body.layananUnggulan),
    linkPetunjukArah: body.linkPetunjukArah,
    prosedurPendaftaran: teksKayaTersimpan(body.prosedurPendaftaran),
    tarifBpjs: teksKayaTersimpan(body.tarifBpjs),
    tarifUmum: teksKayaTersimpan(body.tarifUmum),
  };
}

/** Data relasi `JamOperasional` (hanya kolom `jadwal`; kolom jam lama tidak ditulis lagi). */
export function dataJam(body: PustuBody) {
  return { jadwal: json(body.jadwal) };
}

/** Data relasi `KontakPuskesmas` (`facebook` lama tidak ditulis lagi: pindah ke media sosial). */
export function dataKontak(body: PustuBody) {
  const { kontakPuskesmas, email, kontakUGD } = body.kontak ?? {};
  return { kontakPuskesmas, email, kontakUGD };
}
