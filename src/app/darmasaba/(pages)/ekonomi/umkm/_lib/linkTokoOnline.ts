/**
 * Validasi & konstanta Link Toko Online produk UMKM (model LinkTokoOnline).
 * Satu-satunya sumber aturan: dipakai server (create/update produk) dan form admin
 * (validasi inline) supaya pesan & aturannya tidak pernah berbeda.
 */

export const PLATFORM_TOKO_ONLINE = [
  'SHOPEE',
  'TOKOPEDIA',
  'TIKTOK_SHOP',
  'BLIBLI',
  'LAZADA',
  'LAINNYA',
] as const;

export type PlatformTokoOnline = (typeof PLATFORM_TOKO_ONLINE)[number];

export const PLATFORM_LABEL: Record<PlatformTokoOnline, string> = {
  SHOPEE: 'Shopee',
  TOKOPEDIA: 'Tokopedia',
  TIKTOK_SHOP: 'TikTok Shop',
  BLIBLI: 'Blibli',
  LAZADA: 'Lazada',
  LAINNYA: 'Toko Online Lainnya',
};

/** Domain yang sah per platform; subdomain (mis. vt.tiktok.com) ikut diterima. LAINNYA = host https apa pun. */
const PLATFORM_HOSTS: Record<Exclude<PlatformTokoOnline, 'LAINNYA'>, readonly string[]> = {
  SHOPEE: ['shopee.co.id', 'shopee.com', 'shp.ee'],
  TOKOPEDIA: ['tokopedia.com', 'tk.tokopedia.com'],
  TIKTOK_SHOP: ['tiktok.com', 'vt.tiktok.com'],
  BLIBLI: ['blibli.com'],
  LAZADA: ['lazada.co.id', 'lazada.com'],
};

export const MAX_LINK_PER_PRODUK = 5;
export const MAX_URL_LENGTH = 2048;

export type LinkTokoOnlineInput = { platform: string; url: string };
export type LinkTokoOnlineNormal = { platform: PlatformTokoOnline; url: string; urutan: number };

export type LinkValidation<T> = { ok: true; data: T } | { ok: false; message: string };

/** Type guard: apakah nilai adalah kode platform yang dikenal. */
export function isPlatformTokoOnline(value: unknown): value is PlatformTokoOnline {
  return typeof value === 'string' && (PLATFORM_TOKO_ONLINE as readonly string[]).includes(value);
}

function hostCocok(hostname: string, domains: readonly string[]): boolean {
  return domains.some((d) => hostname === d || hostname.endsWith(`.${d}`));
}

/** Validasi satu link; sukses mengembalikan URL ternormalisasi (href) yang aman disimpan. */
export function validateLinkTokoOnline(link: LinkTokoOnlineInput): LinkValidation<string> {
  if (!isPlatformTokoOnline(link.platform)) return { ok: false, message: 'Platform tidak dikenal' };

  const raw = (link.url ?? '').trim();
  if (raw === '') return { ok: false, message: 'URL wajib diisi' };
  if (raw.length > MAX_URL_LENGTH) {
    return { ok: false, message: `URL maksimal ${MAX_URL_LENGTH} karakter` };
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    // new URL melempar untuk teks yang bukan URL; pesan ramah cukup bagi pengguna.
    return { ok: false, message: 'Format URL tidak valid' };
  }

  if (parsed.protocol !== 'https:') return { ok: false, message: 'URL harus diawali https://' };
  if (parsed.username !== '' || parsed.password !== '') {
    return { ok: false, message: 'URL tidak boleh memuat username/password' };
  }

  if (link.platform !== 'LAINNYA' && !hostCocok(parsed.hostname, PLATFORM_HOSTS[link.platform])) {
    return {
      ok: false,
      message: `URL tidak cocok dengan platform ${PLATFORM_LABEL[link.platform]} (${PLATFORM_HOSTS[link.platform].join(', ')})`,
    };
  }

  return { ok: true, data: parsed.href };
}

/** Cek ringan untuk render publik: https saja (pertahanan berlapis bila data lama/tak valid lolos). */
export function isSafeHttpsUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validasi daftar link satu produk. Urutan array = urutan tampil (urutan = indeks).
 * Input bukan array / undefined dianggap tidak valid; pemanggil memutuskan "tidak diubah" sebelum memanggil.
 */
export function validateLinkTokoOnlineList(links: unknown): LinkValidation<LinkTokoOnlineNormal[]> {
  if (!Array.isArray(links)) return { ok: false, message: 'Daftar link toko online tidak valid' };
  if (links.length > MAX_LINK_PER_PRODUK) {
    return { ok: false, message: `Maksimal ${MAX_LINK_PER_PRODUK} link toko online per produk` };
  }

  const hasil: LinkTokoOnlineNormal[] = [];
  for (let i = 0; i < links.length; i += 1) {
    const item = links[i] as Partial<LinkTokoOnlineInput> | null;
    const platform = typeof item?.platform === 'string' ? item.platform : '';
    const url = typeof item?.url === 'string' ? item.url : '';
    const cek = validateLinkTokoOnline({ platform, url });
    if (!cek.ok) return { ok: false, message: `Link toko online #${i + 1}: ${cek.message}` };
    hasil.push({ platform: platform as PlatformTokoOnline, url: cek.data, urutan: i });
  }
  return { ok: true, data: hasil };
}
