/** Logika murni kontak & peta halaman detail lowongan: tombol Telepon/WhatsApp dan tautan Google Maps. */
import { phoneInfo } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';
import { buildWaUrl, normalizeWaNumber } from '@/app/(public)/(pages)/ekonomi/umkm/_lib/pesanan';
import type { LowonganKontak } from './lowongan-detail.types';

/** Pencarian Google Maps (URL publik Maps), alamat ditempel ter-encode di belakang. */
export const GOOGLE_MAPS_SEARCH_URL = 'https://www.google.com/maps/search/?api=1&query=';

/** Pesan pembuka WhatsApp ke pemberi kerja; tanpa nama pemberi kerja → sapaan umum "Halo,". */
export function buildLamaranMessage(o: { pemberiKerja: string; posisi: string }): string {
  const sapa = o.pemberiKerja.trim() === '' ? 'Halo,' : `Halo ${o.pemberiKerja.trim()},`;
  return `${sapa} saya tertarik dengan lowongan ${o.posisi.trim()} yang saya lihat di website Desa Darmasaba.`;
}

/**
 * Kontak dari `notelp` bebas. Seluler → Telepon + WhatsApp berpesan; telepon tetap (mis. 0361) → Telepon saja.
 * Kosong, tanpa digit, atau nomor pendek (kind `service`, mis. "123": bukan nomor pemberi kerja yang masuk akal)
 * → null, halaman menampilkan "Kontak belum dicantumkan".
 */
export function toLowonganKontak(
  notelp: string | null | undefined,
  o: { pemberiKerja: string; posisi: string },
): LowonganKontak | null {
  const info = phoneInfo(notelp);
  if (!info || info.kind === 'service') return null;
  const wa = normalizeWaNumber(notelp);
  return {
    display: info.display,
    telHref: info.telHref,
    waHref: wa ? buildWaUrl(wa, buildLamaranMessage(o)) : null,
  };
}

/** Tautan pencarian Google Maps dari alamat `lokasi`; kosong/null → null. */
export function petaHref(lokasi: string | null | undefined): string | null {
  const alamat = (lokasi ?? '').trim();
  return alamat === '' ? null : `${GOOGLE_MAPS_SEARCH_URL}${encodeURIComponent(alamat)}`;
}
