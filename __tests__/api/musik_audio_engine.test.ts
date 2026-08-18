// @vitest-environment node
import { describe, it, expect } from "vitest";
import { computeNextIndex, computePrevAction } from "@/app/context/music/musicNavigation";

describe("computeNextIndex", () => {
  it("wrap-around ke index 0 setelah lagu terakhir", () => {
    expect(computeNextIndex(2, 3, false)).toBe(0);
  });

  it("maju satu index saat bukan lagu terakhir", () => {
    expect(computeNextIndex(0, 3, false)).toBe(1);
  });

  it("shuffle memakai RNG yang di-inject", () => {
    const fixedRandom = () => 0.5;
    expect(computeNextIndex(0, 4, true, fixedRandom)).toBe(2);
  });

  it("list kosong mengembalikan -1", () => {
    expect(computeNextIndex(0, 0, false)).toBe(-1);
    expect(computeNextIndex(0, 0, true)).toBe(-1);
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

  it("list kosong mengembalikan index -1", () => {
    expect(computePrevAction(0, 0, 0)).toEqual({ type: "index", index: -1 });
  });
});
