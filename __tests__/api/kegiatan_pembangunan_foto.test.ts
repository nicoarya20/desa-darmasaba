// @vitest-environment node
// Foto Dokumentasi Pembangunan (foto sebelum & sesudah, maks 5 per jenis): validasi murni, kontrak additive
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
  MAX_FOTO_PER_JENIS,
  adaFotoLama,
  bentukFotoRespons,
  idBerkasFoto,
  jenisDikirim,
  parseFotoPembangunanInput,
  periksaFotoPembangunan,
  resolveFotoPembangunan,
  rujukanFoto,
  susunBarisFoto,
  susunDataFotoCreate,
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
const ids = (n: number, awalan: string) => Array.from({ length: n }, (_, i) => `${awalan}${i}`);
const barisDb = (jenis: string, fileId: string) => ({ jenis, fileId });
const refKosong = { foto: [] };

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.kegiatanDesa.create.mockResolvedValue({ id: "k1", foto: [] });
  prismaMock.kegiatanDesa.update.mockResolvedValue({ id: "k1", foto: [] });
  prismaMock.kegiatanDesa.findUnique.mockResolvedValue(refKosong);
  prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => unknown) => fn(prismaMock));
  prismaMock.fileStorage.findMany.mockResolvedValue([]);
});

describe("parseFotoPembangunanInput", () => {
  it("tanpa field foto (undefined) → data kosong, tidak mengubah apa pun", () => {
    expect(parseFotoPembangunanInput({})).toEqual({ ok: true, data: {} });
    expect(jenisDikirim({})).toEqual([]);
  });

  it("[] = kosongkan kelompok itu; kelompok yang tidak dikirim dilewati", () => {
    expect(parseFotoPembangunanInput({ fotoSebelumIds: [] })).toEqual({ ok: true, data: { fotoSebelumIds: [] } });
    expect(jenisDikirim({ fotoSesudahIds: [] })).toEqual(["sesudah"]);
  });

  it("urutan array dipertahankan dan id di-trim", () => {
    expect(parseFotoPembangunanInput({ fotoSebelumIds: ["b", " a "], fotoSesudahIds: ["c"] })).toEqual({
      ok: true,
      data: { fotoSebelumIds: ["b", "a"], fotoSesudahIds: ["c"] },
    });
  });

  it("menolak bukan array, null, elemen kosong/bukan teks", () => {
    for (const nilai of ["a", null, [1], [""], ["a", " "]]) {
      expect(parseFotoPembangunanInput({ fotoSebelumIds: nilai })).toEqual({ ok: false, message: "Foto sebelum tidak valid" });
      expect(parseFotoPembangunanInput({ fotoSesudahIds: nilai })).toEqual({ ok: false, message: "Foto sesudah tidak valid" });
    }
  });

  it("menolak duplikat dalam satu kelompok", () => {
    expect(parseFotoPembangunanInput({ fotoSebelumIds: ["a", " a"] })).toEqual({
      ok: false,
      message: "Foto sebelum tidak boleh berisi foto yang sama lebih dari sekali",
    });
  });

  it("batas 5 per jenis: 5 lolos, 6 ditolak (konstanta satu sumber)", () => {
    expect(MAX_FOTO_PER_JENIS).toBe(5);
    expect(parseFotoPembangunanInput({ fotoSebelumIds: ids(5, "s"), fotoSesudahIds: ids(5, "t") }).ok).toBe(true);
    expect(parseFotoPembangunanInput({ fotoSebelumIds: ids(6, "s") })).toEqual({
      ok: false,
      message: "Maksimal 5 foto sebelum per kegiatan (dikirim 6)",
    });
    expect(parseFotoPembangunanInput({ fotoSesudahIds: ids(6, "t") })).toEqual({
      ok: false,
      message: "Maksimal 5 foto sesudah per kegiatan (dikirim 6)",
    });
  });

  it("menolak id yang sama di kedua kelompok", () => {
    expect(parseFotoPembangunanInput({ fotoSebelumIds: ["a", "x"], fotoSesudahIds: ["x"] })).toEqual({
      ok: false,
      message: "Foto yang sama tidak boleh dipakai di foto sebelum dan foto sesudah",
    });
  });
});

