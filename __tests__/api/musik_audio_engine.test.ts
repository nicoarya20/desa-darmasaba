// @vitest-environment node
// Navigasi next/prev memakai indeks pada urutan putar (playOrder). Acak tidak lagi berupa indeks
// random di sini: urutan acak dibangun sekali di musicQueue.ts (diuji di musik_queue_logic.test.ts).
import { describe, it, expect } from "vitest";
import { computeNextIndex, computePrevAction } from "@/app/context/music/musicNavigation";

describe("computeNextIndex", () => {
  it("wrap-around ke index 0 setelah lagu terakhir", () => {
    expect(computeNextIndex(2, 3)).toBe(0);
  });

  it("maju satu index saat bukan lagu terakhir", () => {
    expect(computeNextIndex(0, 3)).toBe(1);
  });

  it("belum ada lagu (index -1) mulai dari index 0", () => {
    expect(computeNextIndex(-1, 3)).toBe(0);
  });

  it("melewati lagu tanpa audio, termasuk saat melingkar", () => {
    const playable = [true, false, false, true];
    expect(computeNextIndex(0, 4, (i) => playable[i])).toBe(3);
    expect(computeNextIndex(3, 4, (i) => playable[i])).toBe(0);
  });

  it("hanya lagu saat ini yang punya audio → kembali ke dirinya sendiri", () => {
    expect(computeNextIndex(1, 3, (i) => i === 1)).toBe(1);
  });

  it("semua lagu tanpa audio → -1 (tidak berputar tanpa akhir)", () => {
    expect(computeNextIndex(0, 3, () => false)).toBe(-1);
    expect(computeNextIndex(-1, 3, () => false)).toBe(-1);
  });

  it("list kosong mengembalikan -1", () => {
    expect(computeNextIndex(0, 0)).toBe(-1);
    expect(computeNextIndex(-1, 0)).toBe(-1);
  });
});

describe("computePrevAction", () => {
  it("restart lagu bila currentTime > 3 detik", () => {
    expect(computePrevAction(1, 3, 5)).toEqual({ type: "restart" });
  });

  it("mundur satu index bila currentTime <= 3 detik", () => {
    expect(computePrevAction(1, 3, 2)).toEqual({ type: "index", index: 0 });
  });

  it("wrap ke index terakhir dari lagu pertama", () => {
    expect(computePrevAction(0, 3, 0)).toEqual({ type: "index", index: 2 });
  });

  it("belum ada lagu (index -1) mundur ke index terakhir", () => {
    expect(computePrevAction(-1, 3, 0)).toEqual({ type: "index", index: 2 });
  });

  it("melewati lagu tanpa audio saat mundur", () => {
    const playable = [true, false, false, true];
    expect(computePrevAction(3, 4, 0, (i) => playable[i])).toEqual({ type: "index", index: 0 });
    expect(computePrevAction(0, 4, 0, (i) => playable[i])).toEqual({ type: "index", index: 3 });
  });

  it("semua lagu tanpa audio → index -1", () => {
    expect(computePrevAction(1, 3, 0, () => false)).toEqual({ type: "index", index: -1 });
  });

  it("list kosong mengembalikan index -1", () => {
    expect(computePrevAction(0, 0, 0)).toEqual({ type: "index", index: -1 });
  });
});
