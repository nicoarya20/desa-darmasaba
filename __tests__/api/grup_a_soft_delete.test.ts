// @vitest-environment node
// Kontrak delete handler Grup A (10 file FK-capable, rollout dari blueprint
// info-sekolah-paud).
//
// Akar bug (STG): hard delete prisma.delete() pada parent ber-anak melempar
// P2003 (FK) yang di-serialisasi Elysia jadi 500 plaintext -> frontend .json()
// meledak SyntaxError. Fix meniru desa/banjar/del.ts: soft-delete
// (isActive:false) + FK precheck + SELALU return Response.json.
//
// Test menjamin 3 properti per handler: (1) soft-delete via update, bukan
// delete; (2) precheck memblokir bila ada anak aktif (pesan berisi jumlah);
// (3) semua jalur error mengembalikan body JSON-serializable, bukan plaintext.
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted agar prismaMock tersedia saat vi.mock factory dievaluasi (hoisted).
const prismaMock = vi.hoisted(() => ({
  categoryPengumuman: { update: vi.fn(), delete: vi.fn() },
  pengumuman: { count: vi.fn() },
  kategoriKegiatan: { update: vi.fn(), delete: vi.fn() },
  kegiatanDesa: { count: vi.fn() },
  pendaftaranJadwalKegiatan: { update: vi.fn(), delete: vi.fn() },
  jadwalKegiatan: { count: vi.fn() },
  kelahiran: { update: vi.fn(), delete: vi.fn() },
  kematian: { update: vi.fn(), delete: vi.fn() },
  dataKematian_Kelahiran: { count: vi.fn() },
  jenisKelaminResponden: { update: vi.fn(), delete: vi.fn() },
  umurResponden: { update: vi.fn(), delete: vi.fn() },
  pilihanRatingResponden: { update: vi.fn(), delete: vi.fn() },
  responden: { count: vi.fn() },
  kategoriDesaAntiKorupsi: { update: vi.fn(), delete: vi.fn() },
  desaAntiKorupsi: { count: vi.fn() },
  kategoriPrestasiDesa: { update: vi.fn(), delete: vi.fn() },
  prestasiDesa: { count: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import kategoriPengumumanDelete from "@/app/api/[[...slugs]]/_lib/desa/pengumuman/kategori-pengumuman/del";
import kategoriKegiatanDelete from "@/app/api/[[...slugs]]/_lib/lingkungan/gotong-royong/kategori-kegiatan/del";
import pendaftaranJadwalKegiatanDelete from "@/app/api/[[...slugs]]/_lib/kesehatan/data_kesehatan_warga/jadwal_kegiatan/pendaftaran/del";
import kelahiranDelete from "@/app/api/[[...slugs]]/_lib/kesehatan/data_kesehatan_warga/persentase_kelahiran_kematian/kelahiran/del";
import kematianDelete from "@/app/api/[[...slugs]]/_lib/kesehatan/data_kesehatan_warga/persentase_kelahiran_kematian/kematian/del";
import jenisKelaminRespondenDelete from "@/app/api/[[...slugs]]/_lib/landing_page/indeks_kepuasan/jenis-kelamin-responden/del";
import umurRespondenDelete from "@/app/api/[[...slugs]]/_lib/landing_page/indeks_kepuasan/umur-responden/del";
import pilihanRatingRespondenDelete from "@/app/api/[[...slugs]]/_lib/landing_page/indeks_kepuasan/pilihan-rating-responden/del";
import kategoriDesaAntiKorupsiDelete from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/kategori-dak/del";
import kategoriPrestasiDelete from "@/app/api/[[...slugs]]/_lib/landing_page/prestasi-desa/kategori-prestasi/del";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (id?: string) => ({ params: id === undefined ? {} : { id } }) as any;

// Handler kadang return Response (jalur error/precheck) kadang plain object
// (jalur sukses). Normalisasi keduanya jadi { status, body } untuk assertion —
// sekaligus membuktikan tak ada jalur yang mengembalikan plaintext non-JSON.
async function unwrap(result: unknown): Promise<{ status: number; body: any }> {
  if (result instanceof Response) {
    return { status: result.status, body: await result.json() };
  }
  return { status: 200, body: result };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Definisi tiap handler: parent delegate (utk assert update/delete), child
// delegate (utk mock count precheck), fungsi handler, & fragmen pesan FK-block.
const cases = [
  {
    name: "kategoriPengumuman",
    handler: kategoriPengumumanDelete,
    parent: prismaMock.categoryPengumuman,
    child: prismaMock.pengumuman,
    childCount: 3,
    childFragment: "3 pengumuman",
  },
  {
    name: "kategoriKegiatan",
    handler: kategoriKegiatanDelete,
    parent: prismaMock.kategoriKegiatan,
    child: prismaMock.kegiatanDesa,
    childCount: 2,
    childFragment: "2 kegiatan",
  },
  {
    name: "pendaftaranJadwalKegiatan",
    handler: pendaftaranJadwalKegiatanDelete,
    parent: prismaMock.pendaftaranJadwalKegiatan,
    child: prismaMock.jadwalKegiatan,
    childCount: 4,
    childFragment: "4 jadwal",
  },
  {
    name: "kelahiran",
    handler: kelahiranDelete,
    parent: prismaMock.kelahiran,
    child: prismaMock.dataKematian_Kelahiran,
    childCount: 5,
    childFragment: "5 data",
  },
  {
    name: "kematian",
    handler: kematianDelete,
    parent: prismaMock.kematian,
    child: prismaMock.dataKematian_Kelahiran,
    childCount: 6,
    childFragment: "6 data",
  },
  {
    name: "jenisKelaminResponden",
    handler: jenisKelaminRespondenDelete,
    parent: prismaMock.jenisKelaminResponden,
    child: prismaMock.responden,
    childCount: 7,
    childFragment: "7 responden",
  },
  {
    name: "umurResponden",
    handler: umurRespondenDelete,
    parent: prismaMock.umurResponden,
    child: prismaMock.responden,
    childCount: 8,
    childFragment: "8 responden",
  },
  {
    name: "pilihanRatingResponden",
    handler: pilihanRatingRespondenDelete,
    parent: prismaMock.pilihanRatingResponden,
    child: prismaMock.responden,
    childCount: 9,
    childFragment: "9 responden",
  },
  {
    name: "kategoriDesaAntiKorupsi",
    handler: kategoriDesaAntiKorupsiDelete,
    parent: prismaMock.kategoriDesaAntiKorupsi,
    child: prismaMock.desaAntiKorupsi,
    childCount: 2,
    childFragment: "2 data",
  },
  {
    name: "kategoriPrestasi",
    handler: kategoriPrestasiDelete,
    parent: prismaMock.kategoriPrestasiDesa,
    child: prismaMock.prestasiDesa,
    childCount: 3,
    childFragment: "3 prestasi",
  },
] as const;

describe.each(cases)(
  "$name delete — kontrak soft-delete + FK precheck",
  ({ handler, parent, child, childCount, childFragment }) => {
    it("id kosong → 400 success:false, tak sentuh DB", async () => {
      const { status, body } = await unwrap(await handler(ctx()));
      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(parent.update).not.toHaveBeenCalled();
    });

    it("masih dipakai anak aktif → 400 dgn pesan jumlah, tak soft-delete", async () => {
      child.count.mockResolvedValue(childCount);
      const { status, body } = await unwrap(await handler(ctx("p1")));
      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toContain(childFragment);
      expect(parent.update).not.toHaveBeenCalled();
      expect(parent.delete).not.toHaveBeenCalled();
    });

    it("tanpa anak aktif → soft-delete (update isActive:false), BUKAN hard delete", async () => {
      child.count.mockResolvedValue(0);
      parent.update.mockResolvedValue({ id: "p1" });
      const { body } = await unwrap(await handler(ctx("p1")));
      expect(body.success).toBe(true);
      expect(parent.update).toHaveBeenCalledWith({
        where: { id: "p1" },
        data: { isActive: false },
      });
      expect(parent.delete).not.toHaveBeenCalled();
    });

    it("prisma throw → 500 tapi tetap JSON (perisai SyntaxError)", async () => {
      child.count.mockResolvedValue(0);
      parent.update.mockRejectedValue(new Error("boom"));
      const { status, body } = await unwrap(await handler(ctx("p1")));
      expect(status).toBe(500);
      expect(body.success).toBe(false); // body valid JSON, bukan plaintext
    });
  }
);
