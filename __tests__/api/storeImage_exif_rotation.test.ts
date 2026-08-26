// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import sharp from "sharp";

// Mock I/O eksternal saja (MinIO + Prisma) — pipeline sharp tetap asli supaya
// bug (dan fix-nya) benar-benar teruji, bukan cuma di-assert lewat mock.
vi.mock("@/lib/minio", () => ({
  default: { putObject: vi.fn().mockResolvedValue(undefined) },
  MINIO_BUCKET: "test-bucket",
}));
vi.mock("@/lib/prisma", () => ({
  default: { fileStorage: { create: vi.fn((args: any) => Promise.resolve(args.data)) } },
}));

import { storeImageAsWebp } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/storeImage";

// Simulasikan foto potret yang diambil kamera HP: piksel mentah disimpan
// landscape (1920x1080, sesuai orientasi sensor) + tag EXIF Orientation=6
// ("rotate 90 CW saat ditampilkan") — persis pola output kamera HP asli.
async function buildPortraitPhotoShotLandscapeBySensor() {
  return sharp({
    create: { width: 1920, height: 1080, channels: 3, background: { r: 255, g: 0, b: 0 } },
  })
    .withMetadata({ orientation: 6 })
    .jpeg()
    .toBuffer();
}

describe("storeImageAsWebp — EXIF orientation dari kamera HP", () => {
  it("meluruskan foto potret (EXIF Orientation=6) alih-alih menyimpan piksel mentah apa adanya", async () => {
    const jpegBuffer = await buildPortraitPhotoShotLandscapeBySensor();
    const file = new File([new Uint8Array(jpegBuffer)], "potret-kamera-hp.jpg", {
      type: "image/jpeg",
    });

    await storeImageAsWebp(file);

    const minio = (await import("@/lib/minio")).default as any;
    const [, , webpBuffer] = minio.putObject.mock.calls[0];
    const metadata = await sharp(webpBuffer).metadata();

    // Setelah auto-orient, hasil harus potret (lebih tinggi dari lebar) —
    // sebelum fix, ini gagal karena sharp menyimpan piksel mentah landscape
    // (1920x1080) apa adanya, mengabaikan EXIF Orientation.
    expect(metadata.width).toBeLessThan(metadata.height!);
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(1920);
  });
});
