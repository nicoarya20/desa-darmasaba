import { bujurSchema, lintangSchema, type Koordinat } from '@/lib/konten-bersama/lokasi.logic';

export type HasilGeocode = Koordinat & { label: string };
export type HasilCari = { ok: true; hasil: HasilGeocode[] } | { ok: false; pesan: string };

export const MIN_KUERI_CARI = 3;
export const MAX_KUERI_CARI = 200;
export const PESAN_TIDAK_DITEMUKAN = 'Lokasi tidak ditemukan, coba alamat yang lebih umum atau isi koordinat manual';
export const PESAN_TERLALU_SERING = 'Terlalu sering, coba lagi sebentar';
export const PESAN_CARI_GAGAL = 'Pencarian lokasi gagal, coba lagi atau isi koordinat manual';

export function kueriCariValid(kueri: string): boolean {
  const panjang = kueri.trim().length;
  return panjang >= MIN_KUERI_CARI && panjang <= MAX_KUERI_CARI;
}

function hasilValid(v: unknown): v is HasilGeocode {
  if (!v || typeof v !== 'object') return false;
  const { lat, lng, label } = v as Record<string, unknown>;
  return typeof label === 'string' && lintangSchema.safeParse(lat).success && bujurSchema.safeParse(lng).success;
}

/** Respons `GET /api/geocode/search` → hasil atau pesan untuk admin. Daftar kosong dianggap "tidak ditemukan". */
export function petakanResponsCari(status: number, body: unknown): HasilCari {
  const b = (body && typeof body === 'object' ? body : {}) as { success?: unknown; data?: unknown; message?: unknown };
  if (status === 200 && b.success === true && Array.isArray(b.data)) {
    const hasil = b.data.filter(hasilValid).map(({ lat, lng, label }) => ({ lat, lng, label }));
    return hasil.length ? { ok: true, hasil } : { ok: false, pesan: PESAN_TIDAK_DITEMUKAN };
  }
  if (status === 429) return { ok: false, pesan: PESAN_TERLALU_SERING };
  return { ok: false, pesan: typeof b.message === 'string' && b.message.trim() ? b.message : PESAN_CARI_GAGAL };
}

/** Cari kandidat koordinat dari alamat lewat endpoint admin (cookie sesi ikut karena same-origin). */
export async function cariTitikAlamat(
  kueri: string,
  fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch,
): Promise<HasilCari> {
  let res: Response;
  try {
    res = await fetcher(`/api/geocode/search?q=${encodeURIComponent(kueri.trim())}`, { credentials: 'same-origin' });
  } catch (error) {
    console.error('Gagal memanggil pencarian lokasi:', error);
    return { ok: false, pesan: PESAN_CARI_GAGAL };
  }
  // Body bukan JSON (mis. halaman galat proxy) → pesan umum sesuai status.
  const body: unknown = await res.json().catch(() => null);
  return petakanResponsCari(res.status, body);
}

export type AlamatTitik = { alamat: string; nama: string | null };
export type HasilAlamatTitik = ({ ok: true } & AlamatTitik) | { ok: false };

export const JEDA_CARI_ALAMAT_MS = 800;

/** Respons `GET /api/geocode/reverse` → alamat (+ nama tempat bila ada). Tidak ditemukan/galat → `{ ok: false }` tanpa pesan. */
export function petakanResponsAlamat(status: number, body: unknown): HasilAlamatTitik {
  const b = (body && typeof body === 'object' ? body : {}) as { success?: unknown; data?: unknown };
  if (status !== 200 || b.success !== true || !b.data || typeof b.data !== 'object') return { ok: false };
  const { alamat, nama } = b.data as Record<string, unknown>;
  if (typeof alamat !== 'string' || !alamat.trim()) return { ok: false };
  return { ok: true, alamat: alamat.trim(), nama: typeof nama === 'string' && nama.trim() ? nama.trim() : null };
}

/** Alamat dari titik peta lewat endpoint admin. Fitur bantuan: kegagalan hanya dicatat, tidak ditampilkan. */
export async function cariAlamatTitik(
  k: Koordinat,
  fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch,
): Promise<HasilAlamatTitik> {
  let res: Response;
  try {
    res = await fetcher(`/api/geocode/reverse?${new URLSearchParams({ lat: String(k.lat), lng: String(k.lng) })}`, {
      credentials: 'same-origin',
    });
  } catch (error) {
    console.warn('Gagal mencari alamat titik peta:', error);
    return { ok: false };
  }
  const body: unknown = await res.json().catch(() => null);
  if (res.status !== 200) console.warn(`Pencarian alamat titik peta gagal (HTTP ${res.status})`);
  return petakanResponsAlamat(res.status, body);
}

/** Lokasi boleh diisi otomatis bila kosong, atau masih sama dengan isian otomatis terakhir (belum diubah admin). */
export function bolehIsiLokasiOtomatis(lokasiSekarang: string, isianOtomatisTerakhir: string | null): boolean {
  return lokasiSekarang.trim() === '' || (isianOtomatisTerakhir !== null && lokasiSekarang === isianOtomatisTerakhir);
}

/** Saran nama dari peta yang layak ditampilkan: ada dan belum sama dengan isian Nama. */
export function saranNamaTampil(saran: string | null, namaSekarang: string): string | null {
  if (!saran?.trim()) return null;
  return saran.trim().toLowerCase() === namaSekarang.trim().toLowerCase() ? null : saran;
}

const RE_ANGKA_KETIK = /^-?\d+(?:\.\d*)?$/;

export type CekSatuSumbu = { nilai: number | null; error: string | null };

/**
 * Validasi isian satu kolom lintang/bujur. Kosong atau "-" (sedang mengetik) → tanpa nilai & tanpa error.
 * Nilai hanya dipakai bila sah, selain itu error yang ditampilkan di input.
 */
export function cekSumbuTeks(teks: string, sumbu: 'lintang' | 'bujur'): CekSatuSumbu {
  const t = teks.trim();
  if (t === '' || t === '-') return { nilai: null, error: null };
  if (/^https?:\/\//i.test(t)) {
    return { nilai: null, error: 'Link ini tidak memuat koordinat. Buka di Google Maps, klik kanan titik, lalu salin koordinatnya' };
  }
  if (!RE_ANGKA_KETIK.test(t)) return { nilai: null, error: 'Isi angka dengan titik desimal, mis. -8.571234' };
  const nilai = Number(t);
  const sah = sumbu === 'lintang' ? lintangSchema.safeParse(nilai).success : bujurSchema.safeParse(nilai).success;
  if (!sah) return { nilai: null, error: sumbu === 'lintang' ? 'Lintang harus antara -90 dan 90' : 'Bujur harus antara -180 dan 180' };
  return { nilai, error: null };
}

/** Koordinat dari pasangan string form (mis. state CCTV); kosong/tidak sah/sebelah → null. */
export function koordinatDariTeks(lat: string, lng: string): Koordinat | null {
  const a = cekSumbuTeks(lat, 'lintang').nilai;
  const b = cekSumbuTeks(lng, 'bujur').nilai;
  return a === null || b === null ? null : { lat: a, lng: b };
}
