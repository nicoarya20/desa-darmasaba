// @vitest-environment node
// Input titik peta admin: tempel koordinat/URL Google Maps, cari alamat (GET /api/geocode/search), alamat dari titik
// (GET /api/geocode/reverse), validasi lintang/bujur, isi otomatis Lokasi.
import { describe, expect, it, vi } from "vitest";
import { parseKoordinatTeks } from "@/lib/konten-bersama/lokasi.logic";
import {
  bolehIsiLokasiOtomatis,
  cariAlamatTitik,
  cariTitikAlamat,
  cekSumbuTeks,
  koordinatDariTeks,
  kueriCariValid,
  petakanResponsAlamat,
  petakanResponsCari,
  PESAN_CARI_GAGAL,
  PESAN_TERLALU_SERING,
  PESAN_TIDAK_DITEMUKAN,
  saranNamaTampil,
} from "@/app/admin/(dashboard)/_com/konten-bersama/titik-peta.logic";

describe("parseKoordinatTeks", () => {
  it("menerima pasangan lat, lng dengan koma/spasi", () => {
    expect(parseKoordinatTeks("-8.571234, 115.192345")).toEqual({ lat: -8.571234, lng: 115.192345 });
    expect(parseKoordinatTeks("  -8.571234,115.192345  ")).toEqual({ lat: -8.571234, lng: 115.192345 });
    expect(parseKoordinatTeks("-8.57 115.19")).toEqual({ lat: -8.57, lng: 115.19 });
    expect(parseKoordinatTeks("-8.57\t115.19")).toEqual({ lat: -8.57, lng: 115.19 });
    expect(parseKoordinatTeks("-8, 115")).toEqual({ lat: -8, lng: 115 });
  });

  it("menolak koma desimal yang ambigu", () => {
    expect(parseKoordinatTeks("-8,57; 115,19")).toBeNull();
    expect(parseKoordinatTeks("-8,57, 115,19")).toBeNull();
    expect(parseKoordinatTeks("-8,57 115,19")).toBeNull();
    expect(parseKoordinatTeks("-8,57")).toBeNull();
  });

  it("menolak di luar rentang", () => {
    expect(parseKoordinatTeks("-91, 115")).toBeNull();
    expect(parseKoordinatTeks("-8.5, 181")).toBeNull();
    expect(parseKoordinatTeks("115.19, -8.57")).toBeNull();
  });

  it("membaca URL Google Maps: !3d!4d (diutamakan), q=/query=, @", () => {
    expect(
      parseKoordinatTeks(
        "https://www.google.com/maps/place/Balai+Desa/@-8.5700000,115.1900000,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d-8.5712345!4d115.1923456",
      ),
    ).toEqual({ lat: -8.5712345, lng: 115.1923456 });
    expect(parseKoordinatTeks("https://www.google.com/maps/@-8.5712,115.1923,15z")).toEqual({ lat: -8.5712, lng: 115.1923 });
    expect(parseKoordinatTeks("https://maps.google.com/?q=-8.5712,115.1923")).toEqual({ lat: -8.5712, lng: 115.1923 });
    expect(parseKoordinatTeks("https://www.google.com/maps/search/?api=1&query=-8.5712%2C115.1923")).toEqual({ lat: -8.5712, lng: 115.1923 });
  });

  it("URL tanpa koordinat, bukan Google, atau sampah → null", () => {
    expect(parseKoordinatTeks("https://maps.app.goo.gl/AbCdEf123")).toBeNull();
    expect(parseKoordinatTeks("https://maps.google.com/?q=Balai+Desa+Darmasaba")).toBeNull();
    expect(parseKoordinatTeks("https://contoh.com/@-8.57,115.19")).toBeNull();
    expect(parseKoordinatTeks("")).toBeNull();
    expect(parseKoordinatTeks("-8.57")).toBeNull();
    expect(parseKoordinatTeks("abc, def")).toBeNull();
    expect(parseKoordinatTeks("-8.57, 115.19, 3")).toBeNull();
  });
});

describe("kueriCariValid", () => {
  it("3..200 karakter setelah trim", () => {
    expect(kueriCariValid("  ab ")).toBe(false);
    expect(kueriCariValid("abc")).toBe(true);
    expect(kueriCariValid("a".repeat(200))).toBe(true);
    expect(kueriCariValid("a".repeat(201))).toBe(false);
  });
});

