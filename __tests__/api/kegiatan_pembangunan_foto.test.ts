// @vitest-environment node
// Foto Dokumentasi Pembangunan (sebelum, sesudah, galeri progres): validasi murni, kontrak additive
// create/PUT/GET, pembersihan berkas yang dilepas, dan perilaku untuk kategori non-Pembangunan.
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  kegiatanDesa: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
  kegiatanDesaFoto: { deleteMany: vi.fn(), createMany: vi.fn() },
  fileStorage: { findMany: vi.fn() },
  $transaction: vi.fn(),
}));
const removeMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles", () => ({ default: removeMock }));

import kegiatanDesaCreate from "@/app/api/[[...slugs]]/_lib/desa/kegiatan-desa/create";
import kegiatanDesaFindUnique from "@/app/api/[[...slugs]]/_lib/desa/kegiatan-desa/findUnique";
import kegiatanDesaUpdate from "@/app/api/[[...slugs]]/_lib/desa/kegiatan-desa/updt";
import { KATEGORI_PEMBANGUNAN_ID } from "@/lib/kegiatan-pembangunan";
import {
  MAX_FOTO_PROGRES,
  idBerkasFoto,
  parseFotoPembangunanInput,
  periksaFotoPembangunan,
  resolveFotoPembangunan,
  rujukanFoto,
  sisaSlotFotoProgres,
  susunBarisGaleri,
  susunDataFotoCreate,
  susunDataFotoUpdate,
  susunanFotoPublik,
} from "@/lib/kegiatan-pembangunan-foto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context handler test
const ctx = (over: Record<string, any>) => ({ set: {}, query: {}, params: {}, ...over }) as any;

// test-only: body dasar kegiatan Pembangunan & berkas
const baseBody = {
  judul: "Pembangunan Balai",
  deskripsiSingkat: "Ringkas",
  deskripsiLengkap: "<p>Lengkap</p>",
  tanggal: "2026-01-15",
  lokasi: "Balai Desa",
  partisipan: 5,
  kategoriKegiatanId: KATEGORI_PEMBANGUNAN_ID,
};
const bukanPembangunan = { ...baseBody, kategoriKegiatanId: "katsosia000001" };
const berkas = (id: string, mimeType = "image/webp") => ({ id, mimeType });
const fileApi = (id: string) => ({ id, link: `/api/img/${id}`, realName: `${id}.webp`, mimeType: "image/webp", size: 10 });
const refKosong = { fotoSebelumId: null, fotoSesudahId: null, fotoProgres: [] };

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.kegiatanDesa.create.mockResolvedValue({ id: "k1", fotoProgres: [] });
  prismaMock.kegiatanDesa.update.mockResolvedValue({ id: "k1", fotoSebelumId: null, fotoSesudahId: null, fotoProgres: [] });
  prismaMock.kegiatanDesa.findUnique.mockResolvedValue(refKosong);
  prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => unknown) => fn(prismaMock));
  prismaMock.fileStorage.findMany.mockResolvedValue([]);
});

describe("parseFotoPembangunanInput", () => {
  it("tanpa field foto → data kosong (tidak mengubah apa pun)", () => {
    expect(parseFotoPembangunanInput({})).toEqual({ ok: true, data: {} });
  });

  it("undefined dilewati; null dan string kosong/spasi → null; string di-trim", () => {
    expect(parseFotoPembangunanInput({ fotoSebelumId: null, fotoSesudahId: "  " })).toEqual({
      ok: true,
      data: { fotoSebelumId: null, fotoSesudahId: null },
    });
    expect(parseFotoPembangunanInput({ fotoSebelumId: " f1 " })).toEqual({ ok: true, data: { fotoSebelumId: "f1" } });
  });

  it("menolak foto tunggal yang bukan teks", () => {
    expect(parseFotoPembangunanInput({ fotoSebelumId: 5 })).toEqual({ ok: false, message: "Foto sebelum tidak valid" });
    expect(parseFotoPembangunanInput({ fotoSesudahId: {} })).toEqual({ ok: false, message: "Foto sesudah tidak valid" });
  });

  it("galeri: array kosong = kosongkan; urutan dipertahankan; id di-trim", () => {
    expect(parseFotoPembangunanInput({ fotoProgresIds: [] })).toEqual({ ok: true, data: { fotoProgresIds: [] } });
    expect(parseFotoPembangunanInput({ fotoProgresIds: ["b", " a "] })).toEqual({ ok: true, data: { fotoProgresIds: ["b", "a"] } });
  });

  it("galeri: menolak bukan array, elemen kosong/bukan teks", () => {
    for (const fotoProgresIds of ["a", null, [1], [""], ["a", " "]]) {
      expect(parseFotoPembangunanInput({ fotoProgresIds })).toEqual({ ok: false, message: "Galeri foto progres tidak valid" });
    }
  });

  it("galeri: menolak duplikat dan lebih dari 10", () => {
    expect(parseFotoPembangunanInput({ fotoProgresIds: ["a", "a"] }).ok).toBe(false);
    const sepuluh = Array.from({ length: MAX_FOTO_PROGRES }, (_, i) => `g${i}`);
    expect(parseFotoPembangunanInput({ fotoProgresIds: sepuluh }).ok).toBe(true);
    expect(parseFotoPembangunanInput({ fotoProgresIds: [...sepuluh, "g10"] })).toEqual({
      ok: false,
      message: "Maksimal 10 foto progres per kegiatan (dikirim 11)",
    });
  });
});

