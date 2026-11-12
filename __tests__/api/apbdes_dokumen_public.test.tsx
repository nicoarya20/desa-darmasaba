// @vitest-environment node
// Panel dokumen APBDes publik: pengelompokan per folder ("Umum" dulu, folder sesuai urutan, kelompok
// kosong disembunyikan), fallback berkas lama `file`, dan render SSR (judul folder + tombol unduh).
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import {
  APBDES_DOKUMEN_JUDUL_DEFAULT,
  apbdesDokumenGroups,
  showGroupTitles,
} from "@/lib/apbdes-dokumen-groups";
import { ApbdesDocument } from "@/app/(public)/_com/main-page/apbdes/components/ApbdesDocument";
import { APBDES_TEXT } from "@/app/(public)/_com/main-page/apbdes/apbdes.text";
import type { APBDes, APBDesDokumen } from "@/app/(public)/_com/main-page/apbdes/types/apbdes";

const dok = (id: string, judul: string): APBDesDokumen => ({
  id,
  judul,
  file: { id: `f-${id}`, link: `https://cdn.test/${id}.pdf`, mimeType: "application/pdf" },
});
const base: APBDes = { id: "a1", tahun: 2025, jumlah: 0, name: "APBDes 2025" };
const lengkap: APBDes = {
  ...base,
  folders: [
    { id: "fo1", nama: "Semester I", dokumen: [dok("d1", "Laporan Semester I")] },
    { id: "fo2", nama: "Kosong", dokumen: [] },
    { id: "fo3", nama: "Perdes", dokumen: [dok("d2", "Perdes APBDes"), dok("d3", "Lampiran Perdes")] },
  ],
  dokumenUmum: [dok("d4", "Ringkasan APBDes")],
  // berkas lama tetap ada di kolom fileId, tapi daftar dokumen yang menang
  file: { id: "lama", link: "https://cdn.test/lama.pdf" },
};

const render = (apbdes: APBDes) =>
  renderToStaticMarkup(
    <MantineProvider>
      <ApbdesDocument apbdes={apbdes} />
    </MantineProvider>,
  );

describe("apbdesDokumenGroups", () => {
  it("Umum dulu, lalu folder sesuai urutan API; folder kosong disembunyikan", () => {
    const groups = apbdesDokumenGroups(lengkap);
    expect(groups.map((g) => g.nama)).toEqual(["Umum", "Semester I", "Perdes"]);
    expect(groups[2].dokumen.map((d) => d.judul)).toEqual(["Perdes APBDes", "Lampiran Perdes"]);
    expect(groups[0].dokumen[0]).toEqual({
      id: "d4",
      judul: "Ringkasan APBDes",
      link: "https://cdn.test/d4.pdf",
      mimeType: "application/pdf",
    });
    expect(showGroupTitles(groups)).toBe(true);
  });

  it("daftar dokumen kosong tapi berkas lama ada → satu dokumen di Umum berjudul nama APBDes", () => {
    const groups = apbdesDokumenGroups({ ...base, folders: [], dokumenUmum: [], file: { id: "lama", link: "https://cdn.test/lama.pdf" } });
    expect(groups).toEqual([
      { key: "umum", nama: "Umum", dokumen: [{ id: "lama", judul: "APBDes 2025", link: "https://cdn.test/lama.pdf", mimeType: null }] },
    ]);
    expect(showGroupTitles(groups)).toBe(false);
  });

  it("fallback tanpa nama APBDes memakai judul default; tanpa dokumen & berkas → kosong", () => {
    const tanpaNama = apbdesDokumenGroups({ name: null, file: { id: "lama", link: "https://cdn.test/lama.pdf" } });
    expect(tanpaNama[0].dokumen[0].judul).toBe(APBDES_DOKUMEN_JUDUL_DEFAULT);
    expect(apbdesDokumenGroups({ ...base, folders: [{ id: "fo1", nama: "A", dokumen: [] }], file: null })).toEqual([]);
  });
});

describe("ApbdesDocument (SSR)", () => {
  it("merender judul folder, judul dokumen, dan tombol unduh tiap dokumen", () => {
    const html = render(lengkap);
    expect(html).toContain(APBDES_TEXT.documentTitle);
    expect(html).toContain("Semester I");
    expect(html).toContain("Perdes");
    expect(html).toContain("Umum");
    expect(html).not.toContain("Kosong");
    expect(html).toContain('href="https://cdn.test/d2.pdf"');
    expect(html).toContain(`aria-label="${APBDES_TEXT.downloadLabel("Lampiran Perdes")}"`);
    expect(html.split(APBDES_TEXT.download).length - 1).toBeGreaterThanOrEqual(4);
    expect(html).not.toContain("lama.pdf");
    // Umum sebelum folder pertama
    expect(html.indexOf("Ringkasan APBDes")).toBeLessThan(html.indexOf("Semester I"));
  });

  it("hanya Umum → tanpa judul kelompok", () => {
    const html = render({ ...base, dokumenUmum: [dok("d1", "Perdes 2025")] });
    expect(html).toContain("Perdes 2025");
    expect(html).not.toContain("<h4");
  });

  it("tidak ada dokumen maupun berkas lama → tidak merender apa pun", () => {
    const html = render({ ...base, folders: [], dokumenUmum: [], file: null });
    expect(html).not.toContain(APBDES_TEXT.documentTitle);
    expect(html).not.toContain("<a");
    expect(html).not.toContain("<ul");
  });
});
