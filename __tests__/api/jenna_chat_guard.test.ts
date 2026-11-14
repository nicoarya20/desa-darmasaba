// @vitest-environment node
// Penyamaran PII (pesan pengunjung) dan output guard (tautan allowlist, HTML, PII kecuali kontak publik).
import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn(), unstable_cache: <T,>(fn: T) => fn }));
vi.mock("@/lib/prisma", () => ({ default: {} }));

import { createDeltaGuard, DELTA_FLUSH_CHARS, guardOutput, MAX_SOURCES } from "@/lib/jenna/chat/output-guard";
import { collectPiiValues, maskPii, PII_MASKS } from "@/lib/jenna/pii";

describe("maskPii", () => {
  it.each([
    ["NIK saya 3171012345678901 ya", "NIK saya [NIK disamarkan] ya"],
    ["KK 5103 0412 3456 0001.", "KK [NIK disamarkan]."],
    ["nik 5103.0412.3456.0001", "nik [NIK disamarkan]"],
  ])("menyamarkan NIK/KK: %s", (input, expected) => {
    expect(maskPii(input)).toBe(expected);
  });

  it.each([
    "081234567890",
    "0812-3456-7890",
    "+62 812 3456 7890",
    "6281234567890",
    "(0361) 123456",
  ])("menyamarkan nomor telepon: %s", (phone) => {
    expect(maskPii(`hubungi ${phone} ya`)).toBe(`hubungi ${PII_MASKS.phone} ya`);
  });

  it("menyamarkan email", () => {
    expect(maskPii("kirim ke Budi.Santoso+x@mail.co.id sekarang")).toBe("kirim ke [email disamarkan] sekarang");
  });

  it.each([
    "Kantor buka 07.30 - 15.00",
    "Tanggal 05-11-2026",
    "Biaya Rp 1.500.000",
    "Tahun 2026 ada 120 KK",
    "Nomor surat 0123",
    "Angka 123456789012345678",
  ])("tidak menyentuh angka biasa: %s", (text) => {
    expect(maskPii(text)).toBe(text);
  });

  it("keep() membiarkan nilai tepercaya", () => {
    const trusted = collectPiiValues(["Telp kantor: (0361) 123456, email desa@darmasaba.id"]);
    expect(trusted).toEqual(new Set(["phone:0361123456", "email:desa@darmasaba.id"]));
    const keep = (kind: string, value: string) => trusted.has(`${kind}:${value}`);
    expect(maskPii("Hubungi 0361-123456 atau DESA@darmasaba.id, bukan 081299998888", keep)).toBe(
      "Hubungi 0361-123456 atau DESA@darmasaba.id, bukan [nomor disamarkan]",
    );
  });

  it("menormalkan awalan 62 ke 0 untuk pembanding", () => {
    const trusted = collectPiiValues(["WA 081234567890"]);
    expect(maskPii("+62 812-3456-7890", (k, v) => trusted.has(`${k}:${v}`))).toBe("+62 812-3456-7890");
  });
});

