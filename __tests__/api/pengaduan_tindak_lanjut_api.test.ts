// @vitest-environment node
// Pengaduan Masyarakat — status & tanggapan (Juknis lomba 3.3): helper status, PUT updt khusus admin, create publik
// yang mengabaikan status/tanggapan, rekap publik tanpa data pribadi, dan find-many dan /:id yang tetap admin-only.
// Request HTTP sungguhan lewat modul Elysia; prisma & auth di-mock.
import { describe, it, expect, vi, beforeEach } from "vitest";
import Elysia from "elysia";

const { requireAuthMock, prismaMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  prismaMock: {
    pengaduanMasyarakat: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    jenisPengaduan: { findMany: vi.fn() },
  },
}));
vi.mock("@/lib/api-auth", () => ({ requireAuth: () => requireAuthMock() }));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: {}, MINIO_BUCKET: "bucket-test" }));

import LayananOnlineDesa from "@/app/api/[[...slugs]]/_lib/inovasi/layanan-online-desa";
import { PESAN_DATA_PRIBADI_BUKAN_ADMIN } from "@/app/api/[[...slugs]]/_lib/_data-pribadi/guard";
import { PESAN_TANGGAPI_BUKAN_ADMIN } from "@/app/api/[[...slugs]]/_lib/inovasi/layanan-online-desa/pengaduan-masyarakat";
import {
  PENGADUAN_STATUS,
  PENGADUAN_STATUS_LABEL,
  PENGADUAN_TANGGAPAN_MAX,
  parsePengaduanStatus,
  resolvePengaduanStatus,
} from "@/lib/pengaduan-status";

