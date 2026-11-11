// @vitest-environment node
// Dokumen Perencanaan (RPJM/RKP/Berita Acara): validasi per jenis, filter + paginasi,
// create/update/delete, label "Bersumber dari RKP" per tahun, dan kontrak monev lama.
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  dokumenPerencanaan: {
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
  },
  fileStorage: { findUnique: vi.fn() },
  kegiatanDesa: {
    findMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import dokumenPerencanaanCreate from "@/app/api/[[...slugs]]/_lib/desa/dokumen-perencanaan/create";
import dokumenPerencanaanDelete from "@/app/api/[[...slugs]]/_lib/desa/dokumen-perencanaan/del";
import dokumenPerencanaanFindMany from "@/app/api/[[...slugs]]/_lib/desa/dokumen-perencanaan/find-many";
import dokumenPerencanaanFindUnique from "@/app/api/[[...slugs]]/_lib/desa/dokumen-perencanaan/findUnique";
import dokumenPerencanaanUpdate from "@/app/api/[[...slugs]]/_lib/desa/dokumen-perencanaan/updt";
import kegiatanDesaMonev from "@/app/api/[[...slugs]]/_lib/desa/kegiatan-desa/monev";
import {
  buildRkpIndex,
  formatPeriodeDokumen,
  parseDokumenPerencanaanInput,
  rkpSourceLabel,
} from "@/lib/dokumen-perencanaan";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context handler test
const ctx = (over: Record<string, any>) => ({ set: {}, query: {}, params: {}, body: {}, ...over }) as any;

const FILE_ID = "file-pdf-1"; // test-only
const rpjmBody = { jenis: "RPJM", judul: "RPJM Desa Contoh", tahunMulai: 2021, tahunSelesai: 2027 }; // test-only
const rkpBody = { jenis: "RKP", judul: "RKP Desa Contoh", tahun: 2026 }; // test-only
const baBody = {
  jenis: "BERITA_ACARA_MUSYAWARAH",
  judul: "Berita Acara Contoh", // test-only
  tahun: 2026,
  jenisMusyawarah: "MUSRENBANGDES",
};

beforeEach(() => {
  vi.resetAllMocks();
  prismaMock.fileStorage.findUnique.mockResolvedValue({ mimeType: "application/pdf", isActive: true });
  prismaMock.dokumenPerencanaan.create.mockResolvedValue({ id: "d1" });
  prismaMock.dokumenPerencanaan.update.mockResolvedValue({ id: "d1" });
  prismaMock.dokumenPerencanaan.findFirst.mockResolvedValue({ id: "d1" });
});

describe("parseDokumenPerencanaanInput — validasi per jenis", () => {
  it("menolak jenis di luar RPJM|RKP|BERITA_ACARA_MUSYAWARAH", () => {
    const r = parseDokumenPerencanaanInput({ ...rkpBody, jenis: "APBDES" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain("RPJM, RKP, BERITA_ACARA_MUSYAWARAH");
  });

  it("menolak judul kosong atau terlalu pendek", () => {
    for (const judul of ["", "  ", "ab", undefined]) {
      expect(parseDokumenPerencanaanInput({ ...rkpBody, judul }).ok).toBe(false);
    }
  });

  it("RPJM wajib tahunMulai dan tahunSelesai", () => {
    expect(parseDokumenPerencanaanInput({ ...rpjmBody, tahunMulai: undefined }).ok).toBe(false);
    expect(parseDokumenPerencanaanInput({ ...rpjmBody, tahunSelesai: null }).ok).toBe(false);
  });

  it("RPJM menolak tahunSelesai lebih kecil dari tahunMulai", () => {
    const r = parseDokumenPerencanaanInput({ ...rpjmBody, tahunMulai: 2027, tahunSelesai: 2021 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain("tahun mulai");
  });

  it("RPJM menerima periode 6 tahun, 8 tahun, dan 1 tahun (selesai = mulai)", () => {
    for (const [mulai, selesai] of [[2021, 2027], [2021, 2029], [2026, 2026]]) {
      const r = parseDokumenPerencanaanInput({ ...rpjmBody, tahunMulai: mulai, tahunSelesai: selesai });
      expect(r.ok).toBe(true);
    }
  });

  it("RPJM mengosongkan tahun & jenisMusyawarah yang tidak relevan", () => {
    const r = parseDokumenPerencanaanInput({ ...rpjmBody, tahun: 2026, jenisMusyawarah: "MUSDES" });
    expect(r).toMatchObject({
      ok: true,
      data: { tahun: null, tahunMulai: 2021, tahunSelesai: 2027, jenisMusyawarah: null },
    });
  });

  it("RKP wajib tahun dan mengosongkan tahunMulai/Selesai", () => {
    expect(parseDokumenPerencanaanInput({ ...rkpBody, tahun: undefined }).ok).toBe(false);
    const r = parseDokumenPerencanaanInput({ ...rkpBody, tahunMulai: 2021, tahunSelesai: 2027 });
    expect(r).toMatchObject({
      ok: true,
      data: { tahun: 2026, tahunMulai: null, tahunSelesai: null, jenisMusyawarah: null },
    });
  });

  it("menolak tahun pecahan, string, atau di luar rentang", () => {
    for (const tahun of [2026.5, "2026", 1999, 2101, Number.NaN]) {
      expect(parseDokumenPerencanaanInput({ ...rkpBody, tahun }).ok).toBe(false);
    }
  });

  it("Berita Acara wajib tahun dan jenisMusyawarah valid", () => {
    expect(parseDokumenPerencanaanInput({ ...baBody, jenisMusyawarah: undefined }).ok).toBe(false);
    expect(parseDokumenPerencanaanInput({ ...baBody, jenisMusyawarah: "RAPAT" }).ok).toBe(false);
    expect(parseDokumenPerencanaanInput({ ...baBody, tahun: undefined }).ok).toBe(false);
    for (const jm of ["MUSDES", "MUSRENBANGDES", "MMD", "LAINNYA"]) {
      expect(parseDokumenPerencanaanInput({ ...baBody, jenisMusyawarah: jm }).ok).toBe(true);
    }
  });

  it("menormalkan teks opsional: trim, kosong jadi null, batas panjang", () => {
    const r = parseDokumenPerencanaanInput({ ...rkpBody, judul: "  RKP Desa  ", nomorPerdes: "  ", ringkasan: " ok " });
    expect(r).toMatchObject({ ok: true, data: { judul: "RKP Desa", nomorPerdes: null, ringkasan: "ok" } });
    expect(parseDokumenPerencanaanInput({ ...rkpBody, nomorPerdes: "x".repeat(101) }).ok).toBe(false);
    expect(parseDokumenPerencanaanInput({ ...rkpBody, ringkasan: "x".repeat(5001) }).ok).toBe(false);
    expect(parseDokumenPerencanaanInput({ ...rkpBody, nomorPerdes: 12 }).ok).toBe(false);
  });

  it("fileId: tidak dikirim = tidak ada kunci, null/'' = lepas file, string = dipakai", () => {
    const tanpa = parseDokumenPerencanaanInput(rkpBody);
    expect(tanpa.ok && "fileId" in tanpa.data).toBe(false);
    expect(parseDokumenPerencanaanInput({ ...rkpBody, fileId: null })).toMatchObject({ ok: true, data: { fileId: null } });
    expect(parseDokumenPerencanaanInput({ ...rkpBody, fileId: "" })).toMatchObject({ ok: true, data: { fileId: null } });
    expect(parseDokumenPerencanaanInput({ ...rkpBody, fileId: FILE_ID })).toMatchObject({ ok: true, data: { fileId: FILE_ID } });
    expect(parseDokumenPerencanaanInput({ ...rkpBody, fileId: 5 }).ok).toBe(false);
  });
});

describe("formatPeriodeDokumen", () => {
  it("RPJM tampil rentang, jenis lain tampil tahun, kosong tampil '-'", () => {
    expect(formatPeriodeDokumen({ jenis: "RPJM", tahunMulai: 2021, tahunSelesai: 2027 })).toBe("2021 - 2027");
    expect(formatPeriodeDokumen({ jenis: "RKP", tahun: 2026 })).toBe("2026");
    expect(formatPeriodeDokumen({ jenis: "RPJM" })).toBe("-");
    expect(formatPeriodeDokumen({ jenis: "RKP" })).toBe("-");
  });
});

describe("GET find-many — filter & paginasi", () => {
  beforeEach(() => {
    prismaMock.dokumenPerencanaan.findMany.mockResolvedValue([{ id: "d1" }]);
    prismaMock.dokumenPerencanaan.count.mockResolvedValue(25);
  });

  it("mengembalikan shape paginasi dengan satu findMany + satu count (tanpa N+1)", async () => {
    const res = await dokumenPerencanaanFindMany(ctx({ query: { page: "2", limit: "10" } }));
    expect(res).toMatchObject({ success: true, page: 2, limit: 10, total: 25, totalPages: 3 });
    expect(prismaMock.dokumenPerencanaan.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.dokumenPerencanaan.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.dokumenPerencanaan.findMany.mock.calls[0][0]).toMatchObject({ skip: 10, take: 10 });
  });

  it("hanya mengambil dokumen aktif dan membatasi limit maksimum", async () => {
    await dokumenPerencanaanFindMany(ctx({ query: { limit: "9999" } }));
    const args = prismaMock.dokumenPerencanaan.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ isActive: true });
    expect(args.take).toBe(50);
  });

  it("memfilter per jenis", async () => {
    await dokumenPerencanaanFindMany(ctx({ query: { jenis: "RKP" } }));
    expect(prismaMock.dokumenPerencanaan.findMany.mock.calls[0][0].where).toMatchObject({ jenis: "RKP" });
  });

  it("memfilter per tahun: cocok tahun dokumen atau tercakup periode RPJM", async () => {
    await dokumenPerencanaanFindMany(ctx({ query: { tahun: "2024" } }));
    expect(prismaMock.dokumenPerencanaan.findMany.mock.calls[0][0].where.OR).toEqual([
      { tahun: 2024 },
      { tahunMulai: { lte: 2024 }, tahunSelesai: { gte: 2024 } },
    ]);
  });

  it("menolak jenis dan tahun tidak valid dengan 400 tanpa query DB", async () => {
    const bad = ctx({ query: { jenis: "XYZ" } });
    expect(await dokumenPerencanaanFindMany(bad)).toMatchObject({ success: false });
    expect(bad.set.status).toBe(400);
    const badYear = ctx({ query: { tahun: "abc" } });
    expect(await dokumenPerencanaanFindMany(badYear)).toMatchObject({ success: false });
    expect(badYear.set.status).toBe(400);
    expect(prismaMock.dokumenPerencanaan.findMany).not.toHaveBeenCalled();
  });

  it("pencarian memakai judul/nomorPerdes case-insensitive", async () => {
    await dokumenPerencanaanFindMany(ctx({ query: { search: " rkp " } }));
    expect(prismaMock.dokumenPerencanaan.findMany.mock.calls[0][0].where.AND).toEqual([
      {
        OR: [
          { judul: { contains: "rkp", mode: "insensitive" } },
          { nomorPerdes: { contains: "rkp", mode: "insensitive" } },
        ],
      },
    ]);
  });
});

describe("GET by id", () => {
  it("mengembalikan dokumen aktif, 404 bila tidak ada", async () => {
    prismaMock.dokumenPerencanaan.findFirst.mockResolvedValueOnce({ id: "d1", judul: "x" });
    expect(await dokumenPerencanaanFindUnique(ctx({ params: { id: "d1" } }))).toMatchObject({
      success: true,
      data: { id: "d1" },
    });
    prismaMock.dokumenPerencanaan.findFirst.mockResolvedValueOnce(null);
    const missing = ctx({ params: { id: "nope" } });
    expect(await dokumenPerencanaanFindUnique(missing)).toMatchObject({ success: false });
    expect(missing.set.status).toBe(404);
  });
});

describe("POST create", () => {
  it("menyimpan field sesuai jenis (RPJM) bersama fileId PDF", async () => {
    const res = await dokumenPerencanaanCreate(ctx({ body: { ...rpjmBody, tahun: 2026, fileId: FILE_ID } }));
    expect(res).toMatchObject({ success: true });
    expect(prismaMock.dokumenPerencanaan.create.mock.calls[0][0].data).toMatchObject({
      jenis: "RPJM",
      tahun: null,
      tahunMulai: 2021,
      tahunSelesai: 2027,
      fileId: FILE_ID,
    });
  });

  it("menolak body tidak valid dengan 400 dan tidak menulis ke DB", async () => {
    const c = ctx({ body: { ...rpjmBody, tahunSelesai: 2000 } });
    expect(await dokumenPerencanaanCreate(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(400);
    expect(prismaMock.dokumenPerencanaan.create).not.toHaveBeenCalled();
  });

  it("menolak file yang bukan PDF atau tidak ditemukan", async () => {
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ mimeType: "application/gzip", isActive: true });
    const notPdf = ctx({ body: { ...rkpBody, fileId: FILE_ID } });
    expect(await dokumenPerencanaanCreate(notPdf)).toMatchObject({ success: false, message: expect.stringContaining("PDF") });
    expect(notPdf.set.status).toBe(400);

    prismaMock.fileStorage.findUnique.mockResolvedValueOnce(null);
    const missing = ctx({ body: { ...rkpBody, fileId: FILE_ID } });
    expect(await dokumenPerencanaanCreate(missing)).toMatchObject({ success: false });
    expect(prismaMock.dokumenPerencanaan.create).not.toHaveBeenCalled();
  });

  it("tanpa fileId tidak memeriksa FileStorage dan menyimpan fileId null", async () => {
    await dokumenPerencanaanCreate(ctx({ body: rkpBody }));
    expect(prismaMock.fileStorage.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.dokumenPerencanaan.create.mock.calls[0][0].data.fileId).toBeNull();
  });
});

describe("PUT update", () => {
  it("fileId tidak dikirim = berkas lama dipertahankan (kunci fileId tidak ikut update)", async () => {
    await dokumenPerencanaanUpdate(ctx({ params: { id: "d1" }, body: rkpBody }));
    expect(prismaMock.dokumenPerencanaan.update.mock.calls[0][0].data).not.toHaveProperty("fileId");
  });

  it("fileId null melepas berkas, fileId baru mengganti berkas", async () => {
    await dokumenPerencanaanUpdate(ctx({ params: { id: "d1" }, body: { ...rkpBody, fileId: null } }));
    expect(prismaMock.dokumenPerencanaan.update.mock.calls[0][0].data.fileId).toBeNull();
    await dokumenPerencanaanUpdate(ctx({ params: { id: "d1" }, body: { ...rkpBody, fileId: FILE_ID } }));
    expect(prismaMock.dokumenPerencanaan.update.mock.calls[1][0].data.fileId).toBe(FILE_ID);
  });

  it("mengganti jenis mengosongkan field jenis lama (RPJM → RKP)", async () => {
    await dokumenPerencanaanUpdate(ctx({ params: { id: "d1" }, body: { ...rkpBody, tahunMulai: 2021, tahunSelesai: 2027 } }));
    expect(prismaMock.dokumenPerencanaan.update.mock.calls[0][0].data).toMatchObject({
      jenis: "RKP",
      tahun: 2026,
      tahunMulai: null,
      tahunSelesai: null,
    });
  });

  it("404 bila dokumen tidak ada, 400 bila body tidak valid", async () => {
    prismaMock.dokumenPerencanaan.findFirst.mockResolvedValueOnce(null);
    const missing = ctx({ params: { id: "nope" }, body: rkpBody });
    expect(await dokumenPerencanaanUpdate(missing)).toMatchObject({ success: false });
    expect(missing.set.status).toBe(404);

    const bad = ctx({ params: { id: "d1" }, body: { ...rkpBody, tahun: null } });
    expect(await dokumenPerencanaanUpdate(bad)).toMatchObject({ success: false });
    expect(bad.set.status).toBe(400);
    expect(prismaMock.dokumenPerencanaan.update).not.toHaveBeenCalled();
  });
});

describe("DELETE del/:id", () => {
  it("soft delete: isActive=false + deletedAt terisi, bukan hapus baris", async () => {
    prismaMock.dokumenPerencanaan.updateMany.mockResolvedValue({ count: 1 });
    const res = await dokumenPerencanaanDelete(ctx({ params: { id: "d1" } }));
    expect(res).toMatchObject({ success: true });
    const args = prismaMock.dokumenPerencanaan.updateMany.mock.calls[0][0];
    expect(args.where).toEqual({ id: "d1", isActive: true });
    expect(args.data.isActive).toBe(false);
    expect(args.data.deletedAt).toBeInstanceOf(Date);
  });

  it("404 bila dokumen tidak ada atau sudah dihapus", async () => {
    prismaMock.dokumenPerencanaan.updateMany.mockResolvedValue({ count: 0 });
    const c = ctx({ params: { id: "nope" } });
    expect(await dokumenPerencanaanDelete(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(404);
  });
});

describe("label 'Bersumber dari RKP Desa {tahun}'", () => {
  const index = buildRkpIndex([
    { id: "r26", judul: "RKP 2026", tahun: 2026, file: { link: "/api/fileStorage/findUnique/a.pdf" } },
    { id: "r25", judul: "RKP 2025", tahun: 2025, file: null },
    { id: "r26b", judul: "RKP 2026 revisi", tahun: 2026, file: null },
  ]);

  it("cocok per tahun tanggal kegiatan dan menautkan PDF bila ada", () => {
    expect(rkpSourceLabel("2026-06-15", index)).toEqual({
      label: "Bersumber dari RKP Desa 2026",
      tahun: 2026,
      fileLink: "/api/fileStorage/findUnique/a.pdf",
    });
  });

  it("RKP tanpa PDF tetap berlabel tetapi tanpa tautan", () => {
    expect(rkpSourceLabel("2025-06-15", index)).toMatchObject({ tahun: 2025, fileLink: null });
  });

  it("tahun tanpa dokumen RKP, tanggal kosong, atau tanggal rusak → null (label disembunyikan)", () => {
    expect(rkpSourceLabel("2024-06-15", index)).toBeNull();
    expect(rkpSourceLabel(null, index)).toBeNull();
    expect(rkpSourceLabel("bukan-tanggal", index)).toBeNull();
  });

  it("dokumen pertama per tahun yang dipakai (urutan list terbaru dulu) dan tahun null diabaikan", () => {
    expect(index.get(2026)?.id).toBe("r26");
    expect(buildRkpIndex([{ id: "x", judul: "x", tahun: null }]).size).toBe(0);
  });
});

describe("kontrak endpoint monev lama tetap (aditif)", () => {
  it("bentuk respons & select kegiatan tidak berubah dan tidak menyentuh tabel dokumen", async () => {
    prismaMock.kegiatanDesa.findMany.mockResolvedValue([]);
    prismaMock.kegiatanDesa.count.mockResolvedValue(0);
    prismaMock.kegiatanDesa.groupBy.mockResolvedValue([]);
    prismaMock.kegiatanDesa.aggregate.mockResolvedValue({ _sum: { anggaran: null }, _avg: { progres: null } });

    const res = (await kegiatanDesaMonev(ctx({}))) as Record<string, unknown>;
    expect(Object.keys(res).sort()).toEqual(
      ["data", "limit", "message", "page", "success", "summary", "total", "totalPages"].sort(),
    );
    expect(Object.keys(prismaMock.kegiatanDesa.findMany.mock.calls[0][0].select).sort()).toEqual(
      ["anggaran", "deskripsiSingkat", "id", "image", "judul", "kategoriKegiatan", "lokasi", "progres", "statusPembangunan", "sumberDana", "tanggal"].sort(),
    );
    expect(prismaMock.dokumenPerencanaan.findMany).not.toHaveBeenCalled();
  });
});
