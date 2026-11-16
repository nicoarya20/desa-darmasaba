// @vitest-environment node
// State admin daftar anak bersama: muat, unggah foto + bersihkan berkas yatim bila gagal, geser urutan
// (muat ulang bila gagal), hapus permanen. fetch global & unggah gambar di-mock.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  unggah: vi.fn(),
  hapusYatim: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/app/admin/(dashboard)/_state/konten-bersama/unggah-gambar", () => ({
  unggahGambar: mocks.unggah,
  hapusUnggahanYatim: mocks.hapusYatim,
}));
vi.mock("react-toastify", () => ({ toast: mocks.toast }));

import { createDaftarAnakState } from "@/app/admin/(dashboard)/_state/konten-bersama/daftar-anak.state";

type Item = { id: string };
const fetchMock = vi.fn();
const jawab = (status: number, body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status }));
const buat = () => createDaftarAnakState<Item>({ url: (id) => `/api/x/${id}/foto`, label: "foto", tag: "galeri test" });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("createDaftarAnakState", () => {
  it("load mengisi data dari URL induk", async () => {
    fetchMock.mockReturnValueOnce(jawab(200, { success: true, data: [{ id: "a" }] }));
    const s = buat();
    await s.load("bs1");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/x/bs1/foto");
    expect(s.data).toEqual([{ id: "a" }]);
    expect(s.loaded).toBe(true);
  });

  it("unggah foto gagal didaftarkan → berkas yang terlanjur terunggah dibersihkan", async () => {
    const s = buat();
    s.parentId = "bs1";
    mocks.unggah.mockResolvedValueOnce("img-1").mockResolvedValueOnce("img-2");
    fetchMock.mockReturnValueOnce(jawab(400, { success: false, message: "Foto kegiatan maksimal 50; sisa slot 0" }));
    expect(await s.unggahFoto([new File(["a"], "a.png"), new File(["b"], "b.png")])).toBe(false);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ items: [{ imageId: "img-1" }, { imageId: "img-2" }] });
    expect(mocks.hapusYatim).toHaveBeenCalledWith(["img-1", "img-2"], "galeri test");
    expect(mocks.toast.error).toHaveBeenCalledWith("Foto kegiatan maksimal 50; sisa slot 0");
  });

  it("geser menyimpan urutan baru; gagal → muat ulang dari server", async () => {
    const s = buat();
    s.parentId = "bs1";
    s.data = [{ id: "a" }, { id: "b" }];
    fetchMock.mockReturnValueOnce(jawab(200, { success: true }));
    expect(await s.geser(0, 1)).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/x/bs1/foto/urutan");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ ids: ["b", "a"] });

    fetchMock.mockReturnValueOnce(jawab(400, { success: false, message: "Daftar foto sudah berubah." }));
    fetchMock.mockReturnValueOnce(jawab(200, { success: true, data: [{ id: "b" }, { id: "a" }] }));
    expect(await s.geser(0, 1)).toBe(false);
    expect(s.data).toEqual([{ id: "b" }, { id: "a" }]);
  });

  it("hapus mengeluarkan item dari daftar setelah server sukses", async () => {
    const s = buat();
    s.parentId = "bs1";
    s.data = [{ id: "a" }, { id: "b" }];
    fetchMock.mockReturnValueOnce(jawab(200, { success: true, message: "Foto kegiatan berhasil dihapus" }));
    expect(await s.hapus("a")).toBe(true);
    expect(fetchMock.mock.calls[0]).toEqual(["/api/x/bs1/foto/a", { method: "DELETE" }]);
    expect(s.data).toEqual([{ id: "b" }]);
  });
});
