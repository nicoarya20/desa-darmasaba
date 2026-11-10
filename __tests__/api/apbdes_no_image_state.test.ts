// @vitest-environment node
// Form state APBDes tanpa gambar: Zod/form valid tanpa imageId, dan payload
// create/update ke API tidak lagi membawa imageId (dokumen fileId tetap ikut).
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import apbdes from "@/app/admin/(dashboard)/_state/landing-page/apbdes";

const BASE = "http://localhost:3000";
const ITEM = { kode: "4", uraian: "Pendapatan", anggaran: 1000, level: 1, tipe: null };

beforeEach(() => {
  vi.spyOn(apbdes.findMany, "load").mockResolvedValue(undefined as never);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
  server.resetHandlers();
  apbdes.create.reset();
});

describe("apbdes.create — tanpa imageId", () => {
  it("form default tidak punya field imageId", () => {
    apbdes.create.reset();
    expect(apbdes.create.form).not.toHaveProperty("imageId");
    expect(apbdes.create.form.fileId).toBe("");
  });

  it("form valid tanpa imageId → POST sukses, payload tanpa imageId tapi membawa fileId", async () => {
    let body: Record<string, unknown> | null = null;
    server.use(
      http.post(`${BASE}/api/landingpage/apbdes/create`, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ success: true, data: { id: "a1" } });
      })
    );
    apbdes.create.reset();
    apbdes.create.addItem(ITEM);
    apbdes.create.form.tahun = 2025;
    apbdes.create.form.fileId = "doc1";

    const ok = await apbdes.create.create();

    expect(ok).toBe(true);
    expect(body).not.toBeNull();
    expect(body).not.toHaveProperty("imageId");
    expect(body!.fileId).toBe("doc1");
  });
});

describe("apbdes.edit — tanpa imageId", () => {
  it("load mengabaikan imageId dari respons; update mengirim payload tanpa imageId", async () => {
    let putBody: Record<string, unknown> | null = null;
    server.use(
      http.get(`${BASE}/api/landingpage/apbdes/apbdes1`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "apbdes1", tahun: 2025, name: "APBDes 2025", imageId: "img-lama", fileId: "doc1", items: [{ id: "i1", ...ITEM }] },
        })
      ),
      http.put(`${BASE}/api/landingpage/apbdes/apbdes1`, async ({ request }) => {
        putBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ success: true, data: { id: "apbdes1" } });
      })
    );

    await apbdes.edit.load("apbdes1");
    expect(apbdes.edit.form).not.toHaveProperty("imageId");
    expect(apbdes.edit.form.fileId).toBe("doc1");

    const ok = await apbdes.edit.update();

    expect(ok).toBe(true);
    expect(putBody).not.toHaveProperty("imageId");
    expect(putBody!.fileId).toBe("doc1");
  });
});