describe("resolveFotoPembangunan & helper", () => {
  it("mempertahankan input untuk kategori Pembangunan", () => {
    const input = { fotoSebelumId: "a", fotoProgresIds: ["b"] };
    expect(resolveFotoPembangunan(KATEGORI_PEMBANGUNAN_ID, input)).toBe(input);
  });

  it("mengosongkan semua foto untuk kategori lain, apa pun yang dikirim", () => {
    expect(resolveFotoPembangunan("katsosia000001", { fotoSebelumId: "a", fotoProgresIds: ["b"] })).toEqual({
      fotoSebelumId: null,
      fotoSesudahId: null,
      fotoProgresIds: [],
    });
    expect(resolveFotoPembangunan("katsosia000001", {})).toEqual({ fotoSebelumId: null, fotoSesudahId: null, fotoProgresIds: [] });
  });

  it("rujukanFoto memberi label per peran dan melewati yang kosong", () => {
    expect(rujukanFoto({ fotoSebelumId: "a", fotoSesudahId: null, fotoProgresIds: ["b", "c"] })).toEqual([
      { id: "a", label: "Foto sebelum" },
      { id: "b", label: "Foto progres" },
      { id: "c", label: "Foto progres" },
    ]);
  });

  it("periksaFotoPembangunan: tidak ditemukan dan mime ditolak (pesan menyebut perannya)", () => {
    const rujukan = [{ id: "a", label: "Foto sebelum" }, { id: "b", label: "Foto progres" }];
    expect(periksaFotoPembangunan(rujukan, [berkas("b")])).toEqual({ ok: false, message: "Foto sebelum tidak ditemukan atau sudah dihapus" });
    expect(periksaFotoPembangunan(rujukan, [berkas("a"), berkas("b", "application/pdf")])).toEqual({
      ok: false,
      message: "Foto progres harus berformat JPG, PNG, atau WebP",
    });
    expect(periksaFotoPembangunan(rujukan, [berkas("a", "image/jpeg"), berkas("b", "image/png")])).toEqual({ ok: true });
  });

  it("susun data: update hanya field yang dikirim; create memberi urutan sesuai indeks", () => {
    expect(susunDataFotoUpdate({})).toEqual({});
    expect(susunDataFotoUpdate({ fotoSebelumId: null, fotoProgresIds: ["x"] })).toEqual({ fotoSebelumId: null });
    expect(susunDataFotoCreate({})).toEqual({ fotoSebelumId: null, fotoSesudahId: null });
    expect(susunDataFotoCreate({ fotoSebelumId: "a", fotoProgresIds: ["x", "y"] })).toEqual({
      fotoSebelumId: "a",
      fotoSesudahId: null,
      fotoProgres: { create: [{ fileId: "x", urutan: 0 }, { fileId: "y", urutan: 1 }] },
    });
    expect(susunBarisGaleri("k1", ["x", "y"])).toEqual([
      { kegiatanDesaId: "k1", fileId: "x", urutan: 0 },
      { kegiatanDesaId: "k1", fileId: "y", urutan: 1 },
    ]);
  });

  it("idBerkasFoto mengumpulkan semua rujukan record (tahan null)", () => {
    expect(idBerkasFoto(null)).toEqual([]);
    expect(idBerkasFoto({ fotoSebelumId: "a", fotoSesudahId: null, fotoProgres: [{ fileId: "x" }] })).toEqual(["a", "x"]);
  });

  it("susunanFotoPublik: urutan sebelum→sesudah, satu saja bila satu ada, tanpa foto = adaFoto false", () => {
    const f = (id: string) => ({ id, link: `/api/img/${id}` });
    expect(susunanFotoPublik({})).toEqual({ pasangan: [], galeri: [], adaFoto: false });
    expect(susunanFotoPublik({ fotoSebelum: null, fotoSesudah: null, fotoProgres: [] }).adaFoto).toBe(false);
    expect(susunanFotoPublik({ fotoSesudah: f("s") }).pasangan.map((p) => p.kunci)).toEqual(["sesudah"]);
    const penuh = susunanFotoPublik({ fotoSesudah: f("s"), fotoSebelum: f("b"), fotoProgres: [f("g1"), { id: "g2", link: "" }] });
    expect(penuh.pasangan.map((p) => p.kunci)).toEqual(["sebelum", "sesudah"]);
    expect(penuh.galeri.map((g) => g.id)).toEqual(["g1"]);
    expect(susunanFotoPublik({ fotoProgres: [f("g1")] }).adaFoto).toBe(true);
  });

  it("sisaSlotFotoProgres tidak pernah negatif", () => {
    expect(sisaSlotFotoProgres(3)).toBe(7);
    expect(sisaSlotFotoProgres(12)).toBe(0);
  });
});

