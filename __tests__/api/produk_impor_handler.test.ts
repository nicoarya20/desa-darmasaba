// @vitest-environment node
// POST /api/ekonomi/umkm/produk/import: request HTTP sungguhan lewat Elysia (prisma & auth di-mock).
// Admin saja; dryRun tidak menulis; UMKM tak dikenal/ambigu/pemilik/nonaktif; kategori tak dikenal/ambigu;
// lewati vs perbarui; link toko online; duplikat di berkas; ≥1 galat → 400 tanpa tulis; satu transaksi;
// isi data tidak pernah di-log. Semua data rekaan (test-only).
import Elysia from "elysia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAuthMock, prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    umkm: { findMany: vi.fn() },
    kategoriProdukUmkm: { findMany: vi.fn() },
    pasarDesa: { findMany: vi.fn(), createMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    linkTokoOnline: { deleteMany: vi.fn(), createMany: vi.fn() },
    $transaction: vi.fn(),
  };
  return { requireAuthMock: vi.fn(), prismaMock };
});
vi.mock("@/lib/api-auth", () => ({ requireAuth: () => requireAuthMock() }));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: {}, MINIO_BUCKET: "bucket-test" }));

import ProdukUmkm from "@/app/api/[[...slugs]]/_lib/ekonomi/umkm/produk";
import { isPublicPostPath } from "@/lib/auth-policy";

