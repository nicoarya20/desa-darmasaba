// @vitest-environment node
// Konten Posyandu: validasi sasaran klaster, upsert profil singleton + klaster, GET profil, detail posyandu
// meng-include galeri, alamat additive di create/update, hapus posyandu membersihkan berkas galeri,
// rute `/profil` & `/:id/foto-kegiatan` terpasang. Prisma & penghapus berkas di-mock.
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, removeReleasedFiles, removeStoredFile } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
    profilPosyandu: { findUnique: vi.fn(), upsert: vi.fn((a: unknown) => Promise.resolve(a)) },
    klasterPosyandu: { findMany: vi.fn(), upsert: vi.fn((a: unknown) => Promise.resolve(a)) },
    posyandu: {
      findUnique: vi.fn(),
      create: vi.fn((a: { data: object }) => Promise.resolve({ id: "p1", ...a.data })),
      update: vi.fn((a: { data: object }) => Promise.resolve({ id: "p1", ...a.data })),
      delete: vi.fn(),
    },
    fotoKegiatanPosyandu: { findMany: vi.fn() },
  },
  removeReleasedFiles: vi.fn(),
  removeStoredFile: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles", () => ({ default: removeReleasedFiles }));
vi.mock("@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile", () => ({ default: removeStoredFile }));

import { GALERI_SELECT } from "@/app/api/[[...slugs]]/_lib/_konten-bersama/daftar-anak.config";
import posyanduCreate from "@/app/api/[[...slugs]]/_lib/kesehatan/posyandu/create";
import posyanduDelete from "@/app/api/[[...slugs]]/_lib/kesehatan/posyandu/del";
import findPosyanduById from "@/app/api/[[...slugs]]/_lib/kesehatan/posyandu/find-by-id";
import modul from "@/app/api/[[...slugs]]/_lib/kesehatan/posyandu/index";
import profilFind from "@/app/api/[[...slugs]]/_lib/kesehatan/posyandu/profil/find";
import profilUpsert from "@/app/api/[[...slugs]]/_lib/kesehatan/posyandu/profil/upsert";
import posyanduUpdate from "@/app/api/[[...slugs]]/_lib/kesehatan/posyandu/updt";
import {
  PROFIL_POSYANDU_ID,
  profilPosyanduBodySchema,
  sasaranKlasterSchema,
} from "@/lib/posyandu/posyandu-konten.validation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context Elysia minimal
const ctx = (body?: unknown, params: Record<string, string> = {}): any => ({ body, params, set: { status: 200 } });

// test-only: data rekaan.
const klaster = (sasaran: string, extra: object = {}) => ({
  sasaran,
  judul: `Posyandu ${sasaran}`,
  deskripsi: "Fokus layanan contoh",
  jamPelayanan: "09.00 WITA",
  ...extra,
});
const posyanduBody = {
  name: "Posyandu Contoh",
  nomor: "081200000000",
  deskripsi: "<p>Contoh</p>",
  imageId: "img1",
  jadwalPelayanan: "[]",
  banjarId: "b1",
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.profilPosyandu.findUnique.mockResolvedValue({ deskripsi: "<p>Umum</p>", fungsiKegiatan: null });
  prismaMock.klasterPosyandu.findMany.mockResolvedValue([]);
});

