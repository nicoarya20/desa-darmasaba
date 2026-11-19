// Parser CSV impor Produk UMKM — fungsi murni (browser, untuk pratinjau). Kolom tak dikenal (gambar, rating,
// status aktif, dll.) dibuang saat parsing sehingga tidak pernah ikut terkirim ke server.
import { buatBerkasCsv, parseCsvImpor, type HasilCsvImpor } from "@/lib/csv/parse-impor";
import { IMPOR_UMKM_MAKS_BARIS, IMPOR_UMKM_MAKS_BYTES } from "./umkm-impor.rules";
import { KUNCI_LINK, validasiBarisProduk, type KunciLink, type ProdukImporInput } from "./produk-impor.rules";

/** Satu baris valid dari CSV beserta nomor barisnya di berkas (1 = header). */
export type BarisProduk = ProdukImporInput & { baris: number };
export type HasilCsvProduk = HasilCsvImpor<ProdukImporInput>;

// Alias header sudah dinormalkan (huruf kecil, selain huruf/angka → spasi): "link_shopee" → "link shopee".
const KOLOM_LINK: Record<KunciLink, readonly string[]> = {
  shopee: ["link shopee", "shopee"],
  tokopedia: ["link tokopedia", "tokopedia"],
  tiktok_shop: ["link tiktok shop", "link tiktok", "tiktok shop", "tiktok"],
  blibli: ["link blibli", "blibli"],
  lazada: ["link lazada", "lazada"],
  lainnya: ["link lainnya", "lainnya", "toko online lainnya", "link toko online lainnya"],
};
const KOLOM = {
  nama: ["nama", "nama produk"],
  umkm: ["umkm", "nama umkm", "toko", "nama toko"],
  pemilik: ["pemilik", "pemilik umkm"],
  kategori: ["kategori", "kategori produk"],
  harga: ["harga"],
  stok: ["stok"],
  satuan: ["satuan"],
  deskripsi: ["deskripsi"],
  unggulan: ["unggulan", "produk unggulan"],
  ...KOLOM_LINK,
};

/**
 * Parse CSV Produk: baris pertama header (wajib `nama`, `umkm`, `kategori`, `harga`; opsional `pemilik`, `stok`,
 * `satuan`, `deskripsi`, `unggulan`, dan satu kolom link per platform), baris kosong dilewati, baris tak valid ditolak.
 */
export function parseCsvProduk(teks: string): HasilCsvProduk {
  return parseCsvImpor<keyof typeof KOLOM, ProdukImporInput>(teks, {
    kolom: KOLOM,
    wajib: ["nama", "umkm", "kategori", "harga"],
    maksBaris: IMPOR_UMKM_MAKS_BARIS,
    maksBytes: IMPOR_UMKM_MAKS_BYTES,
    validasi: (sel) =>
      validasiBarisProduk({
        nama: sel.nama,
        umkm: sel.umkm,
        pemilik: sel.pemilik,
        kategori: sel.kategori,
        harga: sel.harga,
        stok: sel.stok,
        satuan: sel.satuan,
        deskripsi: sel.deskripsi,
        unggulan: sel.unggulan,
        link: Object.fromEntries(KUNCI_LINK.map((k) => [k, sel[k]])),
      }),
  });
}

/** Isi template CSV (BOM, ";"): 2 baris contoh rekaan (maks 5 link per produk, jadi baris 1 mengisi 5 dari 6 platform). */
export function buatTemplateCsvProduk(): string {
  return buatBerkasCsv([
    ["nama", "umkm", "pemilik", "kategori", "harga", "stok", "satuan", "deskripsi", "unggulan", ...KUNCI_LINK.map((k) => `link_${k}`)],
    ["Sate Lilit Contoh", "CONTOH Warung Sate Bu Komang", "Ni Komang Ayu", "CONTOH Makanan", "15000", "20", "porsi", "Sate lilit khas Bali", "ya", "https://shopee.co.id/contoh-produk", "https://www.tokopedia.com/contoh-toko/contoh-produk", "https://www.tiktok.com/@contoh/product/1", "https://www.blibli.com/p/contoh-produk", "https://www.lazada.co.id/products/contoh-produk", ""],
    ["Kerajinan Bambu Contoh", "CONTOH Kerajinan Pak Wayan", "", "CONTOH Kerajinan", "Rp 25.000", "", "buah", "", "tidak", "", "", "", "", "", ""],
  ]);
}