describe("resolveFotoPembangunan & helper", () => {
  it("mempertahankan input untuk kategori Pembangunan", () => {
    const input = { fotoSebelumIds: ["a"], fotoSesudahIds: ["b"] };
    expect(resolveFotoPembangunan(KATEGORI_PEMBANGUNAN_ID, input)).toBe(input);
  });

  it("mengosongkan kedua kelompok untuk kategori lain, apa pun yang dikirim", () => {
    expect(resolveFotoPembangunan("katsosia000001", { fotoSebelumIds: ["a"], fotoSesudahIds: ["b"] })).toEqual({
      fotoSebelumIds: [],
      fotoSesudahIds: [],
    });
    expect(resolveFotoPembangunan("katsosia000001", {})).toEqual({ fotoSebelumIds: [], fotoSesudahIds: [] });
  });

  it("rujukanFoto memberi label per kelompok dan melewati yang tidak dikirim", () => {
    expect(rujukanFoto({ fotoSebelumIds: ["a", "b"], fotoSesudahIds: ["c"] })).toEqual([
      { id: "a", label: "Foto sebelum" },
      { id: "b", label: "Foto sebelum" },
      { id: "c", label: "Foto sesudah" },
    ]);
    expect(rujukanFoto({ fotoSesudahIds: ["c"] })).toEqual([{ id: "c", label: "Foto sesudah" }]);
  });

  it("periksaFotoPembangunan: tidak ditemukan dan mime ditolak (pesan menyebut kelompoknya)", () => {
    const rujukan = [{ id: "a", label: "Foto sebelum" }, { id: "b", label: "Foto sesudah" }];
    expect(periksaFotoPembangunan(rujukan, [berkas("b")])).toEqual({ ok: false, message: "Foto sebelum tidak ditemukan atau sudah dihapus" });
    expect(periksaFotoPembangunan(rujukan, [berkas("a"), berkas("b", "application/pdf")])).toEqual({
      ok: false,
      message: "Foto sesudah harus berformat JPG, PNG, atau WebP",
    });
    expect(periksaFotoPembangunan(rujukan, [berkas("a", "image/jpeg"), berkas("b", "image/png")])).toEqual({ ok: true });
  });

  it("susunBarisFoto: urutan = indeks per jenis, hanya kelompok yang dikirim", () => {
    expect(susunBarisFoto("k1", { fotoSebelumIds: ["a", "b"], fotoSesudahIds: ["c", "d", "e"] })).toEqual([
      { kegiatanDesaId: "k1", fileId: "a", jenis: "sebelum", urutan: 0 },
      { kegiatanDesaId: "k1", fileId: "b", jenis: "sebelum", urutan: 1 },
      { kegiatanDesaId: "k1", fileId: "c", jenis: "sesudah", urutan: 0 },
      { kegiatanDesaId: "k1", fileId: "d", jenis: "sesudah", urutan: 1 },
      { kegiatanDesaId: "k1", fileId: "e", jenis: "sesudah", urutan: 2 },
    ]);
    expect(susunBarisFoto("k1", { fotoSesudahIds: ["x"] })).toEqual([
      { kegiatanDesaId: "k1", fileId: "x", jenis: "sesudah", urutan: 0 },
    ]);
    expect(susunBarisFoto("k1", {})).toEqual([]);
  });

  it("susunDataFotoCreate: nested create bila ada foto, kosong bila tidak", () => {
    expect(susunDataFotoCreate({})).toEqual({});
    expect(susunDataFotoCreate({ fotoSebelumIds: [], fotoSesudahIds: [] })).toEqual({});
    expect(susunDataFotoCreate({ fotoSebelumIds: ["a"], fotoSesudahIds: ["b", "c"] })).toEqual({
      foto: {
        create: [
          { fileId: "a", jenis: "sebelum", urutan: 0 },
          { fileId: "b", jenis: "sesudah", urutan: 0 },
          { fileId: "c", jenis: "sesudah", urutan: 1 },
        ],
      },
    });
  });

  it("idBerkasFoto & adaFotoLama tahan null", () => {
    expect(idBerkasFoto(null)).toEqual([]);
    expect(idBerkasFoto({ foto: [{ fileId: "a" }, { fileId: "x" }] })).toEqual(["a", "x"]);
    expect(adaFotoLama(null, ["sebelum"])).toBe(false);
    expect(adaFotoLama({ foto: [barisDb("sesudah", "x")] }, ["sebelum"])).toBe(false);
    expect(adaFotoLama({ foto: [barisDb("sesudah", "x")] }, ["sebelum", "sesudah"])).toBe(true);
  });

  it("bentukFotoRespons memecah baris per jenis dengan urutan terjaga", () => {
    const hasil = bentukFotoRespons({
      id: "k1",
      foto: [
        { jenis: "sebelum", file: fileApi("b1") },
        { jenis: "sebelum", file: fileApi("b2") },
        { jenis: "sesudah", file: fileApi("s1") },
      ],
    });
    expect(hasil).not.toHaveProperty("foto");
    expect(hasil.fotoSebelum.map((f) => f.id)).toEqual(["b1", "b2"]);
    expect(hasil.fotoSesudah.map((f) => f.id)).toEqual(["s1"]);
    expect(bentukFotoRespons({ id: "k2", foto: null })).toEqual({ id: "k2", fotoSebelum: [], fotoSesudah: [] });
  });

  it("susunanFotoPublik: kelompok kosong tidak ada, tanpa foto = adaFoto false, tolerant null/tanpa link", () => {
    const f = (id: string) => ({ id, link: `/api/img/${id}` });
    expect(susunanFotoPublik({})).toEqual({ kelompok: [], adaFoto: false });
    expect(susunanFotoPublik({ fotoSebelum: null, fotoSesudah: [] }).adaFoto).toBe(false);
    expect(susunanFotoPublik({ fotoSesudah: [f("s")] }).kelompok.map((k) => k.kunci)).toEqual(["sesudah"]);
    const penuh = susunanFotoPublik({ fotoSesudah: [f("s"), { id: "x", link: "" }], fotoSebelum: [f("b1"), f("b2")] });
    expect(penuh.kelompok.map((k) => k.kunci)).toEqual(["sebelum", "sesudah"]);
    expect(penuh.kelompok[0].files.map((g) => g.id)).toEqual(["b1", "b2"]);
    expect(penuh.kelompok[1].files.map((g) => g.id)).toEqual(["s"]);
  });
});

