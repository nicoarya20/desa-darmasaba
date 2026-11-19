// Aturan impor CSV Produk UMKM — fungsi murni, satu sumber untuk browser (pratinjau) dan server (validasi ulang).
// Pesan galat hanya menyebut nomor baris/nama kolom, kecuali nama UMKM/kategori yang perlu diketahui admin.
import { validateLinkTokoOnline, validateLinkTokoOnlineList, PLATFORM_TOKO_ONLINE, type LinkTokoOnlineNormal, type PlatformTokoOnline } from "@/lib/link-toko-online";
import type { Validasi } from "@/lib/program-kemiskinan/penerima.rules";
import { parseBilanganImpor, parseYaTidakImpor } from "./nilai-impor";
import { bersihkanParagraf, bersihkanTeks, normalNama } from "./umkm-impor.rules";

/** Form produk hanya mewajibkan harga/stok ≥ 0; batas atas dan panjang teks di bawah ini adalah batas wajar impor. */
export const PRODUK_NAMA_MAKS = 150;
export const PRODUK_UMKM_MAKS = 150;
export const PRODUK_PEMILIK_MAKS = 150;
export const PRODUK_KATEGORI_MAKS = 100;
export const PRODUK_SATUAN_MAKS = 30;
export const PRODUK_DESKRIPSI_MAKS = 2000;
export const PRODUK_HARGA_MAKS = 2_000_000_000;
export const PRODUK_STOK_MAKS = 1_000_000;
/** Harga di bawah ini diberi peringatan: kemungkinan terpotong ribuan oleh Excel ("15" bukan 15.000). */
export const PRODUK_HARGA_CURIGA = 100;

/** Kunci kolom link = kode platform huruf kecil (shopee, tokopedia, tiktok_shop, blibli, lazada, lainnya). */
export type KunciLink = Lowercase<PlatformTokoOnline>;
export const KUNCI_LINK = PLATFORM_TOKO_ONLINE.map((p) => p.toLowerCase() as KunciLink);
export type LinkImpor = Partial<Record<KunciLink, string>>;

/** Satu baris impor yang sudah dirapikan dan valid. `umkm`/`kategori` berupa NAMA; field opsional dihilangkan bila kosong. */
export type ProdukImporInput = {
  nama: string;
  umkm: string;
  kategori: string;
  harga: number;
  pemilik?: string;
  stok?: number;
  satuan?: string;
  deskripsi?: string;
  unggulan?: boolean;
  link?: LinkImpor;
};

/** Kunci duplikat produk = umkmId + nama ternormalisasi. */
export const kunciProduk = (umkmId: string, nama: unknown) => `${umkmId}\u0001${normalNama(nama)}`;

const adaSkema = (raw: string) => /^[a-z][a-z0-9+.-]*:/i.test(raw);

/**
 * Validasi sel link per platform memakai util resmi `link-toko-online` (https saja, host cocok platform, maks 5).
 * Sukses → daftar normal (urutan = urutan platform) dan peta href per kunci; sel kosong diabaikan.
 */
export function validasiLinkImpor(
  mentah: Record<string, unknown> | undefined,
): Validasi<{ daftar: LinkTokoOnlineNormal[]; link: LinkImpor }> {
  const galat: string[] = [];
  const isi: { platform: PlatformTokoOnline; url: string }[] = [];
  for (const platform of PLATFORM_TOKO_ONLINE) {
    const kunci = platform.toLowerCase() as KunciLink;
    const url = bersihkanTeks(mentah?.[kunci]);
    if (!url) continue;
    const cek = adaSkema(url) ? validateLinkTokoOnline({ platform, url }) : ({ ok: false, message: "URL harus diawali https://" } as const);
    if (cek.ok) isi.push({ platform, url });
    else galat.push(`Kolom 'link_${kunci}': ${cek.message}`);
  }
  if (galat.length > 0) return { ok: false, alasan: galat.join("; ") };

  const daftar = validateLinkTokoOnlineList(isi);
  if (!daftar.ok) return { ok: false, alasan: daftar.message };
  const link: LinkImpor = {};
  for (const l of daftar.data) link[l.platform.toLowerCase() as KunciLink] = l.url;
  return { ok: true, value: { daftar: daftar.data, link } };
}

type BarisMentah = Record<"nama" | "umkm" | "kategori" | "harga" | "pemilik" | "stok" | "satuan" | "deskripsi" | "unggulan", unknown> & {
  link?: Record<string, unknown>;
};

/** Validasi satu baris impor; semua galat baris digabung (dipisah "; "), tanpa menyebut isi data. */
export function validasiBarisProduk(raw: Partial<BarisMentah>): Validasi<ProdukImporInput> {
  const galat: string[] = [];
  const teks = (kolom: string, nilai: string, maks: number, wajib: boolean) => {
    if (!nilai) {
      if (wajib) galat.push(`Kolom '${kolom}' wajib diisi`);
    } else if (nilai.length > maks) galat.push(`Kolom '${kolom}' maksimal ${maks} karakter`);
  };

  const nama = bersihkanTeks(raw.nama);
  const umkm = bersihkanTeks(raw.umkm);
  const kategori = bersihkanTeks(raw.kategori);
  const pemilik = bersihkanTeks(raw.pemilik);
  const satuan = bersihkanTeks(raw.satuan);
  const deskripsi = bersihkanParagraf(raw.deskripsi);
  teks("nama", nama, PRODUK_NAMA_MAKS, true);
  teks("umkm", umkm, PRODUK_UMKM_MAKS, true);
  teks("kategori", kategori, PRODUK_KATEGORI_MAKS, true);
  teks("pemilik", pemilik, PRODUK_PEMILIK_MAKS, false);
  teks("satuan", satuan, PRODUK_SATUAN_MAKS, false);
  teks("deskripsi", deskripsi, PRODUK_DESKRIPSI_MAKS, false);

  const harga = parseBilanganImpor(raw.harga, "harga", PRODUK_HARGA_MAKS);
  if (!harga.ok) galat.push(harga.alasan);
  else if (harga.value === null) galat.push("Kolom 'harga' wajib diisi");
  const stok = parseBilanganImpor(raw.stok, "stok", PRODUK_STOK_MAKS);
  if (!stok.ok) galat.push(stok.alasan);
  const unggulan = parseYaTidakImpor(raw.unggulan, "unggulan");
  if (!unggulan.ok) galat.push(unggulan.alasan);
  const link = validasiLinkImpor(raw.link);
  if (!link.ok) galat.push(link.alasan);

  if (galat.length > 0 || !harga.ok || harga.value === null || !stok.ok || !unggulan.ok || !link.ok) {
    return { ok: false, alasan: galat.join("; ") };
  }
  return {
    ok: true,
    value: {
      nama,
      umkm,
      kategori,
      harga: harga.value,
      ...(pemilik && { pemilik }),
      ...(stok.value !== null && { stok: stok.value }),
      ...(satuan && { satuan }),
      ...(deskripsi && { deskripsi }),
      ...(unggulan.value !== null && { unggulan: unggulan.value }),
      ...(link.value.daftar.length > 0 && { link: link.value.link }),
    },
  };
}

/** Peringatan (bukan galat) bila harga tampak terpotong ribuan oleh Excel. Nilai tidak pernah diubah. */
export function peringatanHarga(harga: number): string | null {
  if (harga >= PRODUK_HARGA_CURIGA) return null;
  return `Kolom 'harga' hanya Rp ${harga} (kemungkinan terpotong ribuan oleh Excel, mis. 15 bukan 15.000). Nilai tidak diubah, periksa kembali`;
}
