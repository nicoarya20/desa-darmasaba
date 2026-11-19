// @vitest-environment node
// Impor CSV Produk UMKM (fungsi murni): parse angka rupiah & ya/tidak, validasi baris, alias header,
// link toko online per platform, peringatan harga rendah, kunci duplikat, dan template. Data rekaan (test-only).
import { describe, expect, it } from "vitest";
import { parseBilanganImpor, parseYaTidakImpor } from "@/lib/umkm/nilai-impor";
import { buatTemplateCsvProduk, parseCsvProduk } from "@/lib/umkm/produk-impor-csv";
import { kunciProduk, peringatanHarga, validasiBarisProduk, validasiLinkImpor, PRODUK_HARGA_MAKS, PRODUK_STOK_MAKS } from "@/lib/umkm/produk-impor.rules";

const angka = (raw: unknown, maks = PRODUK_HARGA_MAKS) => parseBilanganImpor(raw, "harga", maks);
const dasar = { nama: "Keripik", umkm: "Warung A", kategori: "Makanan", harga: "15000" };
const HEADER = "nama;umkm;kategori;harga";

describe("parseBilanganImpor", () => {
  it.each([
    ["15000", 15000],
    ["15.000", 15000],
    ["Rp 15.000", 15000],
    ["Rp15.000,-", 15000],
    ["Rp. 1.500.000", 1500000],
    ["15.000,00", 15000],
    ["0", 0],
    [" 2500 ", 2500],
  ])("%s → %d", (raw, nilai) => {
    expect(angka(raw)).toEqual({ ok: true, value: nilai });
  });

  it("angka bertipe number diterima", () => {
    expect(angka(15000)).toEqual({ ok: true, value: 15000 });
  });

  it("kosong → null (pemanggil memutuskan wajib/tidak)", () => {
    expect(angka("")).toEqual({ ok: true, value: null });
    expect(angka("   ")).toEqual({ ok: true, value: null });
    expect(angka(undefined)).toEqual({ ok: true, value: null });
  });

  it.each([
    ["1,5", "tanpa desimal"],
    ["15.50", "tanpa desimal"],
    ["1.5E4", "notasi ilmiah"],
    ["1,5E+4", "notasi ilmiah"],
    ["-100", "negatif"],
    ["abc", "angka bulat"],
    ["15 ribu", "angka bulat"],
    ["15,000", "ambigu"],
  ])("%s ditolak (%s)", (raw, sebab) => {
    const r = angka(raw);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.alasan).toContain(sebab);
  });

  it("melewati batas atas ditolak; tepat di batas diterima", () => {
    expect(angka("2.000.000.001").ok).toBe(false);
    expect(angka("2.000.000.000")).toEqual({ ok: true, value: 2_000_000_000 });
    expect(parseBilanganImpor("1000001", "stok", PRODUK_STOK_MAKS).ok).toBe(false);
  });

  it("pesan galat menyebut nama kolom, bukan isi sel", () => {
    const r = angka("rahasia-123");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.alasan).toContain("'harga'");
      expect(r.alasan).not.toContain("rahasia-123");
    }
  });
});

describe("parseYaTidakImpor", () => {
  it.each(["ya", "YA", "Y", "true", "TRUE", "1", "yes"])("%s → true", (raw) => {
    expect(parseYaTidakImpor(raw, "unggulan")).toEqual({ ok: true, value: true });
  });
  it.each(["tidak", "Tidak", "n", "t", "false", "0", "no"])("%s → false", (raw) => {
    expect(parseYaTidakImpor(raw, "unggulan")).toEqual({ ok: true, value: false });
  });
  it("kosong → null; nilai lain ditolak", () => {
    expect(parseYaTidakImpor("", "unggulan")).toEqual({ ok: true, value: null });
    expect(parseYaTidakImpor("mungkin", "unggulan").ok).toBe(false);
  });
});

