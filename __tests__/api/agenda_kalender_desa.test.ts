// @vitest-environment node
// Agenda & Kalender Desa (EventBudaya): kategori, tanggalSelesai, filter list
// (kategori/tahun/bulan/mendatang), validasi create/update, dan kontrak aditif.
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  eventBudaya: {
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import eventBudayaCreate from "@/app/api/[[...slugs]]/_lib/desa/event-budaya/create";
import { buildEventBudayaWhere } from "@/app/api/[[...slugs]]/_lib/desa/event-budaya/filter";
import eventBudayaFindMany from "@/app/api/[[...slugs]]/_lib/desa/event-budaya/find-many";
import EventBudayaRoutes from "@/app/api/[[...slugs]]/_lib/desa/event-budaya/index";
import eventBudayaUpdate from "@/app/api/[[...slugs]]/_lib/desa/event-budaya/updt";
import {
  KATEGORI_EVENT,
  KATEGORI_EVENT_DEFAULT,
  KATEGORI_EVENT_LABEL,
  isKategoriEvent,
  labelKategoriEvent,
  parseEventInput,
} from "@/lib/agenda-desa";
import {
  awalHariWita,
  daftarTahunAgenda,
  formatRentangTanggal,
  hitungAgendaPerBulan,
  rentangTahunBulan,
  statusAgenda,
  tahunBerjalan,
} from "@/lib/agenda-desa-waktu";

const NOW = new Date("2026-11-06T04:00:00.000Z"); // test-only: 06 Nov 2026 12:00 WITA

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context handler test
const ctx = (over: Record<string, any>) => ({ set: {}, query: {}, params: {}, ...over }) as any;

const baseBody = {
  nama: "Contoh Agenda", // test-only
  tanggal: "2026-10-17",
  lokasi: "Balai Banjar",
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.eventBudaya.create.mockResolvedValue({ id: "e1" });
  prismaMock.eventBudaya.update.mockResolvedValue({ id: "e1" });
  prismaMock.eventBudaya.findMany.mockResolvedValue([]);
  prismaMock.eventBudaya.count.mockResolvedValue(0);
});

describe("konstanta kategori", () => {
  it("memuat 7 kategori dengan label Indonesia dan default BUDAYA", () => {
    expect([...KATEGORI_EVENT]).toEqual([
      "BUDAYA",
      "PEMERINTAHAN",
      "MUSYAWARAH",
      "KEPEMUDAAN",
      "PKK_PEREMPUAN",
      "PERTANIAN_PETERNAKAN",
      "LAINNYA",
    ]);
    expect(KATEGORI_EVENT_DEFAULT).toBe("BUDAYA");
    expect(KATEGORI_EVENT_LABEL.PKK_PEREMPUAN).toBe("PKK & Perempuan");
    for (const k of KATEGORI_EVENT) expect(KATEGORI_EVENT_LABEL[k]).toBeTruthy();
  });

  it("isKategoriEvent menolak nilai tak dikenal dan label jatuh ke Lainnya", () => {
    expect(isKategoriEvent("MUSYAWARAH")).toBe(true);
    expect(isKategoriEvent("musyawarah")).toBe(false);
    expect(isKategoriEvent("OLAHRAGA")).toBe(false);
    expect(labelKategoriEvent("OLAHRAGA")).toBe("Lainnya");
    expect(labelKategoriEvent(null)).toBe("Lainnya");
  });
});

