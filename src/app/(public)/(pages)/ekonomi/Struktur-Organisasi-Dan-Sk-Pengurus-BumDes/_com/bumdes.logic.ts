import { phoneInfo, type PhoneInfo } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';
import { displayName, initialsOf } from '@/app/(public)/_com/struktur-organisasi/struktur-person.logic';
import type { OrgNode } from '@/app/(public)/_com/struktur-organisasi/struktur.logic';
import { BUMDES_BASE_HREF } from './bumdes.meta';

/*
 * Logika murni halaman BUMDes: membaca respons API (profil, galeri, unit usaha, profil pengurus) menjadi data
 * siap tampil. Teks admin di sini teks polos (Textarea), bukan HTML editor, jadi tidak perlu sanitasi.
 */

type ImageApi = { link?: string | null } | null | undefined;

/** `GET /api/ekonomi/bumdes/profil` (`data: null` = admin belum mengisi). */
export type ProfilApi = {
  nama: string;
  deskripsi: string;
  alamat?: string | null;
  kontak?: string | null;
  tahunBerdiri?: number | null;
  image?: ImageApi;
};

/** Profil siap tampil; field kosong = null (barisnya tidak dirender). */
export type Profil = {
  nama: string;
  paragraphs: string[];
  tahunBerdiri: number | null;
  alamat: string | null;
  /** Nomor dari `kontak` bila isinya nomor telepon saja (tombol Telepon/WhatsApp). */
  phone: PhoneInfo | null;
  /** `kontak` yang bukan sekadar nomor (mis. email atau dua nomor) ditampilkan apa adanya. */
  kontakText: string | null;
  logo: string | null;
};

/** `GET /api/ekonomi/bumdes/profil/foto`. */
export type FotoApi = { id: string; keterangan?: string | null; image?: ImageApi };

/** Satu foto galeri (bentuk sama dengan data admin agar komponen galeri dipakai bersama test lama). */
export type GaleriFoto = { id: string; keterangan: string | null; image: { link: string } };

/** `GET /api/ekonomi/bumdes/unit-usaha/find-many`. */
export type UnitUsahaApi = { id: string; nama: string; deskripsi: string; urutan?: number | null; image?: ImageApi };

export type UnitUsaha = { id: string; nama: string; deskripsi: string; image: string | null };

/** `GET /api/ekonomi/struktur-organisasi/pegawai/:id` (field pribadi dari API sengaja tidak dibaca). */
export type PengurusApi = {
  namaLengkap: string;
  gelarAkademik?: string | null;
  isActive: boolean;
  image?: ImageApi;
  posisi?: { nama: string } | null;
};

/** Profil pengurus publik: hanya nama, jabatan, foto (keputusan user 2026-11-16). */
export type PengurusDetail = { nama: string; jabatan: string | null; foto: string | null; initials: string };

/** Dokumen BUMDes (SK pengurus, Perdes, AD/ART, laporan). Belum ada sumber data di backend. */
export type DokumenBumdes = { id: string; judul: string; keterangan: string | null; href: string };

/** Respons API umum `{ success, message, data }`. */
export type ApiBody<T> = { success?: boolean; message?: string; data?: T } | null | undefined;

const clean = (value?: string | null) => value?.trim() || null;
const linkOf = (image: ImageApi) => clean(image?.link);

// Kontak dianggap nomor bila hanya berisi angka dan tanda baca nomor telepon.
const PHONE_ONLY = /^[\d\s()+.-]+$/;

/** Teks polos admin → paragraf (baris kosong atau ganti baris memisahkan paragraf). */
export function toParagraphs(text?: string | null): string[] {
  return (text ?? '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function toProfil(item: ProfilApi): Profil {
  const kontak = clean(item.kontak);
  const phone = kontak && PHONE_ONLY.test(kontak) ? phoneInfo(kontak) : null;
  const tahun = item.tahunBerdiri;
  return {
    nama: item.nama.trim(),
    paragraphs: toParagraphs(item.deskripsi),
    tahunBerdiri: typeof tahun === 'number' && Number.isFinite(tahun) ? tahun : null,
    alamat: clean(item.alamat),
    phone,
    kontakText: phone ? null : kontak,
    logo: linkOf(item.image),
  };
}

/** Foto tanpa berkas (link kosong) dibuang; urutan dari API (sudah urut `urutan`). */
export function toGaleri(items: readonly FotoApi[]): GaleriFoto[] {
  return items.flatMap((item) => {
    const link = linkOf(item.image);
    return link ? [{ id: item.id, keterangan: clean(item.keterangan), image: { link } }] : [];
  });
}

/** Unit usaha urut `urutan` (kosong di belakang), sama dengan urutan admin; urutan sama tetap seperti API. */
export function toUnitUsaha(items: readonly UnitUsahaApi[]): UnitUsaha[] {
  const rank = (item: UnitUsahaApi) => (typeof item.urutan === 'number' ? item.urutan : Number.POSITIVE_INFINITY);
  return [...items]
    .sort((a, b) => rank(a) - rank(b))
    .map((item) => ({ id: item.id, nama: item.nama.trim(), deskripsi: item.deskripsi.trim(), image: linkOf(item.image) }));
}

/**
 * Profil pengurus publik. Pengurus nonaktif → null ("tidak ditemukan"). MITIGASI SEMENTARA(bumdes-pengurus):
 * `GET pegawai/:id` belum menyaring `isActive` (`_struktur-organisasi/pegawai.read.ts`); hapus cek ini bila API
 * sudah membalas 404 untuk pengurus nonaktif.
 */
export function toPengurusDetail(item: PengurusApi): PengurusDetail | null {
  if (!item.isActive) return null;
  const nama = displayName(item);
  return { nama, jabatan: clean(item.posisi?.nama), foto: linkOf(item.image), initials: initialsOf(item.namaLengkap) };
}

/** Jumlah pengurus di bagan (kotak "belum ditugaskan" tidak dihitung). */
export function countPengurus(nodes: readonly OrgNode[]): number {
  return nodes.reduce((sum, node) => sum + node.people.length + countPengurus(node.children), 0);
}

/** URL profil pengurus dari kartu bagan. */
export function pengurusHref(pegawaiId: string): string {
  return `${BUMDES_BASE_HREF}/${encodeURIComponent(pegawaiId)}`;
}

/** Baca respons satu objek: HTTP 200 + `success` → `data` (boleh null); selain itu Error berkonteks. */
export function readBody<T>(source: string, status: number, body: ApiBody<T | null>): T | null {
  if (status !== 200 || !body?.success) {
    throw new Error(`${source} gagal (HTTP ${status}): ${body?.message ?? 'respons tidak valid'}`);
  }
  return body.data ?? null;
}
