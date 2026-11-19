// @vitest-environment node
// POST /api/ekonomi/umkm/import: request HTTP sungguhan lewat Elysia (prisma & auth di-mock).
// Admin saja; dryRun tidak menulis; lewati vs perbarui; kategori tak dikenal/ambigu; duplikat di berkas;
// ≥1 galat → 400 tanpa tulis; satu transaksi; isi data tidak pernah di-log. Semua data rekaan (test-only).
import Elysia from "elysia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAuthMock, prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    umkm: { findMany: vi.fn(), createMany: vi.fn(), update: vi.fn() },
    kategoriProdukUmkm: { findMany: vi.fn() },
    $transaction: vi.fn(),
  };
  return { requireAuthMock: vi.fn(), prismaMock };
});
vi.mock("@/lib/api-auth", () => ({ requireAuth: () => requireAuthMock() }));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: {}, MINIO_BUCKET: "bucket-test" }));

import Umkm from "@/app/api/[[...slugs]]/_lib/ekonomi/umkm";
import { isPublicPostPath } from "@/lib/auth-policy";

const app = new Elysia({ prefix: "/api" }).group("/ekonomi", (g) => g.use(Umkm));
const URL_IMPOR = "/api/ekonomi/umkm/import";
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
const ADA = [{ id: "u-ada", nama: "Warung Ada", pemilik: "Bu Ada" }];
const baris = (o: Record<string, unknown> = {}) => ({ nama: "Warung Baru", pemilik: "Pak Baru", kategori: "Makanan", ...o });

const tidakMenulis = () => {
  expect(prismaMock.umkm.createMany).not.toHaveBeenCalled();
  expect(prismaMock.umkm.update).not.toHaveBeenCalled();
};

let errorSpy: ReturnType<typeof vi.spyOn>;
let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  requireAuthMock.mockResolvedValue(asRole("0"));
  prismaMock.kategoriProdukUmkm.findMany.mockResolvedValue(KATEGORI);
  prismaMock.umkm.findMany.mockResolvedValue(ADA);
  prismaMock.umkm.createMany.mockResolvedValue({ count: 0 });
  prismaMock.umkm.update.mockResolvedValue({});
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
    const res = await kirim({ mode: "lewati", dryRun: true, rows: [baris()] });
    expect(res.status).toBe(200);
  });
});

describe("kontrak body", () => {
  it("mode tidak dikenal, rows bukan array, kolom wajib hilang → ditolak skema (4xx), tanpa tulis", async () => {
    for (const body of [
      { mode: "ganti-semua", rows: [baris()] },
      { mode: "lewati", rows: "x" },
      { mode: "lewati", rows: [{ nama: "A", pemilik: "B" }] },
      { rows: [baris()] },
    ]) {
      const res = await kirim(body);
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    }
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    tidakMenulis();
  });

  it("rows kosong → 400; lebih dari 1000 baris → ditolak", async () => {
    const kosong = await kirim({ mode: "lewati", rows: [] });
    expect(kosong.status).toBe(400);
    expect((await kosong.json()).message).toBe("Tidak ada baris untuk diimpor");
    const banyak = await kirim({ mode: "lewati", rows: Array.from({ length: 1001 }, (_, i) => baris({ nama: `U${i}` })) });
    expect(banyak.status).toBeGreaterThanOrEqual(400);
    tidakMenulis();
  });
});

describe("dryRun", () => {
  it("menghitung tanpa menulis dan tanpa transaksi; nomor baris = indeks + 1", async () => {
    const res = await kirim({
      mode: "lewati",
      dryRun: true,
      rows: [baris(), baris({ nama: "Warung Ada", pemilik: "Bu Ada" }), baris({ nama: "Dua", kategori: "Minuman" }), baris({ nama: "Tiga", kontak: "81234567890" })],
    });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.success).toBe(true);
    expect(j.data).toMatchObject({ ditambah: 2, diperbarui: 0, dilewati: 1, totalGalat: 1, totalPeringatan: 1 });
    expect(j.data.galat).toEqual([{ baris: 3, alasan: expect.stringContaining('Kategori "Minuman" tidak dikenal') }]);
    expect(j.data.peringatan[0].baris).toBe(4);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    tidakMenulis();
  });

  it("dryRun dengan galat tetap 200 (galat dilaporkan di data, bukan dilempar)", async () => {
    const res = await kirim({ mode: "lewati", dryRun: true, rows: [baris({ kategori: "Nope" })] });
    expect(res.status).toBe(200);
    expect((await res.json()).data.totalGalat).toBe(1);
  });

  it("galat dan peringatan dipotong 50 contoh, total tetap utuh", async () => {
    const rows = Array.from({ length: 120 }, (_, i) => baris({ nama: `U${i}`, kategori: "Nope" }));
    const j = await (await kirim({ mode: "lewati", dryRun: true, rows })).json();
    expect(j.data.galat).toHaveLength(50);
    expect(j.data.totalGalat).toBe(120);
  });
});

