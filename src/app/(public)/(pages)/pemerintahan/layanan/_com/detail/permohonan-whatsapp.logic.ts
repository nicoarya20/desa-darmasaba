/** Logika murni tautan WhatsApp tindak lanjut permohonan surat keterangan (pesan hanya nama & jenis surat). */
import { buildWaUrl, normalizeWaNumber } from '@/app/(public)/(pages)/ekonomi/umkm/_lib/pesanan';
import { phoneInfo, type PhoneInfo } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';
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

/** Apakah `KontakDesa.whatsapp` (sumber tunggal nomor petugas) berupa nomor seluler yang bisa dipakai wa.me. */
export function hasPetugasWa(whatsapp?: string | null): boolean {
  return normalizeWaNumber(whatsapp) !== null;
}

/** URL wa.me ke Petugas Layanan Desa dengan pesan awal; null bila `whatsapp` kosong atau bukan nomor seluler valid. */
export function buildPermohonanWaUrl(input: PermohonanWaInput, whatsapp?: string | null): string | null {
  const waNumber = normalizeWaNumber(whatsapp);
  return waNumber ? buildWaUrl(waNumber, buildPermohonanWaMessage(input)) : null;
}

/** Nomor telepon kantor desa (`KontakDesa.telepon`) untuk fallback tanpa WhatsApp; null bila kosong atau bukan nomor yang bisa ditelepon. */
export function teleponKantor(telepon?: string | null): PhoneInfo | null {
  const info = phoneInfo(telepon);
  return info && info.kind !== 'service' ? info : null;
}