describe("POST create kegiatan desa — foto Pembangunan", () => {
  it("tanpa field foto: tanpa query FileStorage, kolom foto null, tanpa galeri (kontrak lama)", async () => {
    const res = await kegiatanDesaCreate(ctx({ body: baseBody }));
    expect(res.success).toBe(true);
    expect(prismaMock.fileStorage.findMany).not.toHaveBeenCalled();
    const { data } = prismaMock.kegiatanDesa.create.mock.calls[0][0];
    expect(data).toMatchObject({ fotoSebelumId: null, fotoSesudahId: null });
    expect(data).not.toHaveProperty("fotoProgres");
  });

  it("menyimpan foto sebelum/sesudah dan galeri berurutan dengan satu query FileStorage", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValue(["s", "t", "g1", "g2"].map((id) => berkas(id)));
    const res = await kegiatanDesaCreate(
      ctx({ body: { ...baseBody, fotoSebelumId: "s", fotoSesudahId: "t", fotoProgresIds: ["g1", "g2"] } }),
    );
    expect(res.success).toBe(true);
    expect(prismaMock.fileStorage.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.fileStorage.findMany.mock.calls[0][0].where).toEqual({ id: { in: ["s", "t", "g1", "g2"] }, isActive: true });
    const { data, include } = prismaMock.kegiatanDesa.create.mock.calls[0][0];
    expect(data).toMatchObject({ fotoSebelumId: "s", fotoSesudahId: "t" });
    expect(data.fotoProgres).toEqual({ create: [{ fileId: "g1", urutan: 0 }, { fileId: "g2", urutan: 1 }] });
    expect(include.fotoProgres.orderBy).toEqual({ urutan: "asc" });
  });

  it("400 bila berkas tidak ada/tidak aktif, tanpa membuat data", async () => {
    const set: { status?: number } = {};
    const res = await kegiatanDesaCreate(ctx({ set, body: { ...baseBody, fotoSebelumId: "hilang" } }));
    expect(set.status).toBe(400);
    expect(res).toEqual({ success: false, message: "Foto sebelum tidak ditemukan atau sudah dihapus" });
    expect(prismaMock.kegiatanDesa.create).not.toHaveBeenCalled();
  });

  it("400 bila mime bukan JPG/PNG/WebP", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValue([berkas("g1", "application/pdf")]);
    const set: { status?: number } = {};
    const res = await kegiatanDesaCreate(ctx({ set, body: { ...baseBody, fotoProgresIds: ["g1"] } }));
    expect(set.status).toBe(400);
    expect(res.message).toBe("Foto progres harus berformat JPG, PNG, atau WebP");
    expect(prismaMock.kegiatanDesa.create).not.toHaveBeenCalled();
  });

  it("400 untuk galeri > 10 atau duplikat tanpa menyentuh DB", async () => {
    for (const fotoProgresIds of [Array.from({ length: 11 }, (_, i) => `g${i}`), ["a", "a"]]) {
      const set: { status?: number } = {};
      const res = await kegiatanDesaCreate(ctx({ set, body: { ...baseBody, fotoProgresIds } }));
      expect(set.status).toBe(400);
      expect(res.success).toBe(false);
    }
    expect(prismaMock.fileStorage.findMany).not.toHaveBeenCalled();
    expect(prismaMock.kegiatanDesa.create).not.toHaveBeenCalled();
  });

  it("kategori non-Pembangunan: foto yang dikirim diabaikan (tanpa query, tanpa disimpan)", async () => {
    const res = await kegiatanDesaCreate(
      ctx({ body: { ...bukanPembangunan, fotoSebelumId: "s", fotoProgresIds: ["g1"] } }),
    );
    expect(res.success).toBe(true);
    expect(prismaMock.fileStorage.findMany).not.toHaveBeenCalled();
    const { data } = prismaMock.kegiatanDesa.create.mock.calls[0][0];
    expect(data.fotoSebelumId).toBeNull();
    expect(data).not.toHaveProperty("fotoProgres");
  });

  it("respons membawa fotoProgres sebagai daftar berkas", async () => {
    prismaMock.kegiatanDesa.create.mockResolvedValue({ id: "k1", fotoProgres: [{ fileId: "g1", file: fileApi("g1") }] });
    const res = await kegiatanDesaCreate(ctx({ body: baseBody }));
    expect(res.data?.fotoProgres).toEqual([fileApi("g1")]);
  });
});