describe("impor sungguhan", () => {
  it("mode lewati: menambah baris baru dalam satu transaksi, yang sudah ada dilewati", async () => {
    const res = await kirim({
      mode: "lewati",
      rows: [baris(), baris({ nama: " WARUNG ada ", pemilik: "bu ada", alamat: "diabaikan" }), baris({ nama: "Kerajinan A", kategori: "kerajinan", deskripsi: "a<b", kontak: "0812-34" })],
    });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j).toMatchObject({ success: true, data: { ditambah: 2, diperbarui: 0, dilewati: 1 } });
    expect(j.message).toBe("2 UMKM ditambah, 0 diperbarui, 1 dilewati");
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.$transaction.mock.calls[0][1]).toMatchObject({ timeout: 30_000 });
    expect(prismaMock.umkm.createMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.umkm.createMany.mock.calls[0][0].data).toEqual([
      { nama: "Warung Baru", pemilik: "Pak Baru", kategoriId: "k-makan" },
      { nama: "Kerajinan A", pemilik: "Pak Baru", kategoriId: "k-kerajinan", deskripsi: "<p>a&lt;b</p>", kontak: "081234" },
    ]);
    expect(prismaMock.umkm.update).not.toHaveBeenCalled();
  });

  it("mode perbarui: hanya field terisi menimpa (sel kosong tidak), tidak menambah duplikat", async () => {
    const res = await kirim({
      mode: "perbarui",
      rows: [baris({ nama: "Warung Ada", pemilik: "Bu Ada", kategori: "Kerajinan", alamat: "Br. Baru", kontak: "", deskripsi: "" })],
    });
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual({ ditambah: 0, diperbarui: 1, dilewati: 0 });
    expect(prismaMock.umkm.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.umkm.update).toHaveBeenCalledWith({ where: { id: "u-ada" }, data: { kategoriId: "k-kerajinan", alamat: "Br. Baru" } });
    expect(prismaMock.umkm.createMany).not.toHaveBeenCalled();
  });

  it("membaca hanya kategori aktif & UMKM belum dihapus", async () => {
    await kirim({ mode: "lewati", rows: [baris()] });
    expect(prismaMock.kategoriProdukUmkm.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isActive: true, deletedAt: null } }));
    expect(prismaMock.umkm.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { deletedAt: null } }));
  });

  it("1 baris galat (kategori tak dikenal) → 400, daftar galat, tidak ada tulis sama sekali", async () => {
    const res = await kirim({ mode: "lewati", rows: [baris(), baris({ nama: "Dua", kategori: "Minuman" }), baris({ nama: "Tiga" })] });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.success).toBe(false);
    expect(j.message).toBe("Impor dibatalkan: 1 baris tidak valid. Tidak ada data yang disimpan");
    expect(j.galat).toEqual([{ baris: 2, alasan: expect.stringContaining('"Minuman"') }]);
    expect(j.totalGalat).toBe(1);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    tidakMenulis();
  });

  it("kategori ambigu (dua kategori aktif bernama sama) → 400", async () => {
    prismaMock.kategoriProdukUmkm.findMany.mockResolvedValue([...KATEGORI, { id: "k-makan-2", nama: "makanan" }]);
    const res = await kirim({ mode: "lewati", rows: [baris()] });
    expect(res.status).toBe(400);
    expect((await res.json()).galat[0].alasan).toContain("ambigu");
    tidakMenulis();
  });

  it("duplikat nama+pemilik di dalam berkas → 400 dari baris kedua, tidak ada tulis", async () => {
    const res = await kirim({ mode: "lewati", rows: [baris(), baris({ nama: "WARUNG  baru" })] });
    expect(res.status).toBe(400);
    expect((await res.json()).galat).toEqual([{ baris: 2, alasan: "Nama + pemilik sama dengan baris 1 di berkas ini" }]);
    tidakMenulis();
  });

  it("server memvalidasi ulang: panjang berlebih & kontak huruf ditolak walau lolos skema", async () => {
    const res = await kirim({ mode: "lewati", rows: [baris({ nama: "x".repeat(151) }), baris({ nama: "Dua", kontak: "abc" })] });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.galat.map((g: { baris: number }) => g.baris)).toEqual([1, 2]);
    tidakMenulis();
  });

  it("impor tepat 1000 baris (batas skema) → satu kali createMany", async () => {
    const rows = Array.from({ length: 1000 }, (_, i) => baris({ nama: `U${i}` }));
    const res = await kirim({ mode: "lewati", rows });
    expect(res.status).toBe(200);
    expect(prismaMock.umkm.createMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.umkm.createMany.mock.calls[0][0].data).toHaveLength(1000);
  });
});

describe("galat tak terduga & privasi", () => {
  it("galat DB → 500 generik; log hanya kelas galat & kode, tidak memuat data", async () => {
    const galat = Object.assign(new Error("Unique constraint failed on nama=RAHASIA-NAMA kontak=0812RAHASIA"), { code: "P2002" });
    prismaMock.$transaction.mockRejectedValue(galat);
    const res = await kirim({ mode: "lewati", rows: [baris({ nama: "RAHASIA-NAMA", pemilik: "RAHASIA-PEMILIK", kontak: "0812999" })] });
    expect(res.status).toBe(500);
    const j = await res.json();
    expect(j).toEqual({ success: false, message: "Gagal mengimpor data UMKM" });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const dicatat = JSON.stringify([...errorSpy.mock.calls, ...logSpy.mock.calls]);
    expect(dicatat).toContain("P2002");
    for (const rahasia of ["RAHASIA", "0812"]) expect(dicatat).not.toContain(rahasia);
  });

  it("jalur sukses & galat validasi tidak mencatat data apa pun", async () => {
    await kirim({ mode: "lewati", rows: [baris({ nama: "RAHASIA-NAMA", kontak: "0812999" })] });
    await kirim({ mode: "lewati", rows: [baris({ nama: "RAHASIA-LAIN", kategori: "Nope" })] });
    expect(JSON.stringify([...errorSpy.mock.calls, ...logSpy.mock.calls])).not.toContain("RAHASIA");
  });
});