describe("validasi sasaran klaster", () => {
  it("hanya balita, remaja, lansia yang diterima", () => {
    for (const s of ["balita", "remaja", "lansia"]) expect(sasaranKlasterSchema.safeParse(s).success).toBe(true);
    const res = sasaranKlasterSchema.safeParse("ibu-hamil");
    expect(res.success).toBe(false);
    expect(res.error?.issues[0].message).toBe("Sasaran klaster harus balita, remaja, atau lansia");
  });

  it("klaster ganda, deskripsi umum kosong (editor '<p></p>'), dan judul kosong ditolak", () => {
    const dobel = profilPosyanduBodySchema.safeParse({ deskripsi: "<p>A</p>", klaster: [klaster("balita"), klaster("balita")] });
    expect(dobel.error?.issues[0].message).toBe("Klaster yang sama dikirim lebih dari sekali");
    expect(profilPosyanduBodySchema.safeParse({ deskripsi: "<p></p>" }).error?.issues[0].message).toBe("Deskripsi umum wajib diisi");
    const judul = profilPosyanduBodySchema.safeParse({ deskripsi: "<p>A</p>", klaster: [klaster("remaja", { judul: "  " })] });
    expect(judul.error?.issues[0].message).toBe("Judul klaster wajib diisi");
  });

  it("fungsi kegiatan & jam kosong → null; imageId tidak dikirim tetap undefined", () => {
    const res = profilPosyanduBodySchema.parse({
      deskripsi: "<p>A</p>",
      fungsiKegiatan: "<p> </p>",
      klaster: [klaster("lansia", { jamPelayanan: " " })],
    });
    expect(res.fungsiKegiatan).toBeNull();
    expect(res.klaster?.[0].jamPelayanan).toBeNull();
    expect(res.klaster?.[0].imageId).toBeUndefined();
  });
});

