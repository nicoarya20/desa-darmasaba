/**
 * Logika nomor telepon kontak darurat (dipakai Kesehatan, Keamanan, Polsek): jenis nomor (seluler/telepon
 * tetap/layanan pendek), href `tel:` & wa.me, dan format nomor untuk dibaca.
 */
import { normalizeWaNumber } from '@/app/(public)/(pages)/ekonomi/umkm/_lib/pesanan';

const COUNTRY_CODE = '62';
// Kode wilayah 2 digit (Jakarta, Bandung, Semarang, Surabaya, Medan); kode wilayah lain 3 digit, mis. 0361 Bali.
const TWO_DIGIT_AREA_CODES = ['21', '22', '24', '31', '61'];
// Nomor seluler/tetap terpendek tanpa angka 0 di depan (kode wilayah 2 digit + 7 digit pelanggan).
const MIN_NATIONAL_DIGITS = 8;
const GROUP = 4;
const SIX_DIGIT_SUBSCRIBER = 6;

export type PhoneKind = 'mobile' | 'landline' | 'service';

/** Nomor siap pakai: teks tampil, href `tel:`, href WhatsApp (hanya seluler). */
export type PhoneInfo = { kind: PhoneKind; display: string; telHref: string; waHref: string | null };

/** Digit saja dari nomor mentah ("(0361) 846-3263" → "03618463263"); kosong bila null. */
export const phoneDigits = (raw?: string | null) => (raw ?? '').replace(/\D/g, '');

/** Bagian nasional tanpa 0/62 di depan ("81239580000", "3618463263"); null bila bukan nomor Indonesia biasa. */
function nationalPart(digits: string): string | null {
  const national = digits.startsWith(COUNTRY_CODE)
    ? digits.slice(COUNTRY_CODE.length).replace(/^0+/, '')
    : digits.startsWith('0')
      ? digits.replace(/^0+/, '')
      : digits;
  return national.length >= MIN_NATIONAL_DIGITS ? national : null;
}

/** "0812 3958 0000" — kelompok 4 digit dari depan. */
function formatMobile(national: string): string {
  const full = `0${national}`;
  const groups: string[] = [];
  for (let i = 0; i < full.length; i += GROUP) groups.push(full.slice(i, i + GROUP));
  return groups.join(' ');
}

/**
 * "(0361) 846 3263" — kode wilayah dalam kurung, nomor pelanggan dipisah sebelum 4 digit terakhir.
 * Nomor pelanggan 6 digit (nomor lama, mis. 0361 411270) dibagi 3+3 → "(0361) 411 270", bukan "41 1270".
 */
function formatLandline(national: string): string {
  const areaLength = TWO_DIGIT_AREA_CODES.some((code) => national.startsWith(code)) ? 2 : 3;
  const area = national.slice(0, areaLength);
  const subscriber = national.slice(areaLength);
  const tail = subscriber.length === SIX_DIGIT_SUBSCRIBER ? SIX_DIGIT_SUBSCRIBER / 2 : GROUP;
  const head = subscriber.slice(0, -tail);
  return `(0${area}) ${head ? `${head} ` : ''}${subscriber.slice(-tail)}`;
}

/**
 * Info nomor kontak. Seluler (08xx) → tombol Telepon + WhatsApp; telepon tetap (mis. 0361) → Telepon saja;
 * nomor layanan pendek (112, 110) → Telepon apa adanya. Null bila nomor kosong/tanpa digit.
 */
export function phoneInfo(raw?: string | null): PhoneInfo | null {
  const digits = phoneDigits(raw);
  if (!digits) return null;

  const national = nationalPart(digits);
  if (!national) return { kind: 'service', display: digits, telHref: `tel:${digits}`, waHref: null };

  const telHref = `tel:+${COUNTRY_CODE}${national}`;
  const wa = normalizeWaNumber(digits);
  if (wa) return { kind: 'mobile', display: formatMobile(national), telHref, waHref: `https://wa.me/${wa}` };
  return { kind: 'landline', display: formatLandline(national), telHref, waHref: null };
}