describe("guardOutput", () => {
  const routes = new Set(["/", "/profil", "/berita", "https://darmasaba.id/layanan"]);

  it("tautan allowlist tetap jadi tautan dan masuk sources", () => {
    const out = guardOutput("Lihat [Profil Desa](/profil) dan [Berita](/berita/abc).", routes);
    expect(out.text).toBe("Lihat [Profil Desa](/profil) dan [Berita](/berita/abc).");
    expect(out.sources).toEqual([
      { title: "Profil Desa", url: "/profil" },
      { title: "Berita", url: "/berita/abc" },
    ]);
  });

  it("tautan di luar allowlist → label saja", () => {
    const out = guardOutput(
      "Klik [di sini](https://evil.example/x), [api](/api/jenna/chat), [js](javascript:alert(1)), ![img](/profil)",
      routes,
    );
    expect(out.text).not.toMatch(/evil|\/api\/|javascript/);
    expect(out.text).toContain("Klik di sini, api, js");
    expect(out.sources).toEqual([{ title: "img", url: "/profil" }]);
  });

  it("URL mentah hanya dipertahankan bila diizinkan", () => {
    const out = guardOutput("Kunjungi https://darmasaba.id/layanan. Jangan https://phish.example/login!", routes);
    expect(out.text).toBe("Kunjungi https://darmasaba.id/layanan. Jangan !");
    expect(out.sources).toEqual([{ title: "https://darmasaba.id/layanan", url: "https://darmasaba.id/layanan" }]);
  });

  it("membuang HTML, komentar, dan sisa pembungkus tool", () => {
    const out = guardOutput('<script>alert(1)</script><b>Tebal</b> <!-- rahasia --> [DATA tool="x"]isi[/DATA]', routes);
    expect(out.text).toBe("alert(1)Tebal  isi");
  });

  it("penanda slot palsu di input tidak bisa menyuntik tautan", () => {
    const out = guardOutput("a\u00000\u0000b [ok](/profil)", routes);
    expect(out.text).toBe("a0b [ok](/profil)");
  });

  it("menyamarkan PII kecuali kontak yang tercantum di data publik", () => {
    const trusted = collectPiiValues(["Kantor desa (0361) 123456"]);
    const out = guardOutput("Kantor: 0361 123456. Pak Kadus: 081234567890. NIK 3171012345678901.", routes, trusted);
    expect(out.text).toBe("Kantor: 0361 123456. Pak Kadus: [nomor disamarkan]. NIK [NIK disamarkan].");
  });

  it("PII di label tautan ikut disamarkan", () => {
    const out = guardOutput("[WA 081234567890](/profil)", routes);
    expect(out.text).toBe("[WA [nomor disamarkan]](/profil)");
  });

  it("sources dibatasi dan tanpa duplikat", () => {
    const many = Array.from({ length: MAX_SOURCES + 3 }, (_, i) => `[b${i}](/berita/${i})`).join(" ");
    const out = guardOutput(`${many} [lagi](/berita/0)`, routes);
    expect(out.sources).toHaveLength(MAX_SOURCES);
    expect(new Set(out.sources.map((s) => s.url)).size).toBe(MAX_SOURCES);
  });

  it("mempertahankan indentasi daftar markdown", () => {
    const text = "- satu\n  - dua";
    expect(guardOutput(text, routes).text).toBe(text);
  });

  it("path internal polos yang diizinkan dijadikan tautan markdown dan masuk sources", () => {
    const out = guardOutput("Lihat /profil atau **/berita/abc**. Juga (/berita).", routes);
    expect(out.text).toBe("Lihat [/profil](/profil) atau **[/berita/abc](/berita/abc)**. Juga ([/berita](/berita)).");
    expect(out.sources).toEqual([
      { title: "/profil", url: "/profil" },
      { title: "/berita/abc", url: "/berita/abc" },
      { title: "/berita", url: "/berita" },
    ]);
  });

  it.each([
    ["path di dalam URL", "Buka https://darmasaba.id/layanan sekarang"],
    ["tautan markdown yang sudah ada", "Lihat [Profil Desa](/profil) ya"],
    ["kode inline", "Ketik `/profil` di alamat"],
    ["tanggal & pecahan", "Tanggal 11/14, setengah 1/2, dan/atau Rp5.000/bulan"],
    ["path tidak diizinkan", "Jangan /api/jenna/chat atau /rahasia/x"],
    ["garis miring tunggal", "pilih A / B"],
  ])("tidak dijadikan tautan: %s", (_name, text) => {
    expect(guardOutput(text, new Set([...routes, "/layanan"])).text).toBe(text);
  });

  it("path di dalam URL terlarang ikut terbuang bersama URL-nya, tidak dijadikan tautan", () => {
    expect(guardOutput("Buka https://evil.example/profil sekarang", routes)).toEqual({ text: "Buka  sekarang", sources: [] });
  });

  it("linkifyPaths: false (giliran suara) membiarkan path polos sebagai teks", () => {
    const out = guardOutput("Lihat /profil.", routes, new Set(), { linkifyPaths: false });
    expect(out).toEqual({ text: "Lihat /profil.", sources: [] });
  });

  it("kontak kantor dari snapshot lolos dalam format lain; nomor/email lain tetap disamarkan", () => {
    const trusted = collectPiiValues([
      "| Kantor Desa Darmasaba | WhatsApp | +62 812-3456-7890 |\n| Kantor Desa | Email | Desa.Darmasaba@gmail.com |",
    ]);
    const out = guardOutput(
      "WA kantor 081234567890, juga 0812 3456 7890 atau 6281234567890; email desa.darmasaba@gmail.com. " +
        "Pak Kadus 081299998888, bu.kader@gmail.com.",
      routes,
      trusted,
    );
    expect(out.text).toBe(
      "WA kantor 081234567890, juga 0812 3456 7890 atau 6281234567890; email desa.darmasaba@gmail.com. " +
        `Pak Kadus ${PII_MASKS.phone}, ${PII_MASKS.email}.`,
    );
  });
});

