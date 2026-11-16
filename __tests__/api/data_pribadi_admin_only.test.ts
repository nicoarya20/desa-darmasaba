// @vitest-environment node
// GET berisi data pribadi warga (Ibu Hamil, Balita, kiriman Pengaduan & Administrasi Online, Siswa, pendaftar beasiswa,
// peminjam buku) wajib admin:
// request HTTP sungguhan lewat modul Elysia (prisma & auth di-mock). Master data & agregat publik tetap terbuka,
// dan respons create publik tidak menggemakan NIK/HP. Keputusan: docs/decisions/2026-11-17-api-data-pribadi-admin-only.md
import { describe, it, expect, vi, beforeEach } from "vitest";
import Elysia from "elysia";

const { requireAuthMock, prismaMock } = vi.hoisted(() => {
  // Prisma rekaan: setiap model.method → vi.fn dengan hasil netral, supaya handler mana pun bisa jalan.
  const models = new Map<string, Record<string, ReturnType<typeof vi.fn>>>();
  const result = (method: string) => {
    if (method === "count") return 0;
    if (method === "findMany") return [];
    if (method === "findUnique") return { id: "id-rekaan" }; // test-only
    if (method === "create") return { id: "baru-1" }; // test-only
    return null;
  };
  const model = (name: string) => {
    if (!models.has(name)) {
      models.set(
        name,
        new Proxy({} as Record<string, ReturnType<typeof vi.fn>>, {
          get: (fns, method: string) => (fns[method] ??= vi.fn(async () => result(method))),
        }),
      );
    }
    return models.get(name)!;
  };
  return {
    requireAuthMock: vi.fn(),
    prismaMock: new Proxy({}, { get: (_t, name: string) => model(name) }) as Record<string, Record<string, ReturnType<typeof vi.fn>>>,
  };
});
vi.mock("@/lib/api-auth", () => ({ requireAuth: () => requireAuthMock() }));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: {}, MINIO_BUCKET: "bucket-test" }));

import Balita from "@/app/api/[[...slugs]]/_lib/kesehatan/balita";
import IbuHamil from "@/app/api/[[...slugs]]/_lib/kesehatan/ibu-hamil";
import RingkasanKesehatan from "@/app/api/[[...slugs]]/_lib/kesehatan/ringkasan-kesehatan";
import LayananOnlineDesa from "@/app/api/[[...slugs]]/_lib/inovasi/layanan-online-desa";
import Siswa from "@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/siswa";
import Pengajar from "@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/pengajar";
import RingkasanPendidikan from "@/app/api/[[...slugs]]/_lib/pendidikan/ringkasan";
import Beasiswa from "@/app/api/[[...slugs]]/_lib/pendidikan/beasiswa-desa";
import PerpustakaanDigital from "@/app/api/[[...slugs]]/_lib/pendidikan/perpustakaan-digital";
import { PESAN_DATA_PRIBADI_BUKAN_ADMIN } from "@/app/api/[[...slugs]]/_lib/_data-pribadi/guard";

// Prefix induk dipasang ulang seperti di route.ts / index domain, agar URL test = URL produksi.
const app = new Elysia({ prefix: "/api" })
  .group("/kesehatan", (g) => g.use(Balita).use(IbuHamil).use(RingkasanKesehatan))
  .group("/inovasi", (g) => g.use(LayananOnlineDesa))
  .group("/pendidikan", (g) =>
    g
      .group("/infosekolahpaud", (s) => s.use(Siswa).use(Pengajar))
      .use(RingkasanPendidikan)
      .use(Beasiswa)
      .use(PerpustakaanDigital),
  );

