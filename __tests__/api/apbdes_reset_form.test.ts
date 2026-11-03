// @vitest-environment node
// Regresi UX: tombol "Batal" pada Edit APBDes harus mengembalikan SELURUH
// form ke kondisi awal — termasuk array `items`, bukan hanya field top-level.
//
// Bug lama (page.tsx handleReset): item dipertahankan apa adanya
// (`items: [...form.items] // keep existing items`), sehingga penambahan /
// penghapusan / perubahan baris tidak ikut ter-reset saat klik Batal.
//
// Fix: snapshot item awal saat load, lalu buildResetForm() memulihkan item
// dari snapshot sebagai SALINAN INDEPENDEN (mutasi form berikutnya tak boleh
// merembet ke snapshot, dan sebaliknya).
import { describe, it, expect } from "vitest";
import {
  buildResetForm,
  cloneApbdesItems,
  type ApbdesItemForm,
  type ApbdesOriginalData,
} from "@/app/admin/(dashboard)/landing-page/apbdes/[id]/edit/_lib/resetForm";

const item = (over: Partial<ApbdesItemForm> = {}): ApbdesItemForm => ({
  id: "itemA",
  kode: "4.1",
  uraian: "Pendapatan Asli",
  anggaran: 1000,
  level: 2,
  tipe: "pendapatan",
  realisasi: 500,
  selisih: 500,
  persentase: 50,
  ...over,
});

const original = (items: ApbdesItemForm[]): ApbdesOriginalData => ({
  tahun: 2025,
  name: "APBDes 2025",
  deskripsi: "desk",
  jumlah: "1000",
  imageId: "img1",
  fileId: "file1",
  imageUrl: "http://x/img",
  fileUrl: "http://x/file",
  items,
});

describe("buildResetForm — Batal memulihkan seluruh form termasuk items", () => {
  it("mengembalikan field top-level + items sesuai snapshot original", () => {
    const snap = original([item({ id: "a", kode: "4.1" }), item({ id: "b", kode: "5.1" })]);
    const form = buildResetForm(snap);

    expect(form.tahun).toBe(2025);
    expect(form.name).toBe("APBDes 2025");
    expect(form.imageId).toBe("img1");
    expect(form.fileId).toBe("file1");
    expect(form.items).toHaveLength(2);
    expect(form.items.map((i) => i.kode)).toEqual(["4.1", "5.1"]);
  });

  it("item hasil reset adalah SALINAN INDEPENDEN — memutasi form tak mengubah snapshot", () => {
    const snap = original([item({ id: "a", kode: "4.1", anggaran: 1000 })]);
    const form = buildResetForm(snap);

    // Simulasikan user mengedit form setelah reset.
    form.items[0].kode = "4.1-EDITED";
    form.items[0].anggaran = 9999;
    form.items.push(item({ id: "z", kode: "9.9" }));

    // Snapshot original tetap utuh.
    expect(snap.items).toHaveLength(1);
    expect(snap.items[0].kode).toBe("4.1");
    expect(snap.items[0].anggaran).toBe(1000);
  });

  it("memutasi snapshot original tak mengubah form hasil reset (isolasi dua arah)", () => {
    const snap = original([item({ id: "a", kode: "4.1" })]);
    const form = buildResetForm(snap);

    snap.items[0].kode = "MUTATED";

    expect(form.items[0].kode).toBe("4.1");
  });

  it("reset dari daftar item kosong menghasilkan items kosong", () => {
    const form = buildResetForm(original([]));
    expect(form.items).toEqual([]);
  });
});

describe("cloneApbdesItems — salinan dangkal per-item yang independen", () => {
  it("menghasilkan objek baru dengan nilai identik", () => {
    const src = [item({ id: "a" }), item({ id: "b", kode: "5.1" })];
    const cloned = cloneApbdesItems(src);

    expect(cloned).toEqual(src);
    expect(cloned[0]).not.toBe(src[0]); // objek berbeda
    expect(cloned).not.toBe(src); // array berbeda
  });

  it("mutasi hasil clone tidak merembet ke sumber", () => {
    const src = [item({ id: "a", persentase: 50 })];
    const cloned = cloneApbdesItems(src);

    cloned[0].persentase = 100;

    expect(src[0].persentase).toBe(50);
  });
});