describe("POST create kegiatan desa — foto Pembangunan", () => {
  it("tanpa field foto: tanpa query FileStorage dan tanpa baris foto (kontrak lama)", async () => {
    const res = await kegiatanDesaCreate(ctx({ body: baseBody }));
    expect(res.success).toBe(true);
    expect(prismaMock.fileStorage.findMany).not.toHaveBeenCalled();
    const { data } = prismaMock.kegiatanDesa.create.mock.calls[0][0];
    expect(data).not.toHaveProperty("foto");
  });

  it("menyimpan foto sebelum & sesudah berurutan per jenis dengan satu query FileStorage", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValue(["s1", "s2", "t1"].map((id) => berkas(id)));
    const res = await kegiatanDesaCreate(
      ctx({ body: { ...baseBody, fotoSebelumIds: ["s1", "s2"], fotoSesudahIds: ["t1"] } }),
    );
    expect(res.success).toBe(true);
    expect(prismaMock.fileStorage.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.fileStorage.findMany.mock.calls[0][0].where).toEqual({ id: { in: ["s1", "s2", "t1"] }, isActive: true });
    const { data, include } = prismaMock.kegiatanDesa.create.mock.calls[0][0];
    expect(data.foto).toEqual({
      create: [
        { fileId: "s1", jenis: "sebelum", urutan: 0 },
        { fileId: "s2", jenis: "sebelum", urutan: 1 },
        { fileId: "t1", jenis: "sesudah", urutan: 0 },
      ],
    });
    expect(include.foto.orderBy).toEqual([{ jenis: "asc" }, { urutan: "asc" }]);
  });

  it("menerima 5 + 5 foto", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValue([...ids(5, "s"), ...ids(5, "t")].map((id) => berkas(id)));
    const res = await kegiatanDesaCreate(ctx({ body: { ...baseBody, fotoSebelumIds: ids(5, "s"), fotoSesudahIds: ids(5, "t") } }));
    expect(res.success).toBe(true);
    expect(prismaMock.kegiatanDesa.create.mock.calls[0][0].data.foto.create).toHaveLength(10);
  });

  it("400 bila berkas tidak ada/tidak aktif, tanpa membuat data", async () => {
    const set: { status?: number } = {};
    const res = await kegiatanDesaCreate(ctx({ set, body: { ...baseBody, fotoSebelumIds: ["hilang"] } }));
    expect(set.status).toBe(400);
    expect(res).toEqual({ success: false, message: "Foto sebelum tidak ditemukan atau sudah dihapus" });
    expect(prismaMock.kegiatanDesa.create).not.toHaveBeenCalled();
  });

  it("400 bila mime bukan JPG/PNG/WebP", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValue([berkas("g1", "application/pdf")]);
    const set: { status?: number } = {};
    const res = await kegiatanDesaCreate(ctx({ set, body: { ...baseBody, fotoSesudahIds: ["g1"] } }));
    expect(set.status).toBe(400);
    expect(res.message).toBe("Foto sesudah harus berformat JPG, PNG, atau WebP");
    expect(prismaMock.kegiatanDesa.create).not.toHaveBeenCalled();
  });

  it("400 untuk > 5, duplikat, atau id di kedua kelompok, tanpa menyentuh DB", async () => {
    const kasus = [{ fotoSebelumIds: ids(6, "s") }, { fotoSesudahIds: ["a", "a"] }, { fotoSebelumIds: ["a"], fotoSesudahIds: ["a"] }];
    for (const extra of kasus) {
      const set: { status?: number } = {};
      const res = await kegiatanDesaCreate(ctx({ set, body: { ...baseBody, ...extra } }));
      expect(set.status).toBe(400);
      expect(res.success).toBe(false);
    }
    expect(prismaMock.fileStorage.findMany).not.toHaveBeenCalled();
    expect(prismaMock.kegiatanDesa.create).not.toHaveBeenCalled();
  });

  it("kategori non-Pembangunan: foto yang dikirim diabaikan (tanpa query, tanpa baris)", async () => {
    const res = await kegiatanDesaCreate(
      ctx({ body: { ...bukanPembangunan, fotoSebelumIds: ["s"], fotoSesudahIds: ["g1"] } }),
    );
    expect(res.success).toBe(true);
    expect(prismaMock.fileStorage.findMany).not.toHaveBeenCalled();
    expect(prismaMock.kegiatanDesa.create.mock.calls[0][0].data).not.toHaveProperty("foto");
  });

  it("respons membawa fotoSebelum dan fotoSesudah sebagai daftar berkas", async () => {
    prismaMock.kegiatanDesa.create.mockResolvedValue({
      id: "k1",
      foto: [{ jenis: "sebelum", file: fileApi("b1") }, { jenis: "sesudah", file: fileApi("s1") }],
    });
    const res = await kegiatanDesaCreate(ctx({ body: baseBody }));
    expect(res.data?.fotoSebelum).toEqual([fileApi("b1")]);
    expect(res.data?.fotoSesudah).toEqual([fileApi("s1")]);
  });
});

