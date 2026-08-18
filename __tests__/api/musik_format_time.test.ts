// @vitest-environment node
import { describe, it, expect } from "vitest";
import { formatTime } from "@/app/context/music/format";

describe("formatTime", () => {
  it("format detik biasa jadi m:ss", () => {
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(5)).toBe("0:05");
  });

  it("format 0 detik", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("fallback ke 0:00 untuk NaN", () => {
    expect(formatTime(NaN)).toBe("0:00");
  });

  it("fallback ke 0:00 untuk nilai negatif", () => {
    expect(formatTime(-10)).toBe("0:00");
  });

  it("format lebih dari 1 jam dengan segmen jam", () => {
    expect(formatTime(3665)).toBe("1:01:05");
  });
});