const BASE = "/api/inovasi/layananonlinedesa/pengaduanmasyarakat";
const app = new Elysia({ prefix: "/api" }).group("/inovasi", (g) => g.use(LayananOnlineDesa));
const call = (url: string, init?: RequestInit) => app.handle(new Request(`http://localhost${url}`, init));
const sendJson = (method: string, url: string, body: unknown) =>
  call(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const unauthorized = () => ({
  authenticated: false,
  response: new Response(JSON.stringify({ success: false, message: "Unauthorized - Silakan login terlebih dahulu" }), { status: 401 }),
});
const asRole = (roleId: string) => ({ authenticated: true, user: { id: "u-rekaan", roleId, isActive: true } }); // test-only

beforeEach(() => {
  vi.clearAllMocks();
  requireAuthMock.mockResolvedValue(asRole("2"));
});

describe("helper status pengaduan", () => {
  it("null/undefined/kosong dibaca BARU, status dikenal dikembalikan apa adanya", () => {
    expect(resolvePengaduanStatus(null)).toBe("BARU");
    expect(resolvePengaduanStatus(undefined)).toBe("BARU");
    expect(resolvePengaduanStatus("")).toBe("BARU");
    for (const s of PENGADUAN_STATUS) expect(resolvePengaduanStatus(s)).toBe(s);
  });

  it("validator menolak nilai di luar BARU|DIPROSES|SELESAI|DITOLAK (termasuk huruf kecil dan bukan string)", () => {
    expect([...PENGADUAN_STATUS]).toEqual(["BARU", "DIPROSES", "SELESAI", "DITOLAK"]);
    expect(parsePengaduanStatus("SELESAI")).toBe("SELESAI");
    for (const bad of ["selesai", "DONE", "", null, undefined, 1, {}]) expect(parsePengaduanStatus(bad)).toBeNull();
  });

  it("setiap status punya label Indonesia", () => {
    expect(PENGADUAN_STATUS_LABEL).toEqual({ BARU: "Baru", DIPROSES: "Diproses", SELESAI: "Selesai", DITOLAK: "Ditolak" });
  });
});

describe("PUT updt (khusus admin)", () => {
  const url = `${BASE}/updt/p-1`;
  const form = { status: "SELESAI", tanggapan: "Sudah ditindaklanjuti" };

  it("401 tanpa sesi dan 403 untuk user biasa (role 5); tidak menyentuh database", async () => {
    requireAuthMock.mockResolvedValue(unauthorized());
    expect((await sendJson("PUT", url, form)).status).toBe(401);

    requireAuthMock.mockResolvedValue(asRole("5"));
    const res = await sendJson("PUT", url, form);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ success: false, message: PESAN_TANGGAPI_BUKAN_ADMIN });
    expect(prismaMock.pengaduanMasyarakat.update).not.toHaveBeenCalled();
  });

  it("admin: menyimpan status + tanggapan teks polos dan mengisi tanggapanAt dari server", async () => {
    prismaMock.pengaduanMasyarakat.findUnique.mockResolvedValue({ id: "p-1", tanggapan: null });
    prismaMock.pengaduanMasyarakat.update.mockImplementation(async (args: { data: Record<string, unknown> }) => ({ id: "p-1", ...args.data }));

    const res = await sendJson("PUT", url, {
      status: "SELESAI",
      tanggapan: "<p>Sudah <b>ditindak</b> &amp; selesai</p><script>alert(1)</script><img src=x onerror=alert(2)>",
    });

    expect(res.status).toBe(200);
    const { data } = prismaMock.pengaduanMasyarakat.update.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(data.status).toBe("SELESAI");
    expect(data.tanggapan).toBe("Sudah ditindak & selesai");
    expect(data.tanggapanAt).toBeInstanceOf(Date);
  });

  it("sisa tanda < dan > dari entitas ter-encode tidak ikut tersimpan", async () => {
    prismaMock.pengaduanMasyarakat.findUnique.mockResolvedValue({ id: "p-1", tanggapan: null });
    prismaMock.pengaduanMasyarakat.update.mockResolvedValue({ id: "p-1" });
    await sendJson("PUT", url, { status: "DIPROSES", tanggapan: "&lt;script&gt;alert(1)&lt;/script&gt; ditinjau" });
    const { data } = prismaMock.pengaduanMasyarakat.update.mock.calls[0][0] as { data: { tanggapan: string } };
    expect(data.tanggapan).not.toMatch(/[<>]/);
    expect(data.tanggapan).toContain("ditinjau");
  });

  it("tanggapan tak berubah → tanggapanAt tidak disentuh; dikosongkan → keduanya null", async () => {
    prismaMock.pengaduanMasyarakat.findUnique.mockResolvedValue({ id: "p-1", tanggapan: "Sudah ditindaklanjuti" });
    prismaMock.pengaduanMasyarakat.update.mockResolvedValue({ id: "p-1" });

    await sendJson("PUT", url, form);
    expect(prismaMock.pengaduanMasyarakat.update.mock.calls[0][0].data).toEqual({ status: "SELESAI" });

    await sendJson("PUT", url, { status: "DITOLAK", tanggapan: "   " });
    expect(prismaMock.pengaduanMasyarakat.update.mock.calls[1][0].data).toEqual({ status: "DITOLAK", tanggapan: null, tanggapanAt: null });
  });

  it("tanpa field tanggapan hanya mengubah status", async () => {
    prismaMock.pengaduanMasyarakat.findUnique.mockResolvedValue({ id: "p-1", tanggapan: "Lama" });
    prismaMock.pengaduanMasyarakat.update.mockResolvedValue({ id: "p-1" });
    await sendJson("PUT", url, { status: "DIPROSES" });
    expect(prismaMock.pengaduanMasyarakat.update.mock.calls[0][0].data).toEqual({ status: "DIPROSES" });
  });

  it("400 untuk status tidak dikenal atau tanggapan melebihi batas; 404 bila pengaduan tidak ada", async () => {
    expect((await sendJson("PUT", url, { status: "SELESAI!", tanggapan: "x" })).status).toBe(400);
    const panjang = await sendJson("PUT", url, { status: "SELESAI", tanggapan: "a".repeat(PENGADUAN_TANGGAPAN_MAX + 1) });
    expect(panjang.status).toBe(400);
    expect(prismaMock.pengaduanMasyarakat.update).not.toHaveBeenCalled();

    prismaMock.pengaduanMasyarakat.findUnique.mockResolvedValue(null);
    expect((await sendJson("PUT", url, form)).status).toBe(404);
  });
});