describe("PUT update kegiatan desa — foto Pembangunan", () => {
  it("tidak dikirim = tidak diubah: tanpa snapshot, tanpa transaksi, tanpa pembersihan", async () => {
    const res = await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: baseBody }));
    expect(res.success).toBe(true);
    expect(prismaMock.kegiatanDesa.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.kegiatanDesaFoto.deleteMany).not.toHaveBeenCalled();
    expect(removeMock).not.toHaveBeenCalled();
  });

  it("hanya satu kelompok dikirim: kelompok lain tidak disentuh", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValue([berkas("b9")]);
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({ foto: [barisDb("sebelum", "b1"), barisDb("sesudah", "s1")] });
    prismaMock.kegiatanDesa.update.mockResolvedValue({ id: "k1", foto: [{ jenis: "sesudah", fileId: "s1", file: fileApi("s1") }, { jenis: "sebelum", fileId: "b9", file: fileApi("b9") }] });
    await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: { ...baseBody, fotoSebelumIds: ["b9"] } }));
    expect(prismaMock.kegiatanDesaFoto.deleteMany).toHaveBeenCalledWith({ where: { kegiatanDesaId: "k1", jenis: { in: ["sebelum"] } } });
    expect(prismaMock.kegiatanDesaFoto.createMany).toHaveBeenCalledWith({
      data: [{ kegiatanDesaId: "k1", fileId: "b9", jenis: "sebelum", urutan: 0 }],
    });
    expect(removeMock).toHaveBeenCalledWith("KegiatanDesa", ["b1", "s1"], ["s1", "b9"]);
  });

  it("set final dua kelompok dalam satu transaksi (hapus lama, buat ulang berurutan, update kegiatan)", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValue(["b3", "b2", "s5"].map((id) => berkas(id)));
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({ foto: [barisDb("sebelum", "b1"), barisDb("sebelum", "b2"), barisDb("sesudah", "s1")] });
    prismaMock.kegiatanDesa.update.mockResolvedValue({
      id: "k1",
      foto: [
        { jenis: "sebelum", fileId: "b3", file: fileApi("b3") },
        { jenis: "sebelum", fileId: "b2", file: fileApi("b2") },
        { jenis: "sesudah", fileId: "s5", file: fileApi("s5") },
      ],
    });
    const res = await kegiatanDesaUpdate(
      ctx({ params: { id: "k1" }, body: { ...baseBody, fotoSebelumIds: ["b3", "b2"], fotoSesudahIds: ["s5"] } }),
    );
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.kegiatanDesaFoto.deleteMany).toHaveBeenCalledWith({
      where: { kegiatanDesaId: "k1", jenis: { in: ["sebelum", "sesudah"] } },
    });
    expect(prismaMock.kegiatanDesaFoto.createMany).toHaveBeenCalledWith({
      data: [
        { kegiatanDesaId: "k1", fileId: "b3", jenis: "sebelum", urutan: 0 },
        { kegiatanDesaId: "k1", fileId: "b2", jenis: "sebelum", urutan: 1 },
        { kegiatanDesaId: "k1", fileId: "s5", jenis: "sesudah", urutan: 0 },
      ],
    });
    expect(removeMock).toHaveBeenCalledWith("KegiatanDesa", ["b1", "b2", "s1"], ["b3", "b2", "s5"]);
    expect(res.data?.fotoSebelum.map((f: { id: string }) => f.id)).toEqual(["b3", "b2"]);
    expect(res.data?.fotoSesudah.map((f: { id: string }) => f.id)).toEqual(["s5"]);
  });

  it("[] mengosongkan kelompok lama; [] tanpa foto lama tidak membuka transaksi", async () => {
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({ foto: [barisDb("sebelum", "b1")] });
    await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: { ...baseBody, fotoSebelumIds: [] } }));
    expect(prismaMock.kegiatanDesaFoto.deleteMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.kegiatanDesaFoto.createMany).not.toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalledWith("KegiatanDesa", ["b1"], []);

    vi.clearAllMocks();
    prismaMock.kegiatanDesa.update.mockResolvedValue({ id: "k1", foto: [] });
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue(refKosong);
    await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: { ...baseBody, fotoSebelumIds: [], fotoSesudahIds: [] } }));
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("pindah ke kategori non-Pembangunan mengosongkan kedua kelompok dan membersihkan berkasnya", async () => {
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({ foto: [barisDb("sebelum", "a"), barisDb("sesudah", "b")] });
    await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: { ...bukanPembangunan, fotoSebelumIds: ["x"] } }));
    expect(prismaMock.fileStorage.findMany).not.toHaveBeenCalled();
    expect(prismaMock.kegiatanDesaFoto.deleteMany).toHaveBeenCalledWith({
      where: { kegiatanDesaId: "k1", jenis: { in: ["sebelum", "sesudah"] } },
    });
    expect(prismaMock.kegiatanDesaFoto.createMany).not.toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalledWith("KegiatanDesa", ["a", "b"], []);
  });

  it("simpan gagal → berkas lama TIDAK dibersihkan", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValue([berkas("baru")]);
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({ foto: [barisDb("sebelum", "lama")] });
    prismaMock.kegiatanDesa.update.mockRejectedValue(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const res = await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: { ...baseBody, fotoSebelumIds: ["baru"] } }));
    expect(res).toEqual({ success: false, message: "Gagal mengupdate kegiatan desa" });
    expect(removeMock).not.toHaveBeenCalled();
  });

  it("400 untuk foto tidak valid tanpa menyentuh update", async () => {
    const set: { status?: number } = {};
    const res = await kegiatanDesaUpdate(ctx({ set, params: { id: "k1" }, body: { ...baseBody, fotoSesudahIds: ["hilang"] } }));
    expect(set.status).toBe(400);
    expect(res.message).toBe("Foto sesudah tidak ditemukan atau sudah dihapus");
    expect(prismaMock.kegiatanDesa.update).not.toHaveBeenCalled();
  });
});

