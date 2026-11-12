// @vitest-environment node
// State galeri foto BUMDes (admin): unggah banyak + bersihkan berkas bila gagal, geser urutan.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const fotoById = { put: vi.fn(), delete: vi.fn() };
  const fotoRoot = Object.assign(vi.fn(() => fotoById), {
    get: vi.fn(),
    post: vi.fn(),
    urutan: { put: vi.fn() },
  });
  return {
    fotoById,
    fotoRoot,
    upload: vi.fn(),
    toast: { success: vi.fn(), error: vi.fn() },
  };
});

vi.mock("@/lib/api-fetch", () => ({
  default: {
    api: {
      // Tanpa `delete`: pembersihan berkas yatim lewat fetch biasa (helper), bukan Eden.
      fileStorage: { create: { post: mocks.upload } },
      ekonomi: { bumdes: { profil: { foto: mocks.fotoRoot } } },
    },
  },
}));
vi.mock("react-toastify", () => ({ toast: mocks.toast }));

import fotoProfilBumdes, { type FotoProfilBumdesData } from "@/app/admin/(dashboard)/_state/ekonomi/bumdes/foto-profil";

const ok = (data: unknown = {}) => ({ status: 200, data: { success: true, data } });
const file = (name: string) => new File(["x"], name, { type: "image/png" });
const foto = (id: string): FotoProfilBumdesData => ({
  id,
  imageId: `img-${id}`,
  keterangan: null,
  urutan: 0,
  image: { id: `img-${id}`, name: id, link: `/api/img/${id}` },
});

// Pembersihan berkas yatim memakai global fetch: stub supaya URL/method yang benar-benar terkirim bisa dicek.
const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ message: "ok", deletedId: "x" }), { status: 200 }));
const deleteCalls = () =>
  fetchSpy.mock.calls
    .map((args) => args as unknown as [string, RequestInit | undefined])
    .filter(([, init]) => init?.method === "DELETE")
    .map(([url]) => url);

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchSpy);
  fotoProfilBumdes.data = null;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fotoProfilBumdes.upload", () => {
  it("unggah tiap file lalu POST sekali dengan semua imageId, kemudian muat ulang", async () => {
    mocks.upload.mockResolvedValueOnce(ok({ id: "f1" })).mockResolvedValueOnce(ok({ id: "f2" }));
    mocks.fotoRoot.post.mockResolvedValueOnce(ok([]));
    mocks.fotoRoot.get.mockResolvedValueOnce(ok([foto("a")]));

    expect(await fotoProfilBumdes.upload([file("1.png"), file("2.png")])).toBe(true);
    expect(mocks.fotoRoot.post).toHaveBeenCalledWith({ items: [{ imageId: "f1" }, { imageId: "f2" }] });
    expect(fotoProfilBumdes.data).toHaveLength(1);
    expect(deleteCalls()).toEqual([]);
  });

  it("POST ditolak (mis. profil belum diisi) → berkas terunggah dihapus, pesan server ditampilkan", async () => {
    mocks.upload.mockResolvedValueOnce(ok({ id: "f1" }));
    mocks.fotoRoot.post.mockResolvedValueOnce({
      status: 400,
      data: null,
      error: { value: { message: "Isi profil BUMDes dulu sebelum menambah galeri foto" } },
    });

    expect(await fotoProfilBumdes.upload([file("1.png")])).toBe(false);
    // Berkas yatim masuk Sampah dengan asal menu BUMDes (dulu Eden mengirim DELETE /api/fileStorage lalu TypeError).
    expect(deleteCalls()).toEqual(["/api/fileStorage/delete/f1?from=ekonomi.bumdes"]);
    expect(mocks.toast.error).toHaveBeenCalledWith("Isi profil BUMDes dulu sebelum menambah galeri foto");
  });
});

describe("fotoProfilBumdes.move", () => {
  it("geser ke bawah mengirim seluruh id dalam urutan baru", async () => {
    fotoProfilBumdes.data = [foto("a"), foto("b"), foto("c")];
    mocks.fotoRoot.urutan.put.mockResolvedValueOnce(ok());
    expect(await fotoProfilBumdes.move(0, 1)).toBe(true);
    expect(mocks.fotoRoot.urutan.put).toHaveBeenCalledWith({ ids: ["b", "a", "c"] });
    expect(fotoProfilBumdes.data?.map((f) => f.id)).toEqual(["b", "a", "c"]);
  });

  it("geser di ujung daftar tidak mengirim request", async () => {
    fotoProfilBumdes.data = [foto("a"), foto("b")];
    expect(await fotoProfilBumdes.move(1, 1)).toBe(false);
    expect(mocks.fotoRoot.urutan.put).not.toHaveBeenCalled();
  });

  it("server menolak → muat ulang urutan dari server", async () => {
    fotoProfilBumdes.data = [foto("a"), foto("b")];
    mocks.fotoRoot.urutan.put.mockResolvedValueOnce({ status: 400, data: null });
    mocks.fotoRoot.get.mockResolvedValueOnce(ok([foto("a"), foto("b")]));
    expect(await fotoProfilBumdes.move(0, 1)).toBe(false);
    expect(fotoProfilBumdes.data?.map((f) => f.id)).toEqual(["a", "b"]);
  });
});