describe("POST create publik", () => {
  it("mengabaikan status/tanggapan/tanggapanAt dari kiriman warga dan hanya membalas id", async () => {
    prismaMock.pengaduanMasyarakat.create.mockResolvedValue({ id: "baru-1" });
    const res = await sendJson("POST", `${BASE}/create`, {
      name: "Warga Uji",
      email: "uji@example.test",
      nomorTelepon: "081200000000",
      nik: "5171000000000001",
      judulPengaduan: "Jalan rusak",
      lokasiKejadian: "Banjar Uji",
      deskripsiPengaduan: "Ada lubang",
      jenisPengaduanId: "j-1",
      imageId: "img-1",
      status: "SELESAI",
      tanggapan: "Palsu",
      tanggapanAt: "2026-01-01T00:00:00.000Z",
    });

    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual({ id: "baru-1" });
    const { data } = prismaMock.pengaduanMasyarakat.create.mock.calls[0][0] as { data: Record<string, unknown> };
    for (const key of ["status", "tanggapan", "tanggapanAt"]) expect(data).not.toHaveProperty(key);
  });
});

describe("GET rekap publik", () => {
  const rows = [
    { status: null, tanggapan: "Ditinjau petugas", tanggapanAt: new Date("2026-11-17T08:00:00Z"), jenisPengaduan: { nama: "Infrastruktur" },
      name: "Nama Rahasia", nik: "5171000000000001", email: "rahasia@example.test", judulPengaduan: "Judul Rahasia", id: "p-rahasia" }, // test-only
    { status: "SELESAI", tanggapan: "Sudah diperbaiki", tanggapanAt: new Date("2026-11-16T08:00:00Z"), jenisPengaduan: { nama: "Kebersihan" } },
  ];

  beforeEach(() => {
    requireAuthMock.mockResolvedValue(unauthorized());
    prismaMock.pengaduanMasyarakat.groupBy.mockImplementation(async ({ by }: { by: string[] }) =>
      by[0] === "status"
        ? [{ status: null, _count: { _all: 2 } }, { status: "BARU", _count: { _all: 3 } }, { status: "SELESAI", _count: { _all: 1 } }]
        : [{ jenisPengaduanId: "j-1", _count: { _all: 4 } }, { jenisPengaduanId: "j-2", _count: { _all: 2 } }],
    );
    prismaMock.pengaduanMasyarakat.findMany.mockResolvedValue(rows);
    prismaMock.jenisPengaduan.findMany.mockResolvedValue([{ id: "j-1", nama: "Infrastruktur" }, { id: "j-2", nama: "Kebersihan" }]);
  });

  it("terbuka tanpa login dan menghitung per status (null = BARU), per jenis, dan total", async () => {
    const res = await call(`${BASE}/rekap`);
    expect(res.status).toBe(200);
    expect(requireAuthMock).not.toHaveBeenCalled();
    const { data } = await res.json();
    expect(data.perStatus).toEqual({ BARU: 5, DIPROSES: 0, SELESAI: 1, DITOLAK: 0 });
    expect(data.total).toBe(6);
    expect(data.perJenis).toEqual([{ jenis: "Infrastruktur", jumlah: 4 }, { jenis: "Kebersihan", jumlah: 2 }]);
  });

  it("bentuk respons persis: tanpa nama, email, telepon, NIK, judul, lokasi, deskripsi, gambar, id", async () => {
    const { data } = await (await call(`${BASE}/rekap`)).json();
    expect(Object.keys(data).sort()).toEqual(["perJenis", "perStatus", "tanggapanTerbaru", "total"]);
    expect(data.tanggapanTerbaru).toHaveLength(2);
    for (const item of data.tanggapanTerbaru) expect(Object.keys(item).sort()).toEqual(["jenis", "status", "tanggapan", "tanggapanAt"]);
    expect(data.tanggapanTerbaru[0]).toEqual({ jenis: "Infrastruktur", status: "BARU", tanggapan: "Ditinjau petugas", tanggapanAt: "2026-11-17T08:00:00.000Z" });
    const json = JSON.stringify(data);
    for (const rahasia of ["Nama Rahasia", "5171000000000001", "rahasia@example.test", "Judul Rahasia", "p-rahasia"]) {
      expect(json).not.toContain(rahasia);
    }
  });

  it("query tanggapan hanya memilih kolom aman, maksimal 20, terbaru dulu", async () => {
    await call(`${BASE}/rekap`);
    const args = prismaMock.pengaduanMasyarakat.findMany.mock.calls[0][0];
    expect(Object.keys(args.select).sort()).toEqual(["jenisPengaduan", "status", "tanggapan", "tanggapanAt"]);
    expect(args.take).toBe(20);
    expect(args.orderBy).toEqual({ tanggapanAt: "desc" });
    expect(args.where.tanggapan).toEqual({ not: null });
  });

  it("belum ada pengaduan → rekap kosong, bukan galat", async () => {
    prismaMock.pengaduanMasyarakat.groupBy.mockResolvedValue([]);
    prismaMock.pengaduanMasyarakat.findMany.mockResolvedValue([]);
    prismaMock.jenisPengaduan.findMany.mockResolvedValue([]);
    const { data } = await (await call(`${BASE}/rekap`)).json();
    expect(data).toEqual({ total: 0, perStatus: { BARU: 0, DIPROSES: 0, SELESAI: 0, DITOLAK: 0 }, perJenis: [], tanggapanTerbaru: [] });
  });
});