describe("petakanResponsCari", () => {
  const data = [
    { lat: -8.57, lng: 115.19, label: "Balai Desa Darmasaba" },
    { lat: -8.58, lng: 115.2, label: "Pura Desa" },
  ];

  it("200 sukses → hasil, entri tidak sah dibuang", () => {
    expect(petakanResponsCari(200, { success: true, data })).toEqual({ ok: true, hasil: data });
    expect(
      petakanResponsCari(200, { success: true, data: [...data, { lat: 99, lng: 0, label: "x" }, { lat: 1, lng: 1 }, null] }),
    ).toEqual({ ok: true, hasil: data });
  });

  it("daftar kosong atau berisi entri tidak sah semua → tidak ditemukan + kosong", () => {
    const kosong = { ok: false, pesan: PESAN_TIDAK_DITEMUKAN, kosong: true };
    expect(petakanResponsCari(200, { success: true, data: [] })).toEqual(kosong);
    expect(petakanResponsCari(200, { success: true, data: [{ lat: 99, lng: 0, label: "x" }, { lat: 1, lng: 1 }, null] })).toEqual(kosong);
  });

  it("pesan tidak ditemukan/gagal memberi petunjuk tempel koordinat ke kolom Lintang", () => {
    expect(PESAN_TIDAK_DITEMUKAN).toMatch(/OpenStreetMap/);
    expect(PESAN_TIDAK_DITEMUKAN).toMatch(/tempel koordinat\/link Google Maps ke kolom Lintang/);
    expect(PESAN_CARI_GAGAL).toMatch(/tempel koordinat\/link Google Maps ke kolom Lintang/);
  });

  it("429 → terlalu sering; 400/401/403/502 → message server; tanpa message → pesan umum (semua tanpa kosong)", () => {
    expect(petakanResponsCari(429, { success: false, message: "Rate limit" })).toEqual({ ok: false, pesan: PESAN_TERLALU_SERING });
    expect(petakanResponsCari(502, { success: false, message: "Layanan peta tidak merespons" })).toEqual({
      ok: false,
      pesan: "Layanan peta tidak merespons",
    });
    expect(petakanResponsCari(403, { success: false, message: "Forbidden" })).toEqual({ ok: false, pesan: "Forbidden" });
    expect(petakanResponsCari(500, null)).toEqual({ ok: false, pesan: PESAN_CARI_GAGAL });
    expect(petakanResponsCari(200, { success: false })).toEqual({ ok: false, pesan: PESAN_CARI_GAGAL });
  });
});

describe("cariTitikAlamat", () => {
  it("memanggil endpoint dengan kueri ter-encode dan memetakan respons", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: [{ lat: -8.57, lng: 115.19, label: "A" }] }), { status: 200 }),
    );
    await expect(cariTitikAlamat("  Jl. Raya & No 1 ", fetcher)).resolves.toEqual({
      ok: true,
      hasil: [{ lat: -8.57, lng: 115.19, label: "A" }],
    });
    expect(fetcher).toHaveBeenCalledWith("/api/geocode/search?q=Jl.%20Raya%20%26%20No%201", { credentials: "same-origin" });
  });

  it("body bukan JSON → pesan umum; 429 → terlalu sering", async () => {
    const html = vi.fn().mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 502 }));
    await expect(cariTitikAlamat("abc", html)).resolves.toEqual({ ok: false, pesan: PESAN_CARI_GAGAL });
    const limit = vi.fn().mockResolvedValue(new Response("{}", { status: 429, headers: { "Retry-After": "30" } }));
    await expect(cariTitikAlamat("abc", limit)).resolves.toEqual({ ok: false, pesan: PESAN_TERLALU_SERING });
  });

  it("200 daftar kosong → kosong: true", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: [] }), { status: 200 }));
    await expect(cariTitikAlamat("Kantor Desa Darmasaba", fetcher)).resolves.toEqual({
      ok: false,
      pesan: PESAN_TIDAK_DITEMUKAN,
      kosong: true,
    });
  });

  it("galat jaringan → pesan umum (dicatat ke console)", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fetcher = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(cariTitikAlamat("abc", fetcher)).resolves.toEqual({ ok: false, pesan: PESAN_CARI_GAGAL });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});

describe("cekSumbuTeks & koordinatDariTeks", () => {
  it("kosong atau '-' saat mengetik → tanpa nilai & tanpa error", () => {
    expect(cekSumbuTeks("", "lintang")).toEqual({ nilai: null, error: null });
    expect(cekSumbuTeks("-", "bujur")).toEqual({ nilai: null, error: null });
  });

  it("angka sah (termasuk titik di akhir saat mengetik)", () => {
    expect(cekSumbuTeks("-8.5712", "lintang")).toEqual({ nilai: -8.5712, error: null });
    expect(cekSumbuTeks("-8.", "lintang")).toEqual({ nilai: -8, error: null });
    expect(cekSumbuTeks("115", "bujur")).toEqual({ nilai: 115, error: null });
  });

  it("di luar rentang, koma desimal, link tanpa koordinat → error", () => {
    expect(cekSumbuTeks("-91", "lintang").error).toBe("Lintang harus antara -90 dan 90");
    expect(cekSumbuTeks("181", "bujur").error).toBe("Bujur harus antara -180 dan 180");
    expect(cekSumbuTeks("-8,57", "lintang").error).toMatch(/titik desimal/);
    expect(cekSumbuTeks("https://maps.app.goo.gl/x", "lintang").error).toMatch(/tidak memuat koordinat/);
  });

  it("koordinatDariTeks: string form → Koordinat bila keduanya sah", () => {
    expect(koordinatDariTeks("-8.57", "115.19")).toEqual({ lat: -8.57, lng: 115.19 });
    expect(koordinatDariTeks("", "")).toBeNull();
    expect(koordinatDariTeks("-8.57", "")).toBeNull();
    expect(koordinatDariTeks("abc", "115")).toBeNull();
  });
});

