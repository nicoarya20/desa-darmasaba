// @vitest-environment node
// Admin APBDes: draft editor folder bersama dari respons APBDes → unggah berkas tertunda + payload API,
// state create/update mengirim folders + dokumen (dan pesan 400 tampil), serta daftar dokumen di detail.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";

const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() }));
vi.mock("react-toastify", () => ({ toast: toastMock }));

import apbdes from "@/app/admin/(dashboard)/_state/landing-page/apbdes";
import { prepareApbdesIsi } from "@/app/admin/(dashboard)/landing-page/apbdes/_lib/dokumen-isi";
import { ApbdesDokumenList } from "@/app/admin/(dashboard)/landing-page/apbdes/_com/ApbdesDokumenList";
import { draftsFromFiles } from "@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-draft";
import { addFolder, isiDraftFromDetail } from "@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/folder-draft";

const BASE = "http://localhost:3000";
const ITEM = { kode: "4", uraian: "Pendapatan", anggaran: 1000, level: 1, tipe: null };
const file = (id: string) => ({ id, link: `/api/fileStorage/findUnique/${id}`, realName: `${id}.pdf`, mimeType: "application/pdf", size: 1 });
// Bentuk respons GET /api/landingpage/apbdes/:id (lihat toApbdesDokumenView)
const detail = {
  folders: [
    { id: "fo1", nama: "Semester I", urutan: 0, dokumen: [{ id: "d1", judul: "Laporan", urutan: 0, fileId: "f1", createdAt: "2026-01-01T00:00:00.000Z", file: file("f1") }] },
  ],
  dokumenUmum: [{ id: "d2", judul: "Perdes", urutan: 0, fileId: "f2", createdAt: "2026-01-01T00:00:00.000Z", file: file("f2") }],
};
const isiPayload = { folders: [{ tempKey: "t1", nama: "Perdes", urutan: 0 }], dokumen: [{ fileId: "f1", judul: "Perdes", urutan: 0, folder: { tempKey: "t1" } }] };

beforeEach(() => {
  vi.spyOn(apbdes.findMany, "load").mockResolvedValue(undefined as never);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  server.resetHandlers();
  apbdes.create.reset();
});

describe("prepareApbdesIsi", () => {
  it("mengunggah hanya berkas baru lalu membentuk payload folder + dokumen (urutan per folder)", async () => {
    const saved = isiDraftFromDetail(detail);
    const withFolder = addFolder(saved);
    const folderBaru = withFolder.folders[1];
    const baru = draftsFromFiles([new File(["x"], "Lampiran.pdf", { type: "application/pdf" })], folderBaru.key);
    const upload = vi.fn(async (f: File) => ({ id: "f-up", link: "/x", mimeType: f.type, realName: f.name }));

    const { isi, payload } = await prepareApbdesIsi({ ...withFolder, dokumen: [...withFolder.dokumen, ...baru] }, upload);

    expect(upload).toHaveBeenCalledTimes(1);
    expect(isi.dokumen.every((d) => d.fileId)).toBe(true);
    expect(payload.folders).toEqual([
      { id: "fo1", nama: "Semester I", urutan: 0 },
      { tempKey: folderBaru.key, nama: "Folder baru", urutan: 1 },
    ]);
    expect(payload.dokumen).toEqual([
      { id: "d1", fileId: "f1", judul: "Laporan", urutan: 0, folder: { id: "fo1" } },
      { id: "d2", fileId: "f2", judul: "Perdes", urutan: 0, folder: null },
      { fileId: "f-up", judul: "Lampiran", urutan: 0, folder: { tempKey: folderBaru.key } },
    ]);
  });
});

describe("state apbdes — isi dokumen ikut dikirim", () => {
  it("create(isi) mengirim folders + dokumen bersama form", async () => {
    let body: Record<string, unknown> | null = null;
    server.use(
      http.post(`${BASE}/api/landingpage/apbdes/create`, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ success: true, data: { id: "a1" } });
      }),
    );
    apbdes.create.addItem(ITEM);
    apbdes.create.form.tahun = 2026;

    expect(await apbdes.create.create(isiPayload)).toBe(true);
    expect(body!.folders).toEqual(isiPayload.folders);
    expect(body!.dokumen).toEqual(isiPayload.dokumen);
  });

  it("update(isi) mengirim folders + dokumen; 400 validasi menampilkan pesan API", async () => {
    let putBody: Record<string, unknown> | null = null;
    server.use(
      http.put(`${BASE}/api/landingpage/apbdes/a1`, async ({ request }) => {
        putBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ success: false, message: "Dokumen #1: judul wajib diisi" }, { status: 400 });
      }),
    );
    apbdes.edit.id = "a1";
    apbdes.edit.form = { ...apbdes.edit.form, tahun: 2026, items: [{ ...ITEM, realisasi: 0, selisih: 0, persentase: 0 }] };

    expect(await apbdes.edit.update(isiPayload)).toBe(false);
    expect(putBody!.dokumen).toEqual(isiPayload.dokumen);
    expect(putBody!.folders).toEqual(isiPayload.folders);
    expect(toastMock.error).toHaveBeenCalledWith("Dokumen #1: judul wajib diisi");
  });
});

describe("ApbdesDokumenList (detail admin)", () => {
  const render = (apbdesData: Parameters<typeof ApbdesDokumenList>[0]["apbdes"]) =>
    renderToStaticMarkup(
      <MantineProvider>
        <ApbdesDokumenList apbdes={apbdesData} />
      </MantineProvider>,
    );

  it("menampilkan folder (Umum dulu) beserta tautan tiap dokumen", () => {
    const html = render(detail);
    expect(html).toContain("Semester I (1)");
    expect(html).toContain("Umum (1)");
    expect(html.indexOf("Umum (1)")).toBeLessThan(html.indexOf("Semester I (1)"));
    expect(html).toContain('href="/api/fileStorage/findUnique/f1"');
    expect(html).toContain('href="/api/fileStorage/findUnique/f2"');
  });

  it("tanpa dokumen & berkas lama → teks kosong", () => {
    const html = render({ folders: [], dokumenUmum: [], file: null });
    expect(html).toContain("Tidak ada dokumen");
    expect(html).not.toContain("<a");
  });
});
