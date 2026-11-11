// @vitest-environment node
//
// Environment jsdom di project ini sedang bermasalah (lihat
// fileStorage_range.test.ts) — jadi HTMLImageElement/document di-shim manual
// di sini, bukan pakai jsdom asli. handleImageLoadError/attachImageErrorRetry
// hanya menyentuh `event.target`, `dataset`, `src`, dan `document.add/removeEventListener`,
// jadi shim minimal ini cukup untuk menguji logikanya secara nyata.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleImageLoadError,
  attachImageErrorRetry,
  MAX_IMAGE_RETRIES,
  IMAGE_RETRY_DELAYS_MS,
} from "@/app/(public)/_com/imageErrorRetry";

class FakeHTMLImageElement {
  src = "";
  dataset: Record<string, string> = {};
}

// `as any` di seluruh file ini murni untuk monkey-patch globalThis.HTMLImageElement
// & globalThis.document di environment node (bukan jsdom asli) — lib.dom.d.ts
// mendeklarasikan keduanya sebagai readonly/tipe browser asli sehingga assignment
// langsung tidak lolos type-check. Tidak ada alternatif tanpa ganti ke jsdom, yang
// saat ini bermasalah (lihat komentar di atas & fileStorage_range.test.ts).
const originalHTMLImageElement = (globalThis as any).HTMLImageElement;
const originalDocument = (globalThis as any).document;

beforeEach(() => {
  (globalThis as any).HTMLImageElement = FakeHTMLImageElement;
});

afterEach(() => {
  (globalThis as any).HTMLImageElement = originalHTMLImageElement;
  (globalThis as any).document = originalDocument;
});

function makeErrorEvent(target: unknown): Event {
  return { target } as unknown as Event;
}