describe("petakanResponsAlamat", () => {
  it("200 dengan/tanpa nama → alamat (+ nama), teks dirapikan", () => {
    expect(petakanResponsAlamat(200, { success: true, data: { alamat: " Jl. Raya Darmasaba ", nama: " Balai Desa " } })).toEqual({
      ok: true,
      alamat: "Jl. Raya Darmasaba",
      nama: "Balai Desa",
    });
    expect(petakanResponsAlamat(200, { success: true, data: { alamat: "Jl. Raya Darmasaba", nama: null } })).toEqual({
      ok: true,
      alamat: "Jl. Raya Darmasaba",
      nama: null,
    });
    expect(petakanResponsAlamat(200, { success: true, data: { alamat: "Jl. A", nama: "  " } })).toEqual({ ok: true, alamat: "Jl. A", nama: null });
  });

  it("data null, alamat kosong, 429, 502, body bukan objek → { ok: false }", () => {
    expect(petakanResponsAlamat(200, { success: true, data: null })).toEqual({ ok: false });
    expect(petakanResponsAlamat(200, { success: true, data: { alamat: " ", nama: "X" } })).toEqual({ ok: false });
    expect(petakanResponsAlamat(429, { success: false, message: "Terlalu sering" })).toEqual({ ok: false });
    expect(petakanResponsAlamat(502, { success: false, message: "Layanan peta tidak merespons" })).toEqual({ ok: false });
    expect(petakanResponsAlamat(200, null)).toEqual({ ok: false });
    expect(petakanResponsAlamat(200, { success: false, data: { alamat: "Jl. A", nama: null } })).toEqual({ ok: false });
  });
});

describe("cariAlamatTitik", () => {
  it("memanggil endpoint reverse dengan lat/lng dan memetakan respons", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { alamat: "Jl. A", nama: "Pura Desa" } }), { status: 200 }),
    );
    await expect(cariAlamatTitik({ lat: -8.5712, lng: 115.1923 }, fetcher)).resolves.toEqual({ ok: true, alamat: "Jl. A", nama: "Pura Desa" });
    expect(fetcher).toHaveBeenCalledWith("/api/geocode/reverse?lat=-8.5712&lng=115.1923", { credentials: "same-origin" });
  });

  it("body bukan JSON, 429, galat jaringan → { ok: false } (hanya console.warn)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const html = vi.fn().mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 502 }));
    await expect(cariAlamatTitik({ lat: -8.57, lng: 115.19 }, html)).resolves.toEqual({ ok: false });
    const limit = vi.fn().mockResolvedValue(new Response("{}", { status: 429, headers: { "Retry-After": "30" } }));
    await expect(cariAlamatTitik({ lat: -8.57, lng: 115.19 }, limit)).resolves.toEqual({ ok: false });
    const putus = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(cariAlamatTitik({ lat: -8.57, lng: 115.19 }, putus)).resolves.toEqual({ ok: false });
    expect(warn).toHaveBeenCalledTimes(3);
    warn.mockRestore();
  });
});

describe("bolehIsiLokasiOtomatis", () => {
  it("kosong → boleh", () => {
    expect(bolehIsiLokasiOtomatis("", null)).toBe(true);
    expect(bolehIsiLokasiOtomatis("   ", "Jl. A")).toBe(true);
  });

  it("masih sama dengan isian otomatis terakhir → boleh; sudah diubah admin → tidak", () => {
    expect(bolehIsiLokasiOtomatis("Jl. A", "Jl. A")).toBe(true);
    expect(bolehIsiLokasiOtomatis("Jl. A No. 5", "Jl. A")).toBe(false);
  });

  it("terisi tanpa isian otomatis di sesi ini (mis. dari DB saat edit) → tidak", () => {
    expect(bolehIsiLokasiOtomatis("Jl. Raya Darmasaba No. 1", null)).toBe(false);
  });
});

describe("saranNamaTampil", () => {
  it("tampil bila ada dan beda dengan Nama", () => {
    expect(saranNamaTampil("Balai Desa Darmasaba", "")).toBe("Balai Desa Darmasaba");
    expect(saranNamaTampil("Balai Desa Darmasaba", "Pos Kamling")).toBe("Balai Desa Darmasaba");
  });

  it("tanpa saran atau sudah sama (abaikan huruf besar/kecil & spasi) → null", () => {
    expect(saranNamaTampil(null, "")).toBeNull();
    expect(saranNamaTampil("  ", "")).toBeNull();
    expect(saranNamaTampil("Balai Desa", " balai desa ")).toBeNull();
  });
});