describe("parseEventInput", () => {
  it("menolak kategori tak dikenal", () => {
    const r = parseEventInput({ ...baseBody, kategori: "OLAHRAGA" });
    expect(r.ok).toBe(false);
  });

  it("menolak tanggalSelesai sebelum tanggal", () => {
    const r = parseEventInput({ ...baseBody, tanggalSelesai: "2026-10-16" });
    expect(r).toEqual({ ok: false, message: "Tanggal selesai tidak boleh sebelum tanggal mulai" });
  });

  it("menerima tanggalSelesai sama atau setelah tanggal", () => {
    const sama = parseEventInput({ ...baseBody, tanggalSelesai: "2026-10-17" });
    const sesudah = parseEventInput({ ...baseBody, tanggalSelesai: "2026-10-18" });
    expect(sama.ok && sama.data.tanggalSelesai).toEqual(new Date("2026-10-17"));
    expect(sesudah.ok && sesudah.data.tanggalSelesai).toEqual(new Date("2026-10-18"));
  });

  it("menolak tanggalSelesai yang bukan tanggal", () => {
    expect(parseEventInput({ ...baseBody, tanggalSelesai: "bukan-tanggal" }).ok).toBe(false);
  });

  it("undefined dilewati, null atau string kosong mengosongkan tanggalSelesai", () => {
    expect(parseEventInput({ ...baseBody })).toEqual({ ok: true, data: {} });
    expect(parseEventInput({ ...baseBody, tanggalSelesai: null })).toEqual({
      ok: true,
      data: { tanggalSelesai: null },
    });
    expect(parseEventInput({ ...baseBody, tanggalSelesai: "" })).toEqual({
      ok: true,
      data: { tanggalSelesai: null },
    });
  });
});

describe("agenda-desa-waktu (WITA)", () => {
  it("rentangTahunBulan memakai batas tengah malam WITA", () => {
    const tahun = rentangTahunBulan(2026);
    expect(tahun.gte.toISOString()).toBe("2025-12-31T16:00:00.000Z");
    expect(tahun.lt.toISOString()).toBe("2026-12-31T16:00:00.000Z");
    const des = rentangTahunBulan(2026, 12);
    expect(des.lt.toISOString()).toBe("2026-12-31T16:00:00.000Z");
    expect(rentangTahunBulan(2026, 10).gte.toISOString()).toBe("2026-09-30T16:00:00.000Z");
  });

  it("awalHariWita & tahunBerjalan mengikuti hari/tahun WITA", () => {
    expect(awalHariWita(NOW).toISOString()).toBe("2026-11-05T16:00:00.000Z");
    expect(tahunBerjalan(new Date("2026-12-31T17:00:00.000Z"))).toBe(2027); // 01 Jan 2027 01:00 WITA
    expect(daftarTahunAgenda(NOW)).toEqual([2027, 2026, 2025, 2024]);
  });

  it("statusAgenda: akan datang, berlangsung, selesai (termasuk multi-hari)", () => {
    expect(statusAgenda({ tanggal: "2026-11-20T02:00:00.000Z" }, NOW)).toBe("akan-datang");
    expect(statusAgenda({ tanggal: "2026-11-06T01:00:00.000Z" }, NOW)).toBe("berlangsung");
    expect(statusAgenda({ tanggal: "2026-11-05T02:00:00.000Z" }, NOW)).toBe("selesai");
    expect(
      statusAgenda({ tanggal: "2026-11-04T02:00:00.000Z", tanggalSelesai: "2026-11-07T02:00:00.000Z" }, NOW),
    ).toBe("berlangsung");
    expect(
      statusAgenda({ tanggal: "2026-11-01T02:00:00.000Z", tanggalSelesai: "2026-11-02T02:00:00.000Z" }, NOW),
    ).toBe("selesai");
  });

  it("hitungAgendaPerBulan menghitung agenda multi-hari di tiap bulan yang dilewati", () => {
    const hasil = hitungAgendaPerBulan(
      [
        { tanggal: "2026-10-17T02:00:00.000Z", tanggalSelesai: "2026-10-18T02:00:00.000Z" },
        { tanggal: "2026-10-30T02:00:00.000Z", tanggalSelesai: "2026-11-02T02:00:00.000Z" },
        { tanggal: "2026-03-19T00:00:00.000Z" },
      ],
      2026,
    );
    expect(hasil).toHaveLength(12);
    expect(hasil[2]).toBe(1);
    expect(hasil[9]).toBe(2);
    expect(hasil[10]).toBe(1);
    expect(hasil[0]).toBe(0);
  });

  it("formatRentangTanggal untuk satu hari, satu bulan, dan lintas bulan", () => {
    expect(formatRentangTanggal({ tanggal: "2026-10-17T02:00:00.000Z" })).toBe("17 Oktober 2026");
    expect(
      formatRentangTanggal({ tanggal: "2026-10-17T02:00:00.000Z", tanggalSelesai: "2026-10-18T02:00:00.000Z" }),
    ).toBe("17–18 Oktober 2026");
    expect(
      formatRentangTanggal({ tanggal: "2026-10-30T02:00:00.000Z", tanggalSelesai: "2026-11-02T02:00:00.000Z" }),
    ).toBe("30 Oktober 2026 – 2 November 2026");
  });
});