const app = new Elysia({ prefix: "/api" }).group("/ekonomi", (g) => g.use(ProdukUmkm));
const URL_IMPOR = "/api/ekonomi/umkm/produk/import";
const kirim = (body: unknown) =>
  app.handle(new Request(`http://localhost${URL_IMPOR}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));

const unauthorized = () => ({
  authenticated: false,
  response: new Response(JSON.stringify({ success: false, message: "Unauthorized - Silakan login terlebih dahulu" }), { status: 401 }),
});
const asRole = (roleId: string) => ({ authenticated: true, user: { id: "u-rekaan", roleId, isActive: true } }); // test-only

const KATEGORI = [
  { id: "k-makan", nama: "Makanan" },
  { id: "k-kerajinan", nama: "Kerajinan" },
];
const UMKM = [
  { id: "u-a", nama: "Warung A", pemilik: "Bu A", isActive: true },
  { id: "u-b", nama: "Warung B", pemilik: "Pak B", isActive: true },
  { id: "u-kembar-1", nama: "Toko Kembar", pemilik: "Bu Satu", isActive: true },
  { id: "u-kembar-2", nama: "Toko Kembar", pemilik: "Bu Dua", isActive: true },
  { id: "u-mati", nama: "Toko Tutup", pemilik: "Pak Mati", isActive: false },
];
const ADA = [{ id: "p-ada", umkmId: "u-a", nama: "Keripik Ada" }];
const SHOPEE = "https://shopee.co.id/produk-rekaan";
const TOKPED = "https://www.tokopedia.com/toko-rekaan/produk-rekaan";
const baris = (o: Record<string, unknown> = {}) => ({ nama: "Keripik Baru", umkm: "Warung A", kategori: "Makanan", harga: 15000, ...o });

const tidakMenulis = () => {
  expect(prismaMock.pasarDesa.createMany).not.toHaveBeenCalled();
  expect(prismaMock.pasarDesa.create).not.toHaveBeenCalled();
  expect(prismaMock.pasarDesa.update).not.toHaveBeenCalled();
  expect(prismaMock.linkTokoOnline.deleteMany).not.toHaveBeenCalled();
  expect(prismaMock.linkTokoOnline.createMany).not.toHaveBeenCalled();
};

let errorSpy: ReturnType<typeof vi.spyOn>;
let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  requireAuthMock.mockResolvedValue(asRole("0"));
  prismaMock.kategoriProdukUmkm.findMany.mockResolvedValue(KATEGORI);
  prismaMock.umkm.findMany.mockResolvedValue(UMKM);
  prismaMock.pasarDesa.findMany.mockResolvedValue(ADA);
  prismaMock.pasarDesa.createMany.mockResolvedValue({ count: 0 });
  prismaMock.pasarDesa.create.mockResolvedValue({});
  prismaMock.pasarDesa.update.mockResolvedValue({});
  prismaMock.linkTokoOnline.deleteMany.mockResolvedValue({ count: 0 });
  prismaMock.linkTokoOnline.createMany.mockResolvedValue({ count: 0 });
  prismaMock.$transaction.mockImplementation(async (cb: (tx: typeof prismaMock) => unknown) => cb(prismaMock));
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("akses", () => {
  it("path import tidak masuk daftar POST publik (guard global mewajibkan login)", () => {
    expect(isPublicPostPath(URL_IMPOR)).toBe(false);
  });

  it("tanpa sesi → 401, tidak menyentuh DB", async () => {
    requireAuthMock.mockResolvedValue(unauthorized());
    const res = await kirim({ mode: "lewati", rows: [baris()] });
    expect(res.status).toBe(401);
    expect(prismaMock.umkm.findMany).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    tidakMenulis();
  });

  it("pengguna biasa (role 5) → 403, tidak menulis", async () => {
    requireAuthMock.mockResolvedValue(asRole("5"));
    const res = await kirim({ mode: "lewati", rows: [baris()] });
    expect(res.status).toBe(403);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    tidakMenulis();
  });

  it("admin lolos", async () => {
    expect((await kirim({ mode: "lewati", dryRun: true, rows: [baris()] })).status).toBe(200);
  });
});

describe("kontrak body", () => {
  it("mode tidak dikenal, rows bukan array, kolom wajib hilang → ditolak skema (4xx), tanpa tulis", async () => {
    for (const body of [
      { mode: "ganti-semua", rows: [baris()] },
      { mode: "lewati", rows: "bukan-array" },
      { mode: "lewati", rows: [{ nama: "A", umkm: "Warung A" }] },
      { mode: "lewati", rows: [baris({ harga: "15000" })] },
    ]) {
      const res = await kirim(body);
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    }
    tidakMenulis();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rows kosong → 400; lebih dari 1000 baris → 4xx", async () => {
    const kosong = await kirim({ mode: "lewati", rows: [] });
    expect(kosong.status).toBe(400);
    const banyak = await kirim({ mode: "lewati", rows: Array.from({ length: 1001 }, () => baris()) });
    expect(banyak.status).toBeGreaterThanOrEqual(400);
    expect(banyak.status).toBeLessThan(500);
    tidakMenulis();
  });

  it("body menerima objek link opsional per platform", async () => {
    const res = await kirim({ mode: "lewati", dryRun: true, rows: [baris({ link: { shopee: SHOPEE } })] });
    expect(res.status).toBe(200);
  });
});

describe("dryRun", () => {
  it("menghitung tanpa menulis dan tanpa transaksi; membawa ringkasan lengkap", async () => {
    const res = await kirim({ mode: "lewati", dryRun: true, rows: [baris(), baris({ nama: "Keripik Ada" }), baris({ nama: "Salah", kategori: "Tak Ada" })] });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toMatchObject({ ditambah: 1, diperbarui: 0, dilewati: 1, totalGalat: 1, totalPeringatan: 0, linkDiganti: 0 });
    expect(json.data.galat[0].baris).toBe(3);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    tidakMenulis();
  });

  it("galat di dryRun tetap 200 (hanya pratinjau); contoh dibatasi 50 dengan total utuh", async () => {
    const rows = Array.from({ length: 80 }, (_, i) => baris({ nama: `P${i}`, kategori: "Tak Ada" }));
    const res = await kirim({ mode: "lewati", dryRun: true, rows });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.totalGalat).toBe(80);
    expect(json.data.galat).toHaveLength(50);
    tidakMenulis();
  });

  it("peringatan harga rendah muncul di dryRun, bukan galat", async () => {
    const res = await kirim({ mode: "lewati", dryRun: true, rows: [baris({ harga: 15 })] });
    const json = await res.json();
    expect(json.data).toMatchObject({ ditambah: 1, totalGalat: 0, totalPeringatan: 1 });
    expect(json.data.peringatan[0].baris).toBe(1);
  });

  it("perbarui dengan ≥1 link → linkDiganti dihitung, tanpa tulis", async () => {
    const res = await kirim({ mode: "perbarui", dryRun: true, rows: [baris({ nama: "Keripik Ada", link: { shopee: SHOPEE } })] });
    const json = await res.json();
    expect(json.data).toMatchObject({ ditambah: 0, diperbarui: 1, linkDiganti: 1 });
    tidakMenulis();
  });
});

describe("pencocokan UMKM", () => {
  const galatDari = async (row: Record<string, unknown>) => {
    const json = await (await kirim({ mode: "lewati", dryRun: true, rows: [row] })).json();
    return json.data.galat as { baris: number; alasan: string }[];
  };

  it("UMKM tidak dikenal → galat; tidak ada UMKM dibuat otomatis", async () => {
    const g = await galatDari(baris({ umkm: "Warung Hantu" }));
    expect(g[0].alasan).toContain('UMKM "Warung Hantu" tidak dikenal');
    tidakMenulis();
  });

  it("nama UMKM dicocokkan tanpa peka huruf besar dan spasi ganda", async () => {
    expect(await galatDari(baris({ umkm: "  warung   a " }))).toEqual([]);
  });

  it("UMKM kembar tanpa pemilik → ambigu", async () => {
    const g = await galatDari(baris({ umkm: "Toko Kembar" }));
    expect(g[0].alasan).toContain("ambigu: ada 2 UMKM");
    expect(g[0].alasan).toContain("'pemilik'");
  });

  it("UMKM kembar dengan pemilik yang tepat → lolos dan memakai UMKM yang benar", async () => {
    const res = await kirim({ mode: "lewati", rows: [baris({ umkm: "Toko Kembar", pemilik: "bu dua" })] });
    expect(res.status).toBe(200);
    expect(prismaMock.pasarDesa.createMany.mock.calls[0][0].data[0].umkmId).toBe("u-kembar-2");
  });

  it("UMKM kembar dengan pemilik yang tidak cocok → galat", async () => {
    const g = await galatDari(baris({ umkm: "Toko Kembar", pemilik: "Orang Lain" }));
    expect(g[0].alasan).toContain("tidak ditemukan dengan pemilik");
  });

  it("UMKM nonaktif → galat", async () => {
    const g = await galatDari(baris({ umkm: "Toko Tutup" }));
    expect(g[0].alasan).toContain("nonaktif");
  });

  it("pembacaan UMKM dan produk hanya yang belum dihapus (deletedAt null)", async () => {
    await kirim({ mode: "lewati", dryRun: true, rows: [baris()] });
    expect(prismaMock.umkm.findMany.mock.calls[0][0].where).toMatchObject({ deletedAt: null });
    expect(prismaMock.pasarDesa.findMany.mock.calls[0][0].where).toMatchObject({ deletedAt: null });
    expect(prismaMock.kategoriProdukUmkm.findMany.mock.calls[0][0].where).toMatchObject({ isActive: true, deletedAt: null });
  });
});

describe("pencocokan kategori", () => {
  it("kategori tidak dikenal → galat dengan nama kategori", async () => {
    const json = await (await kirim({ mode: "lewati", dryRun: true, rows: [baris({ kategori: "Elektronik" })] })).json();
    expect(json.data.galat[0].alasan).toContain('Kategori "Elektronik" tidak dikenal');
  });

  it("kategori ambigu (dua aktif bernama sama) → galat", async () => {
    prismaMock.kategoriProdukUmkm.findMany.mockResolvedValue([...KATEGORI, { id: "k-makan-2", nama: "makanan" }]);
    const json = await (await kirim({ mode: "lewati", dryRun: true, rows: [baris()] })).json();
    expect(json.data.galat[0].alasan).toContain("ambigu");
  });
});

describe("mode lewati vs perbarui", () => {
  it("lewati: produk yang sudah ada tidak diubah, hanya yang baru ditambah", async () => {
    const res = await kirim({ mode: "lewati", rows: [baris(), baris({ nama: "Keripik Ada", harga: 99999 })] });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.message).toBe("1 produk ditambah, 0 diperbarui, 1 dilewati");
    expect(json.data).toEqual({ ditambah: 1, diperbarui: 0, dilewati: 1 });
    expect(prismaMock.pasarDesa.createMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.pasarDesa.createMany.mock.calls[0][0].data).toEqual([{ nama: "Keripik Baru", harga: 15000, umkmId: "u-a", kategoriProdukId: "k-makan" }]);
    expect(prismaMock.pasarDesa.update).not.toHaveBeenCalled();
  });

  it("lewati: kunci duplikat = umkmId + nama; nama sama di UMKM lain tetap produk baru", async () => {
    const res = await kirim({ mode: "lewati", rows: [baris({ nama: "Keripik Ada", umkm: "Warung B" })] });
    expect((await res.json()).data).toEqual({ ditambah: 1, diperbarui: 0, dilewati: 0 });
  });

  it("perbarui: memperbarui kategori/harga/stok/satuan/deskripsi/unggulan; sel kosong tidak menimpa", async () => {
    const res = await kirim({
      mode: "perbarui",
      rows: [
        baris({ nama: "keripik ada", kategori: "Kerajinan", harga: 20000, stok: 7, satuan: "bungkus", deskripsi: "Renyah <b>", unggulan: true }),
      ],
    });
    expect((await res.json()).data).toEqual({ ditambah: 0, diperbarui: 1, dilewati: 0 });
    expect(prismaMock.pasarDesa.update).toHaveBeenCalledWith({
      where: { id: "p-ada" },
      data: { harga: 20000, kategoriProdukId: "k-kerajinan", stok: 7, satuan: "bungkus", deskripsi: "<p>Renyah &lt;b&gt;</p>", isUnggulan: true },
    });
    expect(prismaMock.pasarDesa.createMany).not.toHaveBeenCalled();
  });

  it("perbarui: hanya wajib terisi → data hanya harga & kategori (stok/satuan/deskripsi/unggulan tidak disentuh)", async () => {
    await kirim({ mode: "perbarui", rows: [baris({ nama: "Keripik Ada" })] });
    expect(prismaMock.pasarDesa.update).toHaveBeenCalledWith({ where: { id: "p-ada" }, data: { harga: 15000, kategoriProdukId: "k-makan" } });
  });

  it("perbarui: tidak pernah mengubah nama, UMKM, atau menghapus produk lain (tidak ada 'ganti semua')", async () => {
    await kirim({ mode: "perbarui", rows: [baris({ nama: "Keripik Ada" })] });
    const data = prismaMock.pasarDesa.update.mock.calls[0][0].data;
    expect(data).not.toHaveProperty("nama");
    expect(data).not.toHaveProperty("umkmId");
    expect((await kirim({ mode: "ganti", rows: [baris()] })).status).toBeGreaterThanOrEqual(400);
  });

  it("stok kosong pada produk baru tidak diisi (default DB 0 berlaku); deskripsi diubah ke paragraf HTML", async () => {
    await kirim({ mode: "lewati", rows: [baris({ deskripsi: "Teks <script>" })] });
    const data = prismaMock.pasarDesa.createMany.mock.calls[0][0].data[0];
    expect(data).not.toHaveProperty("stok");
    expect(data.deskripsi).toBe("<p>Teks &lt;script&gt;</p>");
  });
});

describe("link toko online", () => {
  it("produk baru dengan link → dibuat dengan nested create atomik (urutan platform), bukan createMany", async () => {
    const res = await kirim({ mode: "lewati", rows: [baris({ link: { tokopedia: TOKPED, shopee: SHOPEE } })] });
    expect(res.status).toBe(200);
    expect(prismaMock.pasarDesa.createMany).not.toHaveBeenCalled();
    expect(prismaMock.pasarDesa.create).toHaveBeenCalledTimes(1);
    const data = prismaMock.pasarDesa.create.mock.calls[0][0].data;
    expect(data.linkTokoOnline.create.map((l: { platform: string }) => l.platform)).toEqual(["SHOPEE", "TOKOPEDIA"]);
    expect(data.linkTokoOnline.create.map((l: { urutan: number }) => l.urutan)).toEqual([0, 1]);
    expect(data).toMatchObject({ nama: "Keripik Baru", umkmId: "u-a" });
    expect(data).not.toHaveProperty("link");
  });

  it("campuran: produk tanpa link massal, produk berlink satu per satu", async () => {
    await kirim({ mode: "lewati", rows: [baris({ nama: "Polos" }), baris({ nama: "Berlink", link: { shopee: SHOPEE } })] });
    expect(prismaMock.pasarDesa.createMany.mock.calls[0][0].data.map((d: { nama: string }) => d.nama)).toEqual(["Polos"]);
    expect(prismaMock.pasarDesa.create).toHaveBeenCalledTimes(1);
  });

  it("perbarui dengan semua sel link kosong → link lama tidak disentuh", async () => {
    await kirim({ mode: "perbarui", rows: [baris({ nama: "Keripik Ada" })] });
    expect(prismaMock.linkTokoOnline.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.linkTokoOnline.createMany).not.toHaveBeenCalled();
    expect(prismaMock.pasarDesa.update).toHaveBeenCalledTimes(1);
  });

  it("perbarui dengan ≥1 link → seluruh link produk itu diganti (hapus lalu buat) + dilaporkan di dryRun", async () => {
    const rows = [baris({ nama: "Keripik Ada", link: { shopee: SHOPEE, tokopedia: TOKPED } })];
    const dry = await (await kirim({ mode: "perbarui", dryRun: true, rows })).json();
    expect(dry.data.linkDiganti).toBe(1);

    const res = await kirim({ mode: "perbarui", rows });
    expect(res.status).toBe(200);
    expect(prismaMock.linkTokoOnline.deleteMany).toHaveBeenCalledWith({ where: { produkId: "p-ada" } });
    const dibuat = prismaMock.linkTokoOnline.createMany.mock.calls[0][0].data;
    expect(dibuat).toEqual([
      { platform: "SHOPEE", url: SHOPEE, urutan: 0, produkId: "p-ada" },
      { platform: "TOKOPEDIA", url: TOKPED, urutan: 1, produkId: "p-ada" },
    ]);
    expect(prismaMock.pasarDesa.update).toHaveBeenCalledTimes(1);
  });

  it("lewati: link pada baris yang dilewati tidak menyentuh link produk lama", async () => {
    await kirim({ mode: "lewati", rows: [baris({ nama: "Keripik Ada", link: { shopee: SHOPEE } })] });
    expect(prismaMock.linkTokoOnline.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.linkTokoOnline.createMany).not.toHaveBeenCalled();
    tidakMenulis();
  });

  it("link tidak valid (host salah, http, tanpa skema, >5) → 400 tanpa tulis", async () => {
    for (const link of [
      { shopee: TOKPED },
      { shopee: "http://shopee.co.id/p" },
      { shopee: "shopee.co.id/p" },
      { shopee: SHOPEE, tokopedia: TOKPED, tiktok_shop: "https://www.tiktok.com/@a/product/1", blibli: "https://www.blibli.com/p/1", lazada: "https://www.lazada.co.id/p/1", lainnya: "https://x.example.com/p" },
    ]) {
      const res = await kirim({ mode: "lewati", rows: [baris({ link })] });
      expect(res.status, JSON.stringify(Object.keys(link))).toBe(400);
    }
    tidakMenulis();
  });

  it("link ikut dalam galat dengan nama kolom, tanpa membocorkan URL", async () => {
    const json = await (await kirim({ mode: "lewati", rows: [baris({ link: { shopee: "http://shopee.co.id/rahasia-token" } })] })).json();
    expect(json.galat[0].alasan).toContain("'link_shopee'");
    expect(JSON.stringify(json)).not.toContain("rahasia-token");
  });
});

describe("galat → 400 tanpa tulis", () => {
  it("duplikat di berkas: galat mulai kemunculan kedua; tidak ada yang tertulis", async () => {
    const res = await kirim({ mode: "lewati", rows: [baris(), baris({ nama: "  KERIPIK baru " })] });
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.galat).toEqual([{ baris: 2, alasan: "Produk (UMKM + nama) sama dengan baris 1 di berkas ini" }]);
    expect(json.message).toBe("Impor dibatalkan: 1 baris tidak valid. Tidak ada data yang disimpan");
    tidakMenulis();
  });

  it("satu baris salah di antara baris valid membatalkan semuanya", async () => {
    const res = await kirim({ mode: "lewati", rows: [baris({ nama: "A" }), baris({ nama: "B", umkm: "Warung Hantu" }), baris({ nama: "C" })] });
    expect(res.status).toBe(400);
    expect((await res.json()).galat.map((g: { baris: number }) => g.baris)).toEqual([2]);
    tidakMenulis();
  });

  it("harga tidak valid (desimal) → galat baris, 400", async () => {
    const res = await kirim({ mode: "lewati", rows: [baris({ harga: 15.5 })] });
    expect(res.status).toBe(400);
    tidakMenulis();
  });

  it("galat contoh dibatasi 50 dengan total utuh", async () => {
    const rows = Array.from({ length: 120 }, (_, i) => baris({ nama: `P${i}`, umkm: "Warung Hantu" }));
    const json = await (await kirim({ mode: "lewati", rows })).json();
    expect(json.totalGalat).toBe(120);
    expect(json.galat).toHaveLength(50);
  });

  it("peringatan harga rendah bukan galat: impor tetap berjalan, nilai tidak diubah", async () => {
    const res = await kirim({ mode: "lewati", rows: [baris({ harga: 15 })] });
    expect(res.status).toBe(200);
    expect(prismaMock.pasarDesa.createMany.mock.calls[0][0].data[0].harga).toBe(15);
  });
});

describe("transaksi & keamanan log", () => {
  it("impor sungguhan berjalan dalam satu $transaction dengan timeout 30 detik", async () => {
    await kirim({ mode: "lewati", rows: [baris()] });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.$transaction.mock.calls[0][1]).toEqual({ timeout: 30_000 });
  });

  it("galat DB → 500 generik; hanya kelas galat & kode yang di-log, bukan isi data", async () => {
    prismaMock.pasarDesa.createMany.mockRejectedValue(Object.assign(new Error("Unique constraint failed on nama = 'Keripik Rahasia'"), { code: "P2002" }));
    const res = await kirim({ mode: "lewati", rows: [baris({ nama: "Keripik Rahasia" })] });
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json).toEqual({ success: false, message: "Gagal mengimpor data produk" });
    expect(errorSpy).toHaveBeenCalledWith("Error di produkImport:", "Error", "P2002");
    expect(JSON.stringify([...errorSpy.mock.calls, ...logSpy.mock.calls])).not.toContain("Keripik Rahasia");
  });

  it("isi data tidak pernah di-log pada alur sukses maupun gagal", async () => {
    await kirim({ mode: "lewati", rows: [baris({ nama: "Produk Rahasia", deskripsi: "Isi Rahasia" })] });
    await kirim({ mode: "lewati", rows: [baris({ nama: "Produk Rahasia", umkm: "Warung Hantu" })] });
    const dicatat = JSON.stringify([...errorSpy.mock.calls, ...logSpy.mock.calls]);
    expect(dicatat).not.toContain("Rahasia");
  });
});
