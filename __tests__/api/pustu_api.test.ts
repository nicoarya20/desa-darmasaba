// @vitest-environment node
// API PUSTU (model Puskesmas): body tervalidasi (jam per rentang hari, layanan unggulan, medsos, kontak darurat),
// teks kaya disanitasi saat simpan, find-many ringan berpaginasi, detail membaca Json dengan aman (termasuk
// medsos hasil migrasi facebook lama), hapus membersihkan berkas, rute daftar anak terpasang.
// Prisma & penghapus berkas di-mock.
import { Prisma } from "@prisma/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, removeReleasedFiles } = vi.hoisted(() => ({
  prismaMock: {
    puskesmas: {
      create: vi.fn((args: { data: object }) => Promise.resolve({ id: "pu1", jam: null, ...args.data })),
      update: vi.fn((args: { data: object }) => Promise.resolve({ id: "pu1", jam: null, ...args.data })),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    },
    pengurusPustu: { findMany: vi.fn() },
  },
  removeReleasedFiles: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles", () => ({ default: removeReleasedFiles }));

import create from "@/app/api/[[...slugs]]/_lib/kesehatan/puskesmas/create";
import del from "@/app/api/[[...slugs]]/_lib/kesehatan/puskesmas/del";
import findMany from "@/app/api/[[...slugs]]/_lib/kesehatan/puskesmas/find-many";
import findUnique from "@/app/api/[[...slugs]]/_lib/kesehatan/puskesmas/findUnique";
import modul from "@/app/api/[[...slugs]]/_lib/kesehatan/puskesmas/index";
import update from "@/app/api/[[...slugs]]/_lib/kesehatan/puskesmas/updt";

