import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  MAX_FOTO_KEGIATAN_BANK_SAMPAH,
  MAX_PENGURUS_BANK_SAMPAH,
  type BankSampahBody,
} from "@/lib/bank-sampah/bank-sampah.validation";
import { linkRuteKoordinat } from "@/lib/konten-bersama/lokasi.logic";
import { bacaMediaSosial } from "@/lib/konten-bersama/media-sosial.validation";
import { GALERI_SELECT, PENGURUS_SELECT, URUTAN_ANAK } from "../../../_konten-bersama/daftar-anak.config";

/** Nama model untuk konteks log hapus berkas bank sampah. */
export const BANK_SAMPAH_FILE_OWNER = "KeteranganBankSampahTerdekat";

/** Kolom berat yang tidak dikirim find-many (daftar tetap ringan; detail lewat find-unique). */
export const BANK_SAMPAH_LIST_OMIT = { deskripsi: true, mediaSosial: true } as const;

/** Relasi detail untuk find-unique (modal publik + admin): bagan, pengurus, galeri, inovasi aktif. */
export const BANK_SAMPAH_DETAIL_INCLUDE = {
  fotoBaganStruktur: { select: { id: true, name: true, link: true } },
  pengurus: { select: PENGURUS_SELECT, orderBy: [...URUTAN_ANAK], take: MAX_PENGURUS_BANK_SAMPAH },
  fotoKegiatan: { select: GALERI_SELECT, orderBy: [...URUTAN_ANAK], take: MAX_FOTO_KEGIATAN_BANK_SAMPAH },
  programInovasi: { where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } },
} satisfies Prisma.KeteranganBankSampahTerdekatInclude;

type DetailRow = Prisma.KeteranganBankSampahTerdekatGetPayload<{ include: typeof BANK_SAMPAH_DETAIL_INCLUDE }>;

/** Bentuk detail untuk klien: media sosial dibaca aman (entri rusak dibuang). */
export function keDetail(row: DetailRow) {
  return { ...row, mediaSosial: bacaMediaSosial(row.mediaSosial) };
}

/**
 * Data Prisma dari body tervalidasi. Link Google Maps kosong → rute ke koordinat (perilaku lama
 * `linkPetunjukArah`). Field detail `undefined` tidak disentuh; media sosial kosong disimpan NULL.
 */
export function dataBankSampah(body: BankSampahBody) {
  const { programInovasiIds, mediaSosial, linkPetunjukArah, fotoBaganStrukturId, ...dasar } = body;
  return {
    ...dasar,
    linkPetunjukArah: linkPetunjukArah || linkRuteKoordinat(body),
    ...(mediaSosial !== undefined && { mediaSosial: mediaSosial?.length ? mediaSosial : Prisma.DbNull }),
    ...(fotoBaganStrukturId !== undefined && { fotoBaganStrukturId }),
  };
}

/** True bila semua Program Inovasi yang dipilih ada dan aktif (dicek sebelum tulis agar 400 jelas). */
export async function inovasiValid(ids: readonly string[] | undefined): Promise<boolean> {
  if (!ids || ids.length === 0) return true;
  const jumlah = await prisma.programInovasi.count({ where: { id: { in: [...ids] }, isActive: true } });
  return jumlah === ids.length;
}

/** Pesan 400 bila sebagian Program Inovasi tidak ditemukan. */
export const PESAN_INOVASI_TIDAK_VALID = "Sebagian program inovasi tidak ditemukan atau sudah nonaktif";