describe("handleImageLoadError", () => {
  it("mengabaikan event yang target-nya bukan HTMLImageElement", () => {
    const scheduleRetry = vi.fn();
    handleImageLoadError(makeErrorEvent({ tagName: "DIV" }), scheduleRetry);
    expect(scheduleRetry).not.toHaveBeenCalled();
  });

  // isWebpSupported: () => true dipaksa eksplisit di test-test retry murni ini
  // supaya tidak nyasar ke cabang fallback WebP (lihat describe terpisah di
  // bawah) — default-nya supportsWebp() asli, yang di environment node test
  // ini (tanpa document) bakal gagal-diam jadi `false` dan salah memicu
  // cabang WebP karena src-nya kebetulan berekstensi .webp.
  it("menjadwalkan retry pertama dengan delay sesuai IMAGE_RETRY_DELAYS_MS[0] dan increment dataset.retryAttempt", () => {
    const img = new FakeHTMLImageElement();
    img.src = "https://example.com/api/img/foo-mobile.webp";
    const scheduleRetry = vi.fn();

    handleImageLoadError(makeErrorEvent(img), scheduleRetry, () => true);

    expect(img.dataset.retryAttempt).toBe("1");
    expect(scheduleRetry).toHaveBeenCalledTimes(1);
    expect(scheduleRetry).toHaveBeenCalledWith(expect.any(Function), IMAGE_RETRY_DELAYS_MS[0]);
  });

  it("callback retry me-reload src yang sama dengan query param _retry ditambahkan", () => {
    const img = new FakeHTMLImageElement();
    img.src = "https://example.com/api/img/foo-mobile.webp";
    let capturedRetryFn: (() => void) | null = null;
    const scheduleRetry = (fn: () => void) => {
      capturedRetryFn = fn;
    };

    handleImageLoadError(makeErrorEvent(img), scheduleRetry, () => true);
    expect(capturedRetryFn).not.toBeNull();
    capturedRetryFn!();

    const url = new URL(img.src);
    expect(url.origin + url.pathname).toBe("https://example.com/api/img/foo-mobile.webp");
    expect(url.searchParams.get("_retry")).toBe("1");
  });

  it("delay retry kedua & ketiga mengikuti urutan IMAGE_RETRY_DELAYS_MS", () => {
    const img = new FakeHTMLImageElement();
    img.src = "https://example.com/api/img/foo-mobile.webp";
    img.dataset.retryAttempt = "1";
    const scheduleRetry = vi.fn();

    handleImageLoadError(makeErrorEvent(img), scheduleRetry, () => true);

    expect(img.dataset.retryAttempt).toBe("2");
    expect(scheduleRetry).toHaveBeenCalledWith(expect.any(Function), IMAGE_RETRY_DELAYS_MS[1]);
  });

  it("berhenti retry setelah mencapai MAX_IMAGE_RETRIES", () => {
    const img = new FakeHTMLImageElement();
    img.src = "https://example.com/api/img/foo-mobile.webp";
    img.dataset.retryAttempt = String(MAX_IMAGE_RETRIES);
    const scheduleRetry = vi.fn();

    handleImageLoadError(makeErrorEvent(img), scheduleRetry, () => true);

    expect(scheduleRetry).not.toHaveBeenCalled();
    expect(img.dataset.retryAttempt).toBe(String(MAX_IMAGE_RETRIES));
  });

  it("tidak retry gambar fallback no-image.jpg (kegagalan asli, bukan yang dimitigasi)", () => {
    const img = new FakeHTMLImageElement();
    img.src = "https://example.com/no-image.jpg";
    const scheduleRetry = vi.fn();

    handleImageLoadError(makeErrorEvent(img), scheduleRetry);

    expect(scheduleRetry).not.toHaveBeenCalled();
    expect(img.dataset.retryAttempt).toBeUndefined();
  });

  it("browser tanpa dukungan WebP: langsung swap src ke ?format=jpeg tanpa delay, tidak masuk hitungan retryAttempt", () => {
    const img = new FakeHTMLImageElement();
    img.src = "https://example.com/api/img/foo-mobile.webp";
    const scheduleRetry = vi.fn();
    const isWebpSupported = () => false;

    handleImageLoadError(makeErrorEvent(img), scheduleRetry, isWebpSupported);

    expect(scheduleRetry).not.toHaveBeenCalled();
    expect(img.dataset.retryAttempt).toBeUndefined();
    expect(img.dataset.webpFallbackApplied).toBe("1");

    const url = new URL(img.src);
    expect(url.origin + url.pathname).toBe("https://example.com/api/img/foo-mobile.webp");
    expect(url.searchParams.get("format")).toBe("jpeg");
  });

  it("fallback WebP hanya dipicu sekali per gambar — error kedua lanjut ke jalur retry normal", () => {
    const img = new FakeHTMLImageElement();
    img.src = "https://example.com/api/img/foo-mobile.webp?format=jpeg";
    img.dataset.webpFallbackApplied = "1";
    const scheduleRetry = vi.fn();
    const isWebpSupported = () => false;

    handleImageLoadError(makeErrorEvent(img), scheduleRetry, isWebpSupported);

    expect(scheduleRetry).toHaveBeenCalledTimes(1);
    expect(scheduleRetry).toHaveBeenCalledWith(expect.any(Function), IMAGE_RETRY_DELAYS_MS[0]);
  });

  it("URL bukan .webp tidak terpengaruh fallback WebP meski browser tidak mendukung WebP", () => {
    const img = new FakeHTMLImageElement();
    img.src = "https://example.com/api/img/foo-mobile.jpg";
    const scheduleRetry = vi.fn();
    const isWebpSupported = () => false;

    handleImageLoadError(makeErrorEvent(img), scheduleRetry, isWebpSupported);

    expect(img.dataset.webpFallbackApplied).toBeUndefined();
    expect(scheduleRetry).toHaveBeenCalledWith(expect.any(Function), IMAGE_RETRY_DELAYS_MS[0]);
  });

  it("browser dengan dukungan WebP tidak terpengaruh — langsung lanjut ke jalur retry normal", () => {
    const img = new FakeHTMLImageElement();
    img.src = "https://example.com/api/img/foo-mobile.webp";
    const scheduleRetry = vi.fn();
    const isWebpSupported = () => true;

    handleImageLoadError(makeErrorEvent(img), scheduleRetry, isWebpSupported);

    expect(img.dataset.webpFallbackApplied).toBeUndefined();
    expect(scheduleRetry).toHaveBeenCalledWith(expect.any(Function), IMAGE_RETRY_DELAYS_MS[0]);
  });
});

describe("attachImageErrorRetry", () => {
  it("mendaftarkan capture-phase listener 'error' di document dan bisa di-unregister", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    (globalThis as any).document = { addEventListener, removeEventListener };

    const detach = attachImageErrorRetry();
    expect(addEventListener).toHaveBeenCalledWith("error", handleImageLoadError, true);

    detach();
    expect(removeEventListener).toHaveBeenCalledWith("error", handleImageLoadError, true);
  });
});
