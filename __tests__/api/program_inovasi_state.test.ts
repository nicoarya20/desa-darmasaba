// @vitest-environment node
// State admin Program Inovasi: schema zod (logo & link tidak wajib) dan payload create/update
// tidak lagi mengirim link, tetapi mengirim imageIds galeri dokumentasi.
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const byId = { get: vi.fn(), put: vi.fn() };
  const root = Object.assign(vi.fn(() => byId), {
    create: { post: vi.fn() },
    findMany: { get: vi.fn() },
  });
  return { byId, root, toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn() } };
});

vi.mock("@/lib/api-fetch", () => ({
  default: { api: { landingpage: { programinovasi: new Proxy(mocks.root, {
    get: (target, key: string) => (key in target ? target[key as keyof typeof target] : mocks.byId),
  }) } } },
}));
vi.mock("react-toastify", () => ({ toast: mocks.toast }));

import programInovasi, {
  emptyProgramInovasiForm,
  templateProgramInovasi,
} from "@/app/admin/(dashboard)/_state/landing-page/profile/program-inovasi";
import { MAX_GAMBAR_DOKUMENTASI } from "@/lib/program-inovasi";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.root.findMany.get.mockResolvedValue({ status: 200, data: { success: true, data: [] } });
});

describe("templateProgramInovasi", () => {
  it("valid tanpa imageId dan tanpa link", () => {
    expect(templateProgramInovasi.safeParse({ name: "Sipandu", description: "<p>x</p>" }).success).toBe(true);
    expect(templateProgramInovasi.safeParse({ name: "Sipandu", description: "x", imageId: null }).success).toBe(true);
  });

  it("nama tetap wajib", () => {
    expect(templateProgramInovasi.safeParse({ name: "", description: "x" }).success).toBe(false);
  });

  it("galeri melebihi batas ditolak", () => {
    const imageIds = Array.from({ length: MAX_GAMBAR_DOKUMENTASI + 1 }, (_, i) => `f${i}`);
    expect(templateProgramInovasi.safeParse({ name: "A", description: "x", imageIds }).success).toBe(false);
  });
});

describe("payload state", () => {
  it("create mengirim imageId null & imageIds, tanpa link", async () => {
    mocks.root.create.post.mockResolvedValue({ status: 200, data: { success: true } });
    programInovasi.create.form = { ...emptyProgramInovasiForm(), name: "A", description: "B", imageIds: ["g1"] };
    await programInovasi.create.create();
    expect(mocks.root.create.post).toHaveBeenCalledWith({ name: "A", description: "B", imageId: null, imageIds: ["g1"] });
  });

  it("load edit mengisi imageIds dari images, lalu update mengirimnya tanpa link", async () => {
    mocks.byId.get.mockResolvedValue({
      data: { success: true, data: { id: "p1", name: "A", description: "B", imageId: null, link: "https://lama", images: [{ id: "g1" }, { id: "g2" }] } },
    });
    await programInovasi.update.load("p1");
    expect(programInovasi.update.form).toEqual({ name: "A", description: "B", imageId: null, imageIds: ["g1", "g2"] });

    mocks.byId.put.mockResolvedValue({ data: { success: true } });
    await programInovasi.update.update();
    expect(mocks.byId.put).toHaveBeenCalledWith({ name: "A", description: "B", imageId: null, imageIds: ["g1", "g2"] });
  });
});
