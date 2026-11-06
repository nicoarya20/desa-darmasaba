// @vitest-environment node
// Aturan waktu Agenda & Kalender Desa (zona WITA): batas tahun/bulan, status,
// ringkasan per bulan, dan format rentang tanggal.
import { describe, expect, it } from "vitest";
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