describe("PUT update kegiatan desa — foto Pembangunan", () => {
  it("tidak dikirim = tidak diubah: tanpa snapshot, tanpa transaksi, tanpa kolom foto, tanpa pembersihan", async () => {
    const res = await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: baseBody }));
    expect(res.success).toBe(true);
    const { data } = prismaMock.kegiatanDesa.update.mock.calls[0][0];
    expect(data).not.toHaveProperty("fotoSebelumId");
    expect(data).not.toHaveProperty("fotoSesudahId");
    expect(prismaMock.kegiatanDesa.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(removeMock).not.toHaveBeenCalled();
  });

  it("null = hapus foto sebelum; berkas lama dibersihkan setelah simpan sukses", async () => {
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({ fotoSebelumId: "lama", fotoSesudahId: "t", fotoProgres: [] });
    prismaMock.kegiatanDesa.update.mockResolvedValue({ id: "k1", fotoSebelumId: null, fotoSesudahId: "t", fotoProgres: [] });
    await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: { ...baseBody, fotoSebelumId: null } }));
    const { data } = prismaMock.kegiatanDesa.update.mock.calls[0][0];
    expect(data.fotoSebelumId).toBeNull();
    expect(data).not.toHaveProperty("fotoSesudahId");
    expect(removeMock).toHaveBeenCalledWith("KegiatanDesa", ["lama", "t"], ["t"]);
  });

  it("mengganti foto: id baru disimpan, berkas lama dilepas", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValue([berkas("baru")]);
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({ fotoSebelumId: "lama", fotoSesudahId: null, fotoProgres: [] });
    prismaMock.kegiatanDesa.update.mockResolvedValue({ id: "k1", fotoSebelumId: "baru", fotoSesudahId: null, fotoProgres: [] });
    await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: { ...baseBody, fotoSebelumId: "baru" } }));
    expect(prismaMock.kegiatanDesa.update.mock.calls[0][0].data.fotoSebelumId).toBe("baru");
    expect(removeMock).toHaveBeenCalledWith("KegiatanDesa", ["lama"], ["baru"]);
  });

  it("galeri = set final dalam satu transaksi (hapus lama, buat ulang berurutan, update kegiatan)", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValue([berkas("g2"), berkas("g3")]);
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({ fotoSebelumId: null, fotoSesudahId: null, fotoProgres: [{ fileId: "g1" }, { fileId: "g2" }] });
    prismaMock.kegiatanDesa.update.mockResolvedValue({
      id: "k1", fotoSebelumId: null, fotoSesudahId: null,
      fotoProgres: [{ fileId: "g3", file: fileApi("g3") }, { fileId: "g2", file: fileApi("g2") }],
    });
    const res = await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: { ...baseBody, fotoProgresIds: ["g3", "g2"] } }));
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.kegiatanDesaFoto.deleteMany).toHaveBeenCalledWith({ where: { kegiatanDesaId: "k1" } });
    expect(prismaMock.kegiatanDesaFoto.createMany).toHaveBeenCalledWith({
      data: [{ kegiatanDesaId: "k1", fileId: "g3", urutan: 0 }, { kegiatanDesaId: "k1", fileId: "g2", urutan: 1 }],
    });
    expect(removeMock).toHaveBeenCalledWith("KegiatanDesa", ["g1", "g2"], ["g3", "g2"]);
    expect(res.data?.fotoProgres.map((f: { id: string }) => f.id)).toEqual(["g3", "g2"]);
  });

  it("[] mengosongkan galeri lama; [] tanpa galeri lama tidak membuka transaksi", async () => {
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({ fotoSebelumId: null, fotoSesudahId: null, fotoProgres: [{ fileId: "g1" }] });
    await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: { ...baseBody, fotoProgresIds: [] } }));
    expect(prismaMock.kegiatanDesaFoto.deleteMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.kegiatanDesaFoto.createMany).not.toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalledWith("KegiatanDesa", ["g1"], []);

    vi.clearAllMocks();
    prismaMock.kegiatanDesa.update.mockResolvedValue({ id: "k1", fotoProgres: [] });
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue(refKosong);
    await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: { ...baseBody, fotoProgresIds: [] } }));
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("pindah ke kategori non-Pembangunan mengosongkan semua foto dan membersihkan berkasnya", async () => {
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({ fotoSebelumId: "a", fotoSesudahId: "b", fotoProgres: [{ fileId: "g1" }] });
    prismaMock.kegiatanDesa.update.mockResolvedValue({ id: "k1", fotoSebelumId: null, fotoSesudahId: null, fotoProgres: [] });
    await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: { ...bukanPembangunan, fotoSebelumId: "x" } }));
    const { data } = prismaMock.kegiatanDesa.update.mock.calls[0][0];
    expect(data).toMatchObject({ fotoSebelumId: null, fotoSesudahId: null });
    expect(prismaMock.fileStorage.findMany).not.toHaveBeenCalled();
    expect(prismaMock.kegiatanDesaFoto.deleteMany).toHaveBeenCalledTimes(1);
    expect(removeMock).toHaveBeenCalledWith("KegiatanDesa", ["a", "b", "g1"], []);
  });

  it("simpan gagal → berkas lama TIDAK dibersihkan", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValue([berkas("baru")]);
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({ fotoSebelumId: "lama", fotoSesudahId: null, fotoProgres: [] });
    prismaMock.kegiatanDesa.update.mockRejectedValue(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const res = await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: { ...baseBody, fotoSebelumId: "baru" } }));
    expect(res).toEqual({ success: false, message: "Gagal mengupdate kegiatan desa" });
    expect(removeMock).not.toHaveBeenCalled();
  });

  it("400 untuk foto tidak valid tanpa menyentuh update", async () => {
    const set: { status?: number } = {};
    const res = await kegiatanDesaUpdate(ctx({ set, params: { id: "k1" }, body: { ...baseBody, fotoSesudahId: "hilang" } }));
    expect(set.status).toBe(400);
    expect(res.message).toBe("Foto sesudah tidak ditemukan atau sudah dihapus");
    expect(prismaMock.kegiatanDesa.update).not.toHaveBeenCalled();
  });
});

describe("GET /:id kegiatan desa — foto Pembangunan", () => {
  it("menyertakan fotoSebelum/fotoSesudah dan galeri terurut sebagai File[]", async () => {
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({
      id: "k1",
      fotoSebelum: fileApi("s"),
      fotoSesudah: null,
      fotoProgres: [{ fileId: "g1", file: fileApi("g1") }, { fileId: "g2", file: fileApi("g2") }],
    });
    const res = await kegiatanDesaFindUnique(ctx({ params: { id: "k1" } }));
    expect(res.success).toBe(true);
    expect(res.data?.fotoSebelum).toEqual(fileApi("s"));
    expect(res.data?.fotoSesudah).toBeNull();
    expect(res.data?.fotoProgres).toEqual([fileApi("g1"), fileApi("g2")]);
    const { include } = prismaMock.kegiatanDesa.findUnique.mock.calls[0][0];
    expect(include.fotoProgres.orderBy).toEqual({ urutan: "asc" });
    expect(include.fotoSebelum.select).toMatchObject({ id: true, link: true, realName: true, mimeType: true, size: true });
  });
});