describe("find-many & /:id tetap admin-only (rekap publik tidak melonggarkannya)", () => {
  it.each([`${BASE}/find-many`, `${BASE}/p-1`])("%s: 401 tanpa sesi, 403 role 5, 200 admin", async (url) => {
    prismaMock.pengaduanMasyarakat.findMany.mockResolvedValue([]);
    prismaMock.pengaduanMasyarakat.count.mockResolvedValue(0);
    prismaMock.pengaduanMasyarakat.findUnique.mockResolvedValue({ id: "p-1" });

    requireAuthMock.mockResolvedValue(unauthorized());
    expect((await call(url)).status).toBe(401);

    requireAuthMock.mockResolvedValue(asRole("5"));
    const forbidden = await call(url);
    expect(forbidden.status).toBe(403);
    expect((await forbidden.json()).message).toBe(PESAN_DATA_PRIBADI_BUKAN_ADMIN);

    requireAuthMock.mockResolvedValue(asRole("2"));
    expect((await call(url)).status).toBe(200);
  });

  it("/rekap tidak ditangkap rute /:id (tidak memanggil findUnique)", async () => {
    requireAuthMock.mockResolvedValue(unauthorized());
    prismaMock.pengaduanMasyarakat.groupBy.mockResolvedValue([]);
    prismaMock.pengaduanMasyarakat.findMany.mockResolvedValue([]);
    prismaMock.jenisPengaduan.findMany.mockResolvedValue([]);
    expect((await call(`${BASE}/rekap`)).status).toBe(200);
    expect(prismaMock.pengaduanMasyarakat.findUnique).not.toHaveBeenCalled();
  });

  it("find-many menyaring status; BARU mencakup baris lama bernilai null; status tak dikenal → 400", async () => {
    prismaMock.pengaduanMasyarakat.findMany.mockResolvedValue([]);
    prismaMock.pengaduanMasyarakat.count.mockResolvedValue(0);

    await call(`${BASE}/find-many?status=BARU`);
    expect(prismaMock.pengaduanMasyarakat.findMany.mock.calls[0][0].where.AND).toEqual([{ OR: [{ status: null }, { status: "BARU" }] }]);

    await call(`${BASE}/find-many?status=SELESAI`);
    expect(prismaMock.pengaduanMasyarakat.findMany.mock.calls[1][0].where.AND).toEqual([{ status: "SELESAI" }]);

    expect((await call(`${BASE}/find-many?status=ngawur`)).status).toBe(400);
  });
});