describe("validasiBarisProduk", () => {
  it("baris minimal valid; field opsional dihilangkan bila kosong", () => {
    expect(validasiBarisProduk(dasar)).toEqual({ ok: true, value: { nama: "Keripik", umkm: "Warung A", kategori: "Makanan", harga: 15000 } });
  });

  it("harga 0 diterima (sesuai form); stok kosong tidak diisi", () => {
    const r = validasiBarisProduk({ ...dasar, harga: "0" });
    expect(r.ok && r.value.harga).toBe(0);
    expect(r.ok && "stok" in r.value).toBe(false);
  });

  it("semua kolom opsional terbaca", () => {
    const r = validasiBarisProduk({ ...dasar, pemilik: "Bu A", stok: "1.000", satuan: "bungkus", deskripsi: "Renyah", unggulan: "ya" });
    expect(r).toEqual({
      ok: true,
      value: { ...{ nama: "Keripik", umkm: "Warung A", kategori: "Makanan", harga: 15000 }, pemilik: "Bu A", stok: 1000, satuan: "bungkus", deskripsi: "Renyah", unggulan: true },
    });
  });

  it("kolom wajib kosong → galat per kolom, digabung", () => {
    const r = validasiBarisProduk({ nama: "", umkm: "", kategori: "", harga: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) for (const k of ["nama", "umkm", "kategori", "harga"]) expect(r.alasan).toContain(`'${k}' wajib diisi`);
  });

  it("panjang teks dibatasi", () => {
    const r = validasiBarisProduk({ ...dasar, nama: "x".repeat(151), satuan: "y".repeat(31) });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.alasan).toContain("'nama' maksimal 150");
      expect(r.alasan).toContain("'satuan' maksimal 30");
    }
  });

  it("stok dan unggulan tidak valid ditolak", () => {
    expect(validasiBarisProduk({ ...dasar, stok: "-1" }).ok).toBe(false);
    expect(validasiBarisProduk({ ...dasar, unggulan: "mungkin" }).ok).toBe(false);
  });
});

describe("peringatanHarga & kunciProduk", () => {
  it("harga < 100 diberi peringatan (bukan galat); ≥ 100 tidak", () => {
    expect(peringatanHarga(15)).toContain("terpotong");
    expect(peringatanHarga(99)).not.toBeNull();
    expect(peringatanHarga(100)).toBeNull();
    expect(peringatanHarga(0)).not.toBeNull();
  });

  it("kunci duplikat = umkmId + nama ternormalisasi (huruf besar/spasi/diakritik tidak membedakan)", () => {
    expect(kunciProduk("u1", "  Keripik  Pisang ")).toBe(kunciProduk("u1", "keripik pisang"));
    expect(kunciProduk("u1", "Keripik")).not.toBe(kunciProduk("u2", "Keripik"));
  });
});