describe("buildEventBudayaWhere", () => {
  it("tanpa param → hanya { isActive: true } (perilaku lama)", () => {
    expect(buildEventBudayaWhere({}, NOW)).toEqual({ ok: true, where: { isActive: true }, tahun: null });
    expect(buildEventBudayaWhere({ kategori: "", tahun: "", bulan: "" }, NOW)).toEqual({
      ok: true,
      where: { isActive: true },
      tahun: null,
    });
  });

  it("filter kategori", () => {
    const r = buildEventBudayaWhere({ kategori: "MUSYAWARAH" }, NOW);
    expect(r.ok && r.where).toEqual({ isActive: true, kategori: "MUSYAWARAH" });
  });

  it("menolak kategori tak dikenal, tahun/bulan tidak valid, dan bulan tanpa tahun", () => {
    expect(buildEventBudayaWhere({ kategori: "OLAHRAGA" }, NOW).ok).toBe(false);
    expect(buildEventBudayaWhere({ tahun: "26" }, NOW).ok).toBe(false);
    expect(buildEventBudayaWhere({ tahun: "abcd" }, NOW).ok).toBe(false);
    expect(buildEventBudayaWhere({ tahun: "2026", bulan: "13" }, NOW).ok).toBe(false);
    expect(buildEventBudayaWhere({ tahun: "2026", bulan: "0" }, NOW).ok).toBe(false);
    expect(buildEventBudayaWhere({ tahun: "2026", bulan: "1.5" }, NOW).ok).toBe(false);
    expect(buildEventBudayaWhere({ bulan: "3" }, NOW)).toEqual({
      ok: false,
      message: "Filter bulan membutuhkan tahun",
    });
  });

  it("filter tahun memakai rentang WITA dan tumpang tindih multi-hari", () => {
    const r = buildEventBudayaWhere({ tahun: "2026" }, NOW);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.tahun).toBe(2026);
    const gte = new Date("2025-12-31T16:00:00.000Z");
    const lt = new Date("2026-12-31T16:00:00.000Z");
    expect(r.where.AND).toEqual([
      { tanggal: { lt } },
      { OR: [{ tanggalSelesai: { gte } }, { tanggalSelesai: null, tanggal: { gte } }] },
    ]);
  });

  it("filter bulan mempersempit rentang ke satu bulan", () => {
    const r = buildEventBudayaWhere({ tahun: "2026", bulan: "10" }, NOW);
    expect(r.ok && r.where.AND?.[0]).toEqual({ tanggal: { lt: new Date("2026-10-31T16:00:00.000Z") } });
  });

  it("mendatang=true hanya yang belum lewat (berdasar tanggalSelesai bila ada)", () => {
    const r = buildEventBudayaWhere({ mendatang: "true" }, NOW);
    const hariIni = new Date("2026-11-05T16:00:00.000Z");
    expect(r.ok && r.where.AND).toEqual([
      { OR: [{ tanggalSelesai: { gte: hariIni } }, { tanggalSelesai: null, tanggal: { gte: hariIni } }] },
    ]);
    const bukan = buildEventBudayaWhere({ mendatang: "false" }, NOW);
    expect(bukan.ok && bukan.where).toEqual({ isActive: true });
  });

  it("kombinasi kategori + tahun + bulan + mendatang", () => {
    const r = buildEventBudayaWhere(
      { kategori: "KEPEMUDAAN", tahun: "2026", bulan: "10", mendatang: "true" },
      NOW,
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.where.kategori).toBe("KEPEMUDAAN");
    expect(r.where.AND).toHaveLength(3);
  });
});

