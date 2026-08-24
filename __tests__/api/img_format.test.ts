// @vitest-environment node
import { describe, it, expect } from "vitest";
import { pickImageFormat } from "@/app/api/[[...slugs]]/_lib/img.format";

describe("pickImageFormat", () => {
  it("should not transcode when client accepts webp and file is webp", () => {
    const r = pickImageFormat(".webp", "image/webp,image/apng,*/*;q=0.8");
    expect(r.transcodeToJpeg).toBe(false);
    expect(r.contentType).toBeUndefined();
  });

  it("should transcode when client sends */* (no explicit webp) and file is webp", () => {
    const r = pickImageFormat(".webp", "*/*");
    expect(r.transcodeToJpeg).toBe(true);
    expect(r.contentType).toBe("image/jpeg");
  });

  it("should transcode when Accept is undefined (old Safari without Accept header)", () => {
    const r = pickImageFormat(".webp", undefined);
    expect(r.transcodeToJpeg).toBe(true);
    expect(r.contentType).toBe("image/jpeg");
  });

  it("should not transcode legacy .jpg files regardless of Accept", () => {
    const r = pickImageFormat(".jpg", "*/*");
    expect(r.transcodeToJpeg).toBe(false);
    expect(r.contentType).toBeUndefined();
  });

  it("should not transcode .png even when client accepts webp", () => {
    const r = pickImageFormat(".png", "image/webp");
    expect(r.transcodeToJpeg).toBe(false);
    expect(r.contentType).toBeUndefined();
  });
});