describe("PUT /profil (upsert singleton)", () => {
  it("upsert profil ber-id tetap + klaster per sasaran dalam satu transaksi; HTML dibersihkan", async () => {
    const res = await profilUpsert(
      ctx({ deskripsi: "<p>Umum<script>alert(1)</script></p>", klaster: [klaster("balita"), klaster("lansia", { imageId: "g2" })] }),
    );
    expect(res).toMatchObject({ success: true, data: { profil: { deskripsi: "<p>Umum</p>" } } });
    const profil = prismaMock.profilPosyandu.upsert.mock.calls[0][0] as { where: object; create: object; update: object };
    expect(profil.where).toEqual({ id: PROFIL_POSYANDU_ID });
    expect(profil.create).toEqual({ id: PROFIL_POSYANDU_ID, deskripsi: "<p>Umum</p>", fungsiKegiatan: null });
    expect(profil.update).toEqual({ deskripsi: "<p>Umum</p>", fungsiKegiatan: null });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    const [balita, lansia] = prismaMock.klasterPosyandu.upsert.mock.calls.map((c) => c[0] as Record<string, Record<string, unknown>>);
    expect(balita.where).toEqual({ sasaran: "balita" });
    expect(balita.create).toMatchObject({ sasaran: "balita", urutan: 1, imageId: null });
    expect(balita.update).not.toHaveProperty("imageId");
    expect(lansia.create).toMatchObject({ urutan: 3, imageId: "g2" });
    expect(lansia.update).toMatchObject({ imageId: "g2" });
  });

  it("sasaran asing → 400 tanpa menulis", async () => {
    const c = ctx({ deskripsi: "<p>A</p>", klaster: [klaster("dewasa")] });
    const res = await profilUpsert(c);
    expect(c.set.status).toBe(400);
    expect(res).toMatchObject({ success: false, message: expect.stringContaining("Sasaran klaster") });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("gambar klaster yang diganti dilepas; klaster yang tidak mengirim imageId mempertahankan gambarnya", async () => {
    prismaMock.klasterPosyandu.findMany.mockResolvedValueOnce([
      { sasaran: "balita", imageId: "lama-b" },
      { sasaran: "remaja", imageId: "lama-r" },
    ]);
    await profilUpsert(ctx({ deskripsi: "<p>A</p>", klaster: [klaster("balita", { imageId: "baru-b" }), klaster("remaja")] }));
    expect(removeReleasedFiles).toHaveBeenCalledWith("KlasterPosyandu", ["lama-b", "lama-r"], ["baru-b", "lama-r"]);
  });
});

describe("GET /profil", () => {
  it("profil belum diisi → data.profil null, klaster tetap dikirim urut tampil", async () => {
    prismaMock.profilPosyandu.findUnique.mockResolvedValueOnce(null);
    prismaMock.klasterPosyandu.findMany.mockResolvedValueOnce([{ id: "k1", sasaran: "balita" }]);
    const res = await profilFind();
    expect(res).toMatchObject({ success: true, data: { profil: null, klaster: [{ sasaran: "balita" }] } });
    expect(prismaMock.klasterPosyandu.findMany.mock.calls[0][0].orderBy).toEqual([{ urutan: "asc" }, { sasaran: "asc" }]);
  });

  it("rute /posyandu/profil terpasang (tidak tertangkap sebagai id posyandu)", async () => {
    const res = await modul.handle(new Request("http://localhost/posyandu/profil"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, data: { profil: { deskripsi: "<p>Umum</p>" } } });
    expect(prismaMock.posyandu.findUnique).not.toHaveBeenCalled();
  });
});

describe("detail & tulis posyandu banjar", () => {
  it("GET /:id meng-include galeri foto (select bersama, urut) beserta banjar", async () => {
    const foto = [{ id: "f1", imageId: "i1", keterangan: "Kader", urutan: 0, image: { id: "i1", link: "/api/img/x.webp" } }];
    prismaMock.posyandu.findUnique.mockResolvedValueOnce({ id: "p1", name: "Posyandu Contoh", alamat: "Jl. Contoh", fotoKegiatan: foto });
    const res = await findPosyanduById(new Request("http://localhost/api/kesehatan/posyandu/p1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, data: { alamat: "Jl. Contoh", fotoKegiatan: foto } });
    const args = prismaMock.posyandu.findUnique.mock.calls[0][0];
    expect(args.where).toEqual({ id: "p1" });
    expect(args.include.fotoKegiatan).toMatchObject({ select: GALERI_SELECT, orderBy: [{ urutan: "asc" }, { createdAt: "asc" }] });
    expect(args.include.banjar).toEqual({ select: { id: true, name: true } });
  });

  it("create: alamat di-trim, tidak dikirim → null, terlalu panjang → 400", async () => {
    await posyanduCreate(ctx({ ...posyanduBody, alamat: "  Banjar Contoh, Desa Contoh  " }));
    expect(prismaMock.posyandu.create.mock.calls[0][0].data.alamat).toBe("Banjar Contoh, Desa Contoh");
    await posyanduCreate(ctx(posyanduBody));
    expect(prismaMock.posyandu.create.mock.calls[1][0].data.alamat).toBeNull();
    const c = ctx({ ...posyanduBody, alamat: "x".repeat(501) });
    expect(await posyanduCreate(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(400);
    expect(prismaMock.posyandu.create).toHaveBeenCalledTimes(2);
  });

  it("update: alamat tidak dikirim = tidak diubah (klien lama), kosong = dikosongkan", async () => {
    prismaMock.posyandu.findUnique.mockResolvedValue({ id: "p1", imageId: "img1", image: null });
    await posyanduUpdate(ctx(posyanduBody, { id: "p1" }));
    expect(prismaMock.posyandu.update.mock.calls[0][0].data.alamat).toBeUndefined();
    await posyanduUpdate(ctx({ ...posyanduBody, alamat: "" }, { id: "p1" }));
    expect(prismaMock.posyandu.update.mock.calls[1][0].data.alamat).toBeNull();
  });

  it("hapus posyandu → berkas galeri ikut dibersihkan setelah baris terhapus", async () => {
    prismaMock.posyandu.findUnique.mockResolvedValueOnce({ id: "p1", image: null, fotoKegiatan: [{ imageId: "f1" }, { imageId: "f2" }] });
    expect(await posyanduDelete(ctx(undefined, { id: "p1" }))).toMatchObject({ success: true });
    expect(prismaMock.posyandu.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
    expect(removeReleasedFiles).toHaveBeenCalledWith("FotoKegiatanPosyandu", ["f1", "f2"]);
  });

  it("GET /:id/foto-kegiatan terpasang di modul posyandu", async () => {
    prismaMock.fotoKegiatanPosyandu.findMany.mockResolvedValueOnce([{ id: "f1" }]);
    const res = await modul.handle(new Request("http://localhost/posyandu/p1/foto-kegiatan"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, data: [{ id: "f1" }] });
    expect(prismaMock.fotoKegiatanPosyandu.findMany.mock.calls[0][0].where).toEqual({ posyanduId: "p1" });
  });
});
