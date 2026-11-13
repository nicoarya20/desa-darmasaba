/**
 * Logika murni alur pesanan produk UMKM (halaman publik): normalisasi nomor
 * WhatsApp penjual, pesan WhatsApp, dan pemetaan error API ke teks untuk warga.
 */
import { perSatuanSuffix, withSatuan } from './satuan';

const WA_COUNTRY_CODE = '62';
// Nomor seluler Indonesia: 62 + 8xx… → total 10–15 digit (batas atas E.164).
const WA_MIN_DIGITS = 10;
const WA_MAX_DIGITS = 15;
const WA_MOBILE_PREFIX = '8';

export const PESAN_GAGAL_DEFAULT = 'Gagal membuat pesanan. Silakan coba lagi.';
export const PESAN_KONEKSI_GAGAL =
  'Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.';
export const WA_PENJUAL_TIDAK_VALID = 'Nomor WhatsApp penjual belum tersedia atau tidak valid';
const PESAN_INPUT_TIDAK_VALID = 'Data pesanan tidak valid. Periksa kembali jumlah pesanan.';
const HTTP_UNPROCESSABLE = 422;

/**
 * Ubah nomor kontak UMKM (format bebas: "0812…", "+62 812…", "812…", "62 0812…")
 * ke format wa.me "628…". Null bila bukan nomor seluler yang masuk akal —
 * lebih baik tidak membuka WhatsApp daripada membuka halaman "nomor tidak terdaftar".
 */
export function normalizeWaNumber(raw?: string | null): string | null {
  const digits = (raw ?? '').replace(/\D/g, '');
  const national = (digits.startsWith(WA_COUNTRY_CODE) ? digits.slice(WA_COUNTRY_CODE.length) : digits)
    .replace(/^0+/, '');

  if (!national.startsWith(WA_MOBILE_PREFIX)) return null;

  const full = `${WA_COUNTRY_CODE}${national}`;
  return full.length >= WA_MIN_DIGITS && full.length <= WA_MAX_DIGITS ? full : null;
}

export type OrderMessageInput = {
  umkmNama?: string | null;
  produkNama: string;
  jumlah: number;
  satuan?: string | null;
  harga: number;
  total: number;
  pemesan: string;
  catatan?: string;
};

const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
const sapaPenjual = (umkmNama?: string | null) => `Halo *${umkmNama ?? 'Penjual'}*`;

/** Teks pesan WhatsApp ke penjual. */
export function buildOrderMessage(o: OrderMessageInput): string {
  return [
    `${sapaPenjual(o.umkmNama)}, saya ingin memesan:`,
    '',
    `*${o.produkNama}*`,
    `Jumlah: ${withSatuan(o.jumlah, o.satuan)}`,
    `Harga Satuan: ${formatRupiah(o.harga)}${perSatuanSuffix(o.satuan)}`,
    `*Total: ${formatRupiah(o.total)}*`,
    '',
    `Nama Pemesan: ${o.pemesan}`,
    o.catatan ? `Catatan: ${o.catatan}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

/** URL wa.me siap dipakai sebagai href tautan. */
export function buildWaUrl(waNumber: string, message: string): string {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}

export type HubungiPenjualInput = {
  kontak?: string | null;
  umkmNama?: string | null;
  produkNama: string;
};

/** Pesan pembuka WhatsApp untuk menanyakan produk (tanpa pesanan tercatat). */
export function buildHubungiPenjualMessage(o: Omit<HubungiPenjualInput, 'kontak'>): string {
  return `${sapaPenjual(o.umkmNama)}, saya tertarik dengan produk *${o.produkNama}*. Apakah masih tersedia?`;
}

/** URL wa.me untuk menghubungi penjual; null bila nomor kontak UMKM tidak valid. */
export function buildHubungiPenjualUrl(o: HubungiPenjualInput): string | null {
  const waNumber = normalizeWaNumber(o.kontak);
  return waNumber ? buildWaUrl(waNumber, buildHubungiPenjualMessage(o)) : null;
}

type ApiResult = {
  data: { success?: boolean; message?: string } | null;
  error: { status: unknown; value: unknown } | null;
};

/**
 * Pesan error untuk warga dari hasil Eden treaty. Respons non-2xx (404/409/500)
 * ada di `error.value`, BUKAN `data` — membaca `data` saja membuat pesan server
 * hilang dan semua kegagalan tampil sebagai pesan generik.
 */
export function pesanErrorMessage(res: ApiResult): string {
  if (res.error) {
    if (res.error.status === HTTP_UNPROCESSABLE) return PESAN_INPUT_TIDAK_VALID;
    const value = res.error.value;
    if (value && typeof value === 'object' && 'message' in value) {
      const message = (value as { message: unknown }).message;
      if (typeof message === 'string' && message) return message;
    }
    return PESAN_GAGAL_DEFAULT;
  }
  return res.data?.message || PESAN_GAGAL_DEFAULT;
}

/** Sukses hanya bila server mengembalikan success:true tanpa error. */
export function isPesananBerhasil(res: ApiResult): boolean {
  return !res.error && res.data?.success === true;
}