describe("createDeltaGuard", () => {
  const routes = new Set(["/", "/profil"]);
  const run = (deltas: string[], trustedPii: ReadonlySet<string> = new Set(), linkifyPaths?: boolean) => {
    const emitted: string[] = [];
    const guard = createDeltaGuard({ routes, trustedPii, emit: (t) => emitted.push(t), linkifyPaths });
    for (const d of deltas) guard.push(d);
    return emitted;
  };

  it("nomor tak tepercaya yang terbelah dua delta tidak pernah keluar utuh", () => {
    const emitted = run(["Hubungi 0812", "34567890 ya. "]);
    expect(emitted).toEqual([`Hubungi ${PII_MASKS.phone} ya. `]);
    expect(emitted.join("")).not.toMatch(/\d{4}/);
  });

  it("tautan terlarang yang terbelah hanya menyisakan label", () => {
    const emitted = run(["Lihat [Formulir](https://phi", "sh.example/login). "]);
    expect(emitted.join("")).toBe("Lihat Formulir. ");
  });

  it("tautan internal yang diizinkan tetap utuh", () => {
    expect(run(["Lihat [Profil", " Desa](/pro", "fil).\n"]).join("")).toBe("Lihat [Profil Desa](/profil).\n");
  });

  it("path polos yang terbelah antar delta tetap jadi satu tautan utuh", () => {
    expect(run(["Lihat /pro", "fil. Lalu /pro", "fil/a\n"]).join("")).toBe(
      "Lihat [/profil](/profil). Lalu [/profil/a](/profil/a)\n",
    );
  });

  it("linkifyPaths: false → path polos tetap teks", () => {
    expect(run(["Lihat /pro", "fil. "], new Set(), false).join("")).toBe("Lihat /profil. ");
  });

  it("nomor kontak tepercaya (ada di snapshot) tetap utuh", () => {
    const trusted = collectPiiValues(["Kantor desa (0361) 123456"]);
    expect(run(["Telp (0361) 12", "3456! Lainnya"], trusted).join("")).toBe("Telp (0361) 123456! ");
  });

  it("spasi & baris baru di tepi potongan dipertahankan; ekor tanpa batas tidak dikirim", () => {
    const emitted = run(["\n\n  - satu\n", "  - dua? ", "ekor tanpa batas"]);
    expect(emitted).toEqual(["\n\n  - satu\n", "  - dua? "]);
  });

  it("tanpa batas kalimat, buffer > DELTA_FLUSH_CHARS tetap di-flush tanpa membelah nomor", () => {
    const words = "kata ".repeat(Math.ceil(DELTA_FLUSH_CHARS / 5));
    const emitted = run([words, "0812 3456", " 7890 lanjut"]);
    expect(emitted).toHaveLength(1);
    expect(emitted[0].length).toBeLessThanOrEqual(DELTA_FLUSH_CHARS + 20);
    expect(emitted[0]).toMatch(/^(kata )+$/);
    expect(run(["x".repeat(DELTA_FLUSH_CHARS + 1)])).toEqual(["x".repeat(DELTA_FLUSH_CHARS + 1)]);
  });
});