describe("eventBudayaFindMany", () => {
  it("tanpa param: perilaku & bentuk respons lama tidak berubah", async () => {
    prismaMock.eventBudaya.findMany.mockResolvedValue([{ id: "a" }]);
    prismaMock.eventBudaya.count.mockResolvedValue(11);

    const res = await eventBudayaFindMany(ctx({ query: { page: "2", limit: "5" } }));

    expect(prismaMock.eventBudaya.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.eventBudaya.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      skip: 5,
      take: 5,
      orderBy: { tanggal: "asc" },
    });
    expect(prismaMock.eventBudaya.count).toHaveBeenCalledWith({ where: { isActive: true } });
    expect(res).toEqual({
      success: true,
      message: "Berhasil mengambil event budaya",
      data: [{ id: "a" }],
      page: 2,
      limit: 5,
      total: 11,
      totalPages: 3,
    });
    expect(res).not.toHaveProperty("ringkasanBulan");
  });

  it("search lama tetap bekerja bersama filter kategori", async () => {
    await eventBudayaFindMany(ctx({ query: { search: "banjar", kategori: "MUSYAWARAH" } }));
    const { where } = prismaMock.eventBudaya.findMany.mock.calls[0][0];
    expect(where.kategori).toBe("MUSYAWARAH");
    expect(where.OR).toEqual([
      { nama: { contains: "banjar", mode: "insensitive" } },
      { lokasi: { contains: "banjar", mode: "insensitive" } },
    ]);
  });

  it("filter tahun+bulan+kategori diteruskan ke Prisma tetap urut tanggal naik", async () => {
    await eventBudayaFindMany(
      ctx({ query: { kategori: "KEPEMUDAAN", tahun: "2026", bulan: "10" } }),
    );
    const args = prismaMock.eventBudaya.findMany.mock.calls[0][0];
    expect(args.orderBy).toEqual({ tanggal: "asc" });
    expect(args.where.kategori).toBe("KEPEMUDAAN");
    expect(args.where.AND).toHaveLength(2);
  });

  it("menyertakan ringkasanBulan (12 angka) bila tahun diberikan, tanpa N+1", async () => {
    prismaMock.eventBudaya.findMany
      .mockResolvedValueOnce([]) // halaman data
      .mockResolvedValueOnce([
        { tanggal: new Date("2026-10-17T02:00:00.000Z"), tanggalSelesai: new Date("2026-10-18T02:00:00.000Z") },
        { tanggal: new Date("2026-03-19T00:00:00.000Z"), tanggalSelesai: null },
      ]);

    const res = await eventBudayaFindMany(ctx({ query: { tahun: "2026", bulan: "3" } }));

    // data + ringkasan = 2 query findMany tetap, apa pun jumlah baris
    expect(prismaMock.eventBudaya.findMany).toHaveBeenCalledTimes(2);
    const ringkasanArgs = prismaMock.eventBudaya.findMany.mock.calls[1][0];
    expect(ringkasanArgs.select).toEqual({ tanggal: true, tanggalSelesai: true });
    expect(ringkasanArgs.where.AND).toHaveLength(2); // bulan tidak ikut membatasi ringkasan
    expect(res).toHaveProperty("ringkasanBulan");
    const ringkasan = (res as { ringkasanBulan: number[] }).ringkasanBulan;
    expect(ringkasan[2]).toBe(1);
    expect(ringkasan[9]).toBe(1);
  });

  it("filter tidak valid ditolak 400 tanpa menyentuh Prisma", async () => {
    const c = ctx({ query: { kategori: "OLAHRAGA" } });
    const res = await eventBudayaFindMany(c);
    expect(res).toMatchObject({ success: false });
    expect(c.set.status).toBe(400);
    expect(prismaMock.eventBudaya.findMany).not.toHaveBeenCalled();
  });
});