describe("GET /:id kegiatan desa — foto Pembangunan", () => {
  it("menyertakan fotoSebelum/fotoSesudah terurut sebagai File[]", async () => {
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({
      id: "k1",
      foto: [
        { jenis: "sebelum", fileId: "b1", file: fileApi("b1") },
        { jenis: "sebelum", fileId: "b2", file: fileApi("b2") },
        { jenis: "sesudah", fileId: "s1", file: fileApi("s1") },
      ],
    });
    const res = await kegiatanDesaFindUnique(ctx({ params: { id: "k1" } }));
    expect(res.success).toBe(true);
    expect(res.data?.fotoSebelum).toEqual([fileApi("b1"), fileApi("b2")]);
    expect(res.data?.fotoSesudah).toEqual([fileApi("s1")]);
    const { include } = prismaMock.kegiatanDesa.findUnique.mock.calls[0][0];
    expect(include.foto.orderBy).toEqual([{ jenis: "asc" }, { urutan: "asc" }]);
    expect(include.foto.select.file.select).toMatchObject({ id: true, link: true, realName: true, mimeType: true, size: true });
  });

  it("tanpa foto → dua array kosong", async () => {
    prismaMock.kegiatanDesa.findUnique.mockResolvedValue({ id: "k1", foto: [] });
    const res = await kegiatanDesaFindUnique(ctx({ params: { id: "k1" } }));
    expect(res.data?.fotoSebelum).toEqual([]);
    expect(res.data?.fotoSesudah).toEqual([]);
  });
});