const pu = prismaMock.puskesmas;
// test-only: data rekaan.
const dasar = { name: "PUSTU Contoh", alamat: "Jl. Contoh No. 1" };
const jadwal = [
  { hari: "Senin – Kamis", jam: "08.00 – 14.00 WITA" },
  { hari: "Jumat – Sabtu", jam: "08.00 – 12.00 WITA" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context Elysia minimal
const ctx = (body?: unknown, params: Record<string, string> = {}, query: Record<string, string> = {}): any => ({
  body,
  params,
  query,
  set: { status: 200 },
});

beforeEach(() => vi.clearAllMocks());

describe("create", () => {
  it("menyimpan jam (jadwal), kontak darurat, layanan, medsos; Json kosong → NULL; facebook lama tidak ditulis", async () => {
    const body = {
      ...dasar,
      jadwal,
      kontak: { kontakPuskesmas: "", email: "pustu@contoh.id", kontakUGD: "0361 000 111" }, // test-only
      layananUnggulan: [{ judul: "Imunisasi", deskripsi: "Imunisasi rutin balita." }, { judul: "KIA" }],
      mediaSosial: [{ platform: "facebook", url: "https://www.facebook.com/pustu.contoh" }],
    };
    const res = await create(ctx(body));
    expect(res).toMatchObject({ success: true, data: { id: "pu1" } });
    const data = pu.create.mock.calls[0][0].data;
    expect(data.jam).toEqual({ create: { jadwal } });
    expect(data.kontak).toEqual({ create: { kontakPuskesmas: null, email: "pustu@contoh.id", kontakUGD: "0361 000 111" } });
    expect(data.kontak.create).not.toHaveProperty("facebook");
    expect(data.layananUnggulan).toEqual([
      { judul: "Imunisasi", deskripsi: "Imunisasi rutin balita." },
      { judul: "KIA", deskripsi: null },
    ]);
    expect(data.mediaSosial).toEqual(body.mediaSosial);

    await create(ctx({ ...dasar, jadwal: [], layananUnggulan: [], mediaSosial: [] }));
    const kosong = pu.create.mock.calls[1][0].data;
    expect(kosong.jam.create.jadwal).toBe(Prisma.DbNull);
    expect(kosong.layananUnggulan).toBe(Prisma.DbNull);
    expect(kosong.mediaSosial).toBe(Prisma.DbNull);
  });

  it("teks kaya (prosedur, tarif) disanitasi; editor kosong <p></p> → null", async () => {
    await create(
      ctx({
        ...dasar,
        prosedurPendaftaran: '<p onclick="x()">Ambil nomor <a href="javascript:alert(1)">antrean</a></p><script>alert(1)</script>',
        tarifBpjs: "<p></p>",
        tarifUmum: "<ul><li><strong>Rp 10.000</strong> per kunjungan</li></ul>",
      }),
    );
    const data = pu.create.mock.calls[0][0].data;
    expect(data.prosedurPendaftaran).toBe("<p>Ambil nomor antrean</p>");
    expect(data.tarifBpjs).toBeNull();
    expect(data.tarifUmum).toBe("<ul><li><strong>Rp 10.000</strong> per kunjungan</li></ul>");
  });

  it("layanan tanpa judul / medsos bukan http / email salah / jam kosong / link non-Google → 400 tanpa tulis", async () => {
    for (const body of [
      { ...dasar, layananUnggulan: [{ judul: "  ", deskripsi: "x" }] },
      { ...dasar, layananUnggulan: Array.from({ length: 21 }, (_, i) => ({ judul: `L${i}` })) },
      { ...dasar, mediaSosial: [{ platform: "facebook", url: "javascript:alert(1)" }] },
      { ...dasar, mediaSosial: [{ platform: "friendster", url: "https://contoh.id" }] },
      { ...dasar, kontak: { email: "bukan-email" } },
      { ...dasar, jadwal: [{ hari: "Senin", jam: "" }] },
      { ...dasar, linkPetunjukArah: "https://evil.example/peta" },
      { name: "", alamat: "x" },
    ]) {
      const c = ctx(body);
      expect(await create(c)).toMatchObject({ success: false });
      expect(c.set.status).toBe(400);
    }
    expect(pu.create).not.toHaveBeenCalled();
  });
});

describe("update", () => {
  it("field tak dikirim tidak disentuh; jam & kontak diubah lewat relasi; foto lama yang diganti dilepas", async () => {
    pu.findUnique.mockResolvedValueOnce({ imageId: "foto-lama", fotoBaganStrukturId: "bagan" });
    const res = await update(ctx({ ...dasar, imageId: "foto-baru", jadwal }, { id: "pu1" }));
    expect(res).toMatchObject({ success: true });
    const data = pu.update.mock.calls[0][0].data;
    expect(data.jam).toEqual({ update: { jadwal } });
    expect(data).not.toHaveProperty("kontak");
    expect(data.mediaSosial).toBeUndefined();
    expect(data.prosedurPendaftaran).toBeUndefined();
    expect(removeReleasedFiles).toHaveBeenCalledWith("Puskesmas", ["foto-lama", "bagan"], ["foto-baru", undefined]);
  });

  it("PUSTU tidak ada → 404", async () => {
    pu.findUnique.mockResolvedValueOnce(null);
    const c = ctx(dasar, { id: "x" });
    expect(await update(c)).toMatchObject({ success: false, message: "PUSTU tidak ditemukan" });
    expect(c.set.status).toBe(404);
  });
});

describe("baca & hapus", () => {
  it("detail: medsos hasil migrasi facebook lama terbaca, Json rusak dibuang, facebook lama tidak dikirim", async () => {
    pu.findUnique.mockResolvedValueOnce({
      id: "pu1",
      ...dasar,
      jam: { jadwal: [...jadwal, { hari: "Minggu" }] },
      kontak: { kontakPuskesmas: null, email: null, kontakUGD: "112" },
      // Bentuk yang ditulis migrasi 20261116150000_konten_pustu dari KontakPuskesmas.facebook.
      mediaSosial: [{ platform: "facebook", url: "https://www.facebook.com/pustu.contoh" }, { platform: "facebook", url: "puskesmas@gmail.com" }],
      layananUnggulan: [{ judul: "Imunisasi", deskripsi: "" }, { deskripsi: "tanpa judul" }, "rusak"],
    });
    const res = await findUnique(ctx(undefined, { id: "pu1" }));
    expect(res).toMatchObject({
      success: true,
      data: {
        jadwal,
        mediaSosial: [{ platform: "facebook", url: "https://www.facebook.com/pustu.contoh" }],
        layananUnggulan: [{ judul: "Imunisasi", deskripsi: null }],
      },
    });
    const select = pu.findUnique.mock.calls[0][0].select;
    expect(select.kontak.select).toEqual({ kontakPuskesmas: true, email: true, kontakUGD: true });
    expect(select.image.select).not.toHaveProperty("path");
    expect(res).not.toHaveProperty("data.jam");
  });

  it("detail tidak ada → 404", async () => {
    pu.findUnique.mockResolvedValueOnce(null);
    const c = ctx(undefined, { id: "x" });
    expect(await findUnique(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(404);
  });

  it("find-many berpaginasi, ringan (tanpa teks panjang/daftar anak), limit dibatasi 50", async () => {
    pu.findMany.mockResolvedValueOnce([{ id: "pu1", ...dasar, jam: { jadwal }, kontak: null }]);
    pu.count.mockResolvedValueOnce(51);
    const res = await findMany(ctx(undefined, {}, { page: "2", limit: "5000", search: "contoh" }));
    const args = pu.findMany.mock.calls[0][0];
    expect(args).toMatchObject({ take: 50, skip: 50, where: { isActive: true } });
    expect(args.select).not.toHaveProperty("prosedurPendaftaran");
    expect(args.select).not.toHaveProperty("fotoKegiatan");
    expect(res).toMatchObject({ success: true, totalPages: 2, data: [{ id: "pu1", jadwal }] });
  });

  it("hapus PUSTU membersihkan foto lokasi, bagan, foto pengurus, dan galeri", async () => {
    pu.findUnique.mockResolvedValueOnce({ imageId: "foto", fotoBaganStrukturId: "bagan", pengurus: [{ imageId: "p1" }], fotoKegiatan: [{ imageId: "f1" }] });
    expect(await del(ctx(undefined, { id: "pu1" }))).toMatchObject({ success: true });
    expect(removeReleasedFiles).toHaveBeenCalledWith("Puskesmas", ["foto", "bagan", "p1", "f1"]);
  });
});

describe("rute daftar anak", () => {
  it("GET /:id/pengurus terpasang di modul PUSTU", async () => {
    prismaMock.pengurusPustu.findMany.mockResolvedValueOnce([{ id: "p1", nama: "Kepala Contoh" }]);
    const res = await modul.handle(new Request("http://localhost/puskesmas/pu1/pengurus"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, data: [{ id: "p1" }] });
    expect(prismaMock.pengurusPustu.findMany.mock.calls[0][0].where).toEqual({ pustuId: "pu1" });
  });
});

describe("migrasi 20261116150000_konten_pustu", () => {
  const sql = readFileSync(
    path.resolve(__dirname, "../../prisma/migrations/20261116150000_konten_pustu/migration.sql"),
    "utf8",
  );

  it("additive & idempoten: kolom/tabel IF NOT EXISTS, FK dicek pg_constraint, tanpa DROP kolom/tabel", () => {
    for (const kolom of ["mediaSosial", "layananUnggulan", "prosedurPendaftaran", "tarifBpjs", "tarifUmum", "fotoBaganStrukturId", "jadwal"]) {
      expect(sql).toMatch(new RegExp(`ADD COLUMN IF NOT EXISTS "${kolom}"`));
    }
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "PengurusPustu"');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "FotoKegiatanPustu"');
    expect(sql.match(/ADD CONSTRAINT/g)?.length).toBe(sql.match(/IF NOT EXISTS \(SELECT 1 FROM pg_constraint/g)?.length);
    expect(sql).not.toMatch(/DROP (COLUMN|TABLE)/i);
  });

  it("facebook lama disalin ke mediaSosial (hanya yang masih NULL, kolom lama tidak dikosongkan)", () => {
    expect(sql).toMatch(/UPDATE "Puskesmas"[\s\S]*'platform', 'facebook'[\s\S]*"mediaSosial" IS NULL/);
    expect(sql).not.toMatch(/SET "facebook"/);
    expect(sql).toMatch(/UPDATE "JamOperasional"[\s\S]*"jadwal" IS NULL/);
  });
});