describe("eventBudayaCreate / eventBudayaUpdate", () => {
  it("create menolak kategori tak dikenal (400, tidak menyimpan)", async () => {
    const c = ctx({ body: { ...baseBody, kategori: "OLAHRAGA" } });
    const res = await eventBudayaCreate(c);
    expect(res).toMatchObject({ success: false });
    expect(c.set.status).toBe(400);
    expect(prismaMock.eventBudaya.create).not.toHaveBeenCalled();
  });

  it("create menolak tanggalSelesai < tanggal", async () => {
    const c = ctx({ body: { ...baseBody, tanggalSelesai: "2026-10-01" } });
    const res = await eventBudayaCreate(c);
    expect(res).toMatchObject({ success: false });
    expect(c.set.status).toBe(400);
    expect(prismaMock.eventBudaya.create).not.toHaveBeenCalled();
  });

  it("create tanpa kategori/tanggalSelesai: payload lama tetap valid (DB default BUDAYA)", async () => {
    const res = await eventBudayaCreate(ctx({ body: baseBody }));
    expect(res).toMatchObject({ success: true });
    const { data } = prismaMock.eventBudaya.create.mock.calls[0][0];
    expect(data).toEqual({
      nama: baseBody.nama,
      tanggal: new Date(baseBody.tanggal),
      lokasi: baseBody.lokasi,
      deskripsi: null,
    });
  });

  it("create menyimpan kategori & tanggalSelesai yang valid", async () => {
    await eventBudayaCreate(
      ctx({ body: { ...baseBody, kategori: "KEPEMUDAAN", tanggalSelesai: "2026-10-18" } }),
    );
    const { data } = prismaMock.eventBudaya.create.mock.calls[0][0];
    expect(data.kategori).toBe("KEPEMUDAAN");
    expect(data.tanggalSelesai).toEqual(new Date("2026-10-18"));
  });

  it("update menolak input tidak valid dan menyimpan yang valid", async () => {
    const buruk = ctx({
      params: { id: "e1" },
      body: { ...baseBody, kategori: "OLAHRAGA" },
    });
    expect(await eventBudayaUpdate(buruk)).toMatchObject({ success: false });
    expect(buruk.set.status).toBe(400);
    expect(prismaMock.eventBudaya.update).not.toHaveBeenCalled();

    const terbalik = ctx({ params: { id: "e1" }, body: { ...baseBody, tanggalSelesai: "2026-01-01" } });
    expect(await eventBudayaUpdate(terbalik)).toMatchObject({ success: false });

    await eventBudayaUpdate(
      ctx({ params: { id: "e1" }, body: { ...baseBody, kategori: "MUSYAWARAH", tanggalSelesai: null } }),
    );
    const { data } = prismaMock.eventBudaya.update.mock.calls[0][0];
    expect(data.kategori).toBe("MUSYAWARAH");
    expect(data.tanggalSelesai).toBeNull();
  });
});

describe("kontrak route aditif", () => {
  const post = (body: unknown) =>
    EventBudayaRoutes.handle(
      new Request("http://localhost/eventbudaya/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );

  it("body lama (tanpa field baru) tetap diterima", async () => {
    const res = await post(baseBody);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
  });

  it("body baru dengan kategori & tanggalSelesai (termasuk null) diterima", async () => {
    const a = await post({ ...baseBody, kategori: "MUSYAWARAH", tanggalSelesai: "2026-10-18" });
    expect(a.status).toBe(200);
    const b = await post({ ...baseBody, tanggalSelesai: null });
    expect(b.status).toBe(200);
  });

  it("kategori tak dikenal lewat route → 400 dengan pola error { success:false, message }", async () => {
    const res = await post({ ...baseBody, kategori: "OLAHRAGA" });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ success: false, message: expect.any(String) });
  });
});
