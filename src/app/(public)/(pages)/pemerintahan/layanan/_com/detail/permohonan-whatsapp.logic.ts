/** Logika murni tautan WhatsApp tindak lanjut permohonan surat keterangan (pesan hanya nama & jenis surat). */
import { buildWaUrl, normalizeWaNumber } from '@/app/(public)/(pages)/ekonomi/umkm/_lib/pesanan';
import { PETUGAS_LAYANAN_WA } from '@/con/layanan-whatsapp';
import { LAYANAN_DETAIL_TEXT as T } from './layanan-detail.text';

// Batas panjang bagian pesan: nama/kategori bisa sampai ribuan karakter di API, tautan wa.me harus tetap wajar.
const MAX_PART_LENGTH = 100;

/** Hanya field yang boleh masuk pesan; NIK, nomor KK, dan alamat sengaja tidak pernah dibaca. */
export type PermohonanWaInput = { nama: string; kategoriNama?: string | null };

/** Rapikan satu bagian pesan: spasi/baris baru beruntun jadi satu spasi, potong di batas panjang. */
const cleanPart = (value?: string | null) => (value ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_PART_LENGTH).trim();

/** Teks pesan WhatsApp (belum ter-encode). */
export function buildPermohonanWaMessage({ nama, kategoriNama }: PermohonanWaInput): string {
  return T.waPesan(cleanPart(nama), cleanPart(kategoriNama) || T.waKategoriDefault);
}

/** URL wa.me ke Petugas Layanan Desa dengan pesan awal; null bila nomor petugas tidak valid. */
export function buildPermohonanWaUrl(input: PermohonanWaInput): string | null {
  const waNumber = normalizeWaNumber(PETUGAS_LAYANAN_WA.nomor);
  return waNumber ? buildWaUrl(waNumber, buildPermohonanWaMessage(input)) : null;
}