const call = (url: string, init?: RequestInit) => app.handle(new Request(`http://localhost${url}`, init));
const postJson = (url: string, body: unknown) =>
  call(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const unauthorized = () => ({
  authenticated: false,
  response: new Response(JSON.stringify({ success: false, message: "Unauthorized - Silakan login terlebih dahulu" }), { status: 401 }),
});
const asRole = (roleId: string) => ({ authenticated: true, user: { id: "u-rekaan", roleId, isActive: true } }); // test-only

const LAYANAN = "/api/inovasi/layananonlinedesa";
const BEASISWA = "/api/pendidikan/beasiswa";
const PERPUS = "/api/pendidikan/perpustakaandigital";
const DITUTUP = [
  "/api/kesehatan/ibuhamil/find-many",
  "/api/kesehatan/ibuhamil/ibu-1",
  "/api/kesehatan/balita/find-many",
  "/api/kesehatan/balita/balita-1",
  `${LAYANAN}/pengaduanmasyarakat/find-many`,
  `${LAYANAN}/pengaduanmasyarakat/aduan-1`,
  `${LAYANAN}/administrasionline/find-many`,
  `${LAYANAN}/administrasionline/adm-1`,
  "/api/pendidikan/infosekolahpaud/siswa/find-many",
  "/api/pendidikan/infosekolahpaud/siswa/siswa-1",
  `${BEASISWA}/beasiswapendaftar/findMany`,
  `${BEASISWA}/beasiswapendaftar/pendaftar-1`,
  `${PERPUS}/peminjamanbuku/findMany`,
  `${PERPUS}/peminjamanbuku/pinjam-1`,
];
const TETAP_PUBLIK = [
  `${LAYANAN}/administrasionline/jenislayanan/find-many`,
  `${LAYANAN}/pengaduanmasyarakat/jenispengaduan/find-many`,
  "/api/kesehatan/ringkasankesehatan/stats",
  "/api/pendidikan/ringkasan/stats",
  "/api/pendidikan/infosekolahpaud/pengajar/find-many",
  `${BEASISWA}/ringkasan/stats`,
  `${BEASISWA}/keunggulanprogram/findMany`,
  `${PERPUS}/dataperpustakaan/findMany`,
];

beforeEach(() => {
  vi.clearAllMocks();
  requireAuthMock.mockResolvedValue(unauthorized());
});

describe("GET data pribadi warga — admin-only", () => {
  it.each(DITUTUP)("%s tanpa sesi → 401", async (url) => {
    const res = await call(url);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ success: false, message: "Unauthorized - Silakan login terlebih dahulu" });
    expect(requireAuthMock).toHaveBeenCalledTimes(1);
  });

  it.each(DITUTUP)("%s sesi user biasa (role 5) → 403", async (url) => {
    requireAuthMock.mockResolvedValue(asRole("5"));
    const res = await call(url);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ success: false, message: PESAN_DATA_PRIBADI_BUKAN_ADMIN });
  });

  it.each(DITUTUP)("%s sesi admin (role 2) → 200 dengan data", async (url) => {
    requireAuthMock.mockResolvedValue(asRole("2"));
    const res = await call(url);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it("akun admin nonaktif → 403 dari requireAuth diteruskan", async () => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: "Akun Anda tidak aktif. Hubungi administrator." }), { status: 403 }),
    });
    const res = await call("/api/kesehatan/balita/find-many");
    expect(res.status).toBe(403);
    expect(prismaMock.balita.findMany).not.toHaveBeenCalled();
  });

  it("admin kesehatan (3) & pendidikan (4) tetap boleh membaca", async () => {
    requireAuthMock.mockResolvedValue(asRole("3"));
    expect((await call("/api/kesehatan/ibuhamil/find-many")).status).toBe(200);
    requireAuthMock.mockResolvedValue(asRole("4"));
    expect((await call("/api/pendidikan/infosekolahpaud/siswa/find-many")).status).toBe(200);
  });
});

describe("master data & agregat publik tetap terbuka", () => {
  it.each(TETAP_PUBLIK)("%s tanpa sesi → 200 tanpa cek sesi", async (url) => {
    const res = await call(url);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(requireAuthMock).not.toHaveBeenCalled();
  });
});

describe("create publik tidak menggemakan data pribadi", () => {
  // test-only: data rekaan, bukan warga sungguhan.
  const NIK = "5100000000000001";
  const HP = "080000000001";

  it("POST pengaduan → hanya id, tanpa NIK/HP/email", async () => {
    const res = await postJson(`${LAYANAN}/pengaduanmasyarakat/create`, {
      name: "Warga Rekaan",
      email: "rekaan@example.test",
      nomorTelepon: HP,
      nik: NIK,
      judulPengaduan: "Lampu jalan mati",
      lokasiKejadian: "Banjar Rekaan",
      deskripsiPengaduan: "<p>Rekaan</p>",
      jenisPengaduanId: "jp-1",
      imageId: "img-1",
    });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({ success: true, message: "Sukses menambahkan pengaduan masyarakat", data: { id: "baru-1" } });
    expect(text).not.toContain(NIK);
    expect(text).not.toContain(HP);
    expect(requireAuthMock).not.toHaveBeenCalled();
  });

  it("POST administrasi online → hanya id, tanpa alamat/nomor telepon", async () => {
    const res = await postJson(`${LAYANAN}/administrasionline/create`, {
      name: "Warga Rekaan",
      alamat: "Jalan Rekaan 1",
      nomorTelepon: HP,
      jenisLayananId: "jl-1",
    });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({ success: true, message: "Berhasil membuat administrasi online", data: { id: "baru-1" } });
    expect(text).not.toContain(HP);
    expect(text).not.toContain("Jalan Rekaan");
    expect(prismaMock.administrasiOnline.create).toHaveBeenCalledWith(expect.objectContaining({ select: { id: true } }));
  });
});