describe("validasiLinkImpor", () => {
  it("sel kosong diabaikan; tanpa link → daftar kosong", () => {
    const r = validasiLinkImpor({ shopee: "", tokopedia: "  " });
    expect(r.ok && r.value.daftar).toEqual([]);
    expect(r.ok && r.value.link).toEqual({});
    expect(validasiLinkImpor(undefined).ok).toBe(true);
  });

  it("urutan mengikuti urutan platform, bukan urutan kolom/isi", () => {
    const r = validasiLinkImpor({ lazada: "https://www.lazada.co.id/p/1", shopee: "https://shopee.co.id/p/1" });
    expect(r.ok && r.value.daftar.map((l) => l.platform)).toEqual(["SHOPEE", "LAZADA"]);
    expect(r.ok && r.value.daftar.map((l) => l.urutan)).toEqual([0, 1]);
  });

  it("host tidak cocok dengan platform ditolak dan menyebut nama kolom", () => {
    const r = validasiLinkImpor({ shopee: "https://www.tokopedia.com/x/y" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.alasan).toContain("'link_shopee'");
  });

  it("http (bukan https) ditolak", () => {
    const r = validasiLinkImpor({ shopee: "http://shopee.co.id/p/1" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.alasan).toContain("'link_shopee'");
  });

  it("tanpa skema ditolak dan tidak ditambah https:// otomatis", () => {
    const r = validasiLinkImpor({ shopee: "shopee.co.id/p/1" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.alasan).toContain("https://");
  });

  it("userinfo di URL ditolak", () => {
    expect(validasiLinkImpor({ shopee: "https://user:pw@shopee.co.id/p/1" }).ok).toBe(false);
  });

  it("platform lainnya menerima host apa pun (https)", () => {
    const r = validasiLinkImpor({ lainnya: "https://toko-saya.example.com/produk" });
    expect(r.ok && r.value.link.lainnya).toBe("https://toko-saya.example.com/produk");
  });

  it("lebih dari 5 link ditolak", () => {
    const r = validasiLinkImpor({
      shopee: "https://shopee.co.id/p/1",
      tokopedia: "https://www.tokopedia.com/a/b",
      tiktok_shop: "https://www.tiktok.com/@a/product/1",
      blibli: "https://www.blibli.com/p/1",
      lazada: "https://www.lazada.co.id/p/1",
      lainnya: "https://toko.example.com/p",
    });
    expect(r.ok).toBe(false);
  });

  it("href dinormalkan (spasi dipangkas) dan dikembalikan per kunci platform", () => {
    const r = validasiLinkImpor({ tiktok_shop: "  https://www.tiktok.com/@a/product/1  " });
    expect(r.ok && r.value.link).toEqual({ tiktok_shop: "https://www.tiktok.com/@a/product/1" });
  });
});

describe("parseCsvProduk", () => {
  it("baris valid diberi nomor baris berkas (header = 1)", () => {
    const h = parseCsvProduk(`${HEADER}\nKeripik;Warung A;Makanan;15.000\nKopi;Warung A;Minuman;Rp 20.000`);
    expect(h.galat).toBeNull();
    expect(h.ditolak).toEqual([]);
    expect(h.rows.map((r) => [r.baris, r.nama, r.harga])).toEqual([
      [2, "Keripik", 15000],
      [3, "Kopi", 20000],
    ]);
  });

  it("alias header: nama produk, nama umkm/toko, kategori produk, produk unggulan, pemilik umkm", () => {
    const h = parseCsvProduk("Nama Produk;Toko;Pemilik UMKM;Kategori Produk;Harga;Produk Unggulan\nKeripik;Warung A;Bu A;Makanan;15000;ya");
    expect(h.galat).toBeNull();
    expect(h.rows[0]).toMatchObject({ nama: "Keripik", umkm: "Warung A", pemilik: "Bu A", kategori: "Makanan", harga: 15000, unggulan: true });
    expect(parseCsvProduk("nama;nama toko;kategori;harga\nA;B;C;100").rows[0]?.umkm).toBe("B");
    expect(parseCsvProduk("nama;nama umkm;kategori;harga\nA;B;C;100").rows[0]?.umkm).toBe("B");
  });

  it("pemisah koma juga diterima", () => {
    expect(parseCsvProduk("nama,umkm,kategori,harga\nKeripik,Warung A,Makanan,15000").rows).toHaveLength(1);
  });

  it.each([
    ["umkm", "nama;kategori;harga\nA;C;100"],
    ["harga", "nama;umkm;kategori\nA;B;C"],
    ["nama", "umkm;kategori;harga\nB;C;100"],
    ["kategori", "nama;umkm;harga\nA;B;100"],
  ])("header tanpa kolom wajib '%s' → galat berkas", (kolom, csv) => {
    const h = parseCsvProduk(csv);
    expect(h.galat).toContain(`'${kolom}'`);
    expect(h.rows).toEqual([]);
  });

  it("kolom link per platform dan aliasnya terpetakan ke platform yang benar", () => {
    const peta: [string, string, string][] = [
      ["link_shopee", "https://shopee.co.id/p/1", "shopee"],
      ["Shopee", "https://shopee.co.id/p/1", "shopee"],
      ["link tokopedia", "https://www.tokopedia.com/a/b", "tokopedia"],
      ["link_tiktok_shop", "https://www.tiktok.com/@a/product/1", "tiktok_shop"],
      ["TikTok Shop", "https://www.tiktok.com/@a/product/1", "tiktok_shop"],
      ["tiktok", "https://www.tiktok.com/@a/product/1", "tiktok_shop"],
      ["link tiktok", "https://www.tiktok.com/@a/product/1", "tiktok_shop"],
      ["link_blibli", "https://www.blibli.com/p/1", "blibli"],
      ["lazada", "https://www.lazada.co.id/p/1", "lazada"],
      ["link_lainnya", "https://toko.example.com/p", "lainnya"],
      ["lainnya", "https://toko.example.com/p", "lainnya"],
      ["toko online lainnya", "https://toko.example.com/p", "lainnya"],
      ["link toko online lainnya", "https://toko.example.com/p", "lainnya"],
    ];
    for (const [header, url, kunci] of peta) {
      const h = parseCsvProduk(`${HEADER};${header}\nKeripik;Warung A;Makanan;15000;${url}`);
      expect(h.galat, header).toBeNull();
      expect(h.rows[0]?.link, header).toEqual({ [kunci]: url });
    }
  });

  it("baris dengan link salah ditolak dengan nomor baris; baris lain tetap terbaca", () => {
    const h = parseCsvProduk(`${HEADER};link_shopee\nA;U;K;100;http://shopee.co.id/p\nB;U;K;100;https://shopee.co.id/p`);
    expect(h.rows.map((r) => r.nama)).toEqual(["B"]);
    expect(h.ditolak).toHaveLength(1);
    expect(h.ditolak[0].baris).toBe(2);
    expect(h.ditolak[0].alasan).toContain("'link_shopee'");
  });

  it("link kosong diabaikan: baris tidak membawa field link", () => {
    const h = parseCsvProduk(`${HEADER};link_shopee\nA;U;K;100;`);
    expect(h.rows[0]).not.toHaveProperty("link");
  });

  it("kolom tak dikenal dibuang (tidak ikut terkirim)", () => {
    const h = parseCsvProduk(`${HEADER};rating;gambar\nA;U;K;100;5;x.jpg`);
    expect(h.rows[0]).not.toHaveProperty("rating");
    expect(h.rows[0]).not.toHaveProperty("gambar");
  });

  it("header ganda (alias berbeda untuk kolom sama) → galat berkas", () => {
    expect(parseCsvProduk("nama;nama produk;umkm;kategori;harga\nA;A;U;K;100").galat).not.toBeNull();
  });

  it("baris kosong dilewati; baris tak valid ditolak dengan alasan", () => {
    const h = parseCsvProduk(`${HEADER}\n\nA;U;K;abc\nB;U;K;100`);
    expect(h.rows.map((r) => r.nama)).toEqual(["B"]);
    expect(h.ditolak.map((d) => d.baris)).toEqual([3]);
  });
});

describe("buatTemplateCsvProduk", () => {
  const isi = buatTemplateCsvProduk();
  const baris = isi.replace(/^﻿/, "").trim().split("\r\n");

  it("BOM, pemisah ';', header sesuai spek lalu enam kolom link", () => {
    expect(isi.startsWith("﻿")).toBe(true);
    expect(baris[0]).toBe("nama;umkm;pemilik;kategori;harga;stok;satuan;deskripsi;unggulan;link_shopee;link_tokopedia;link_tiktok_shop;link_blibli;link_lazada;link_lainnya");
    expect(baris).toHaveLength(3);
  });

  it("nama UMKM/kategori contoh jelas ditandai CONTOH", () => {
    expect(baris[1]).toContain("CONTOH");
    expect(baris[2]).toContain("CONTOH");
  });

  it("template sendiri lolos parse tanpa galat (baris 1 punya 5 link, baris 2 tanpa link)", () => {
    const h = parseCsvProduk(isi);
    expect(h.galat).toBeNull();
    expect(h.ditolak).toEqual([]);
    expect(h.rows).toHaveLength(2);
    expect(Object.keys(h.rows[0].link ?? {})).toHaveLength(5);
    expect(h.rows[1]).not.toHaveProperty("link");
  });
});
