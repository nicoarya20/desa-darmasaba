// @vitest-environment node
// Data seed BUMDes harus berisi struktur jabatan generik (bukan perangkat desa) dan label menu
// harus "BUMDes" dengan href lama tetap utuh (link lama tidak boleh putus).
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import navbarListMenu from "@/con/navbar-list-menu";
import { ekonomiMenu } from "@/app/admin/_com/nav/domains";

type Posisi = { id: string; nama: string; deskripsi: string; hierarki: number; parentId: string | null };

const DATA_DIR = join(process.cwd(), "prisma/data/ekonomi/struktur-organisasi");
const readJson = <T>(file: string): T => JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));

const BUMDES_PATH = "/darmasaba/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes";
const PERANGKAT_DESA = /kepala desa|sekretaris desa|sekdes|perbekel|kaur|kasi\b|kepala dusun|kadus|staf desa|banjar dinas/i;

describe("seed struktur BUMDes", () => {
  const posisi = readJson<Posisi[][]>("posisi-organisasi-bumdes.json").flat();

  it("pegawai BUMDes dikosongkan (nama pengurus nyata diinput admin, bukan di-seed)", () => {
    expect(readJson<unknown[]>("pegawai-bumdes.json")).toEqual([]);
  });

  it("posisi tidak lagi berisi jabatan perangkat desa", () => {
    expect(posisi.length).toBeGreaterThan(0);
    for (const p of posisi) {
      expect(`${p.id} ${p.nama} ${p.deskripsi}`).not.toMatch(PERANGKAT_DESA);
    }
  });

  it("id posisi unik, parentId menunjuk posisi yang ada, dan induk berhierarki lebih tinggi", () => {
    const byId = new Map(posisi.map((p) => [p.id, p]));
    expect(byId.size).toBe(posisi.length);
    for (const p of posisi) {
      if (p.parentId === null) continue;
      const parent = byId.get(p.parentId);
      expect(parent, `parent ${p.parentId} untuk ${p.id}`).toBeDefined();
      expect(parent!.hierarki).toBeLessThan(p.hierarki);
    }
  });

  it("ada tepat satu posisi puncak (Direktur) sebagai akar bagan", () => {
    const roots = posisi.filter((p) => p.parentId === null);
    expect(roots.map((p) => p.nama)).toEqual(["Direktur"]);
  });
});

describe("navigasi BUMDes", () => {
  const ekonomi = navbarListMenu.find((m) => m.name === "Ekonomi");
  const item = ekonomi?.children?.find((c) => c.href === BUMDES_PATH);

  it("navbar publik: label 'BUMDes' dengan href lama tidak berubah", () => {
    expect(item?.name).toBe("BUMDes");
  });

  it("label lama tidak tersisa di menu Ekonomi", () => {
    const names = (ekonomi?.children ?? []).map((c) => c.name);
    expect(names.some((n) => /Struktur Organisasi dan SK/i.test(n))).toBe(false);
  });

  it("menu admin: entri BUMDes mengarah ke halaman admin BUMDes", () => {
    const admin = ekonomiMenu.children?.find((c) => c.id === "Ekonomi_3");
    expect(admin?.name).toBe("BUMDes");
    expect(admin?.path.startsWith("/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/")).toBe(true);
  });
});
