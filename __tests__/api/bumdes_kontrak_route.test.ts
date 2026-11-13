// @vitest-environment node
// Kontrak rute (AI-CONTRACT §10): endpoint profil/unit usaha BUMDes hanya menambah rute baru di bawah /bumdes;
// rute struktur-bumdes dikunci di sini dan, lebih rinci (bentuk respons), di struktur_bumdes_kontrak_route.test.ts.
import { describe, it, expect, vi } from "vitest";
import Elysia from "elysia";

vi.mock("@/lib/prisma", () => ({ default: {} }));

import Bumdes from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes";
import StrukturBumdes from "@/app/api/[[...slugs]]/_lib/ekonomi/struktur-bumdes";

function routesOf(plugin: Elysia<any, any, any, any, any, any, any>): string[] { // eslint-disable-line @typescript-eslint/no-explicit-any -- generik Elysia terlalu panjang untuk ditulis ulang
  const app = new Elysia().use(plugin);
  return app.routes.map((r) => `${r.method} ${r.path}`).sort();
}

describe("kontrak rute struktur-bumdes", () => {
  // Struktur BUMDes pindah ke kode struktur bersama (ADR 2026-11-12-struktur-fleksibel): path lama dipertahankan;
  // `GET|PUT /struktur-organisasi/:id` (tabel lama StrukturBumDes) dan `GET posisi-organisasi/find-many` dihapus
  // karena tidak dipakai konsumen mana pun lagi.
  it("daftar method+path", () => {
    expect(routesOf(StrukturBumdes)).toEqual([
      "DELETE /struktur-organisasi/pegawai/del/:id",
      "DELETE /struktur-organisasi/posisi-organisasi/del/:id",
      "GET /struktur-organisasi/pegawai/:id",
      "GET /struktur-organisasi/pegawai/find-many",
      "GET /struktur-organisasi/posisi-organisasi/:id",
      "GET /struktur-organisasi/posisi-organisasi/find-many-all",
      "POST /struktur-organisasi/pegawai/create",
      "POST /struktur-organisasi/posisi-organisasi/create",
      "PUT /struktur-organisasi/pegawai/:id",
      "PUT /struktur-organisasi/posisi-organisasi/:id",
    ]);
  });
});

describe("kontrak rute BUMDes (baru, aditif)", () => {
  it("profil + galeri foto + unit usaha berada di bawah /bumdes", () => {
    expect(routesOf(Bumdes)).toEqual([
      "DELETE /bumdes/profil/foto/:id",
      "DELETE /bumdes/unit-usaha/del/:id",
      "GET /bumdes/profil/",
      "GET /bumdes/profil/foto/",
      "GET /bumdes/unit-usaha/:id",
      "GET /bumdes/unit-usaha/find-many",
      "POST /bumdes/profil/foto/",
      "POST /bumdes/unit-usaha/create",
      "PUT /bumdes/profil/",
      "PUT /bumdes/profil/foto/:id",
      "PUT /bumdes/profil/foto/urutan",
      "PUT /bumdes/unit-usaha/:id",
    ]);
  });

  it("tidak ada rute BUMDes yang menimpa prefix /struktur-organisasi", () => {
    const bumdes = routesOf(Bumdes);
    expect(bumdes.every((r) => r.split(" ")[1].startsWith("/bumdes/"))).toBe(true);
  });
});
