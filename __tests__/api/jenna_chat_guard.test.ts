// @vitest-environment node
// Penyamaran PII (pesan pengunjung) dan output guard (tautan allowlist, HTML, PII kecuali kontak publik).
import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn(), unstable_cache: <T,>(fn: T) => fn }));
vi.mock("@/lib/prisma", () => ({ default: {} }));

import {
  collectLinkTitles,
  createDeltaGuard,
  DELTA_FLUSH_CHARS,
  guardOutput,
  MAX_SOURCES,
  normalizeHref,
} from "@/lib/jenna/chat/output-guard";
import { wrapToolResult } from "@/lib/jenna/tools/executor";
import { collectPiiValues, maskPii, PII_MASKS } from "@/lib/jenna/pii";

describe("maskPii", () => {
  it.each([
    ["NIK saya 3171012345678901 ya", "NIK saya [NIK disamarkan] ya"],
    ["KK 5103 0412 3456 0001.", "KK [NIK disamarkan]."],
    ["nik 5103.0412.3456.0001", "nik [NIK disamarkan]"],
    ["NIK 5103-0123-4567-0001 ya", "NIK [NIK disamarkan] ya"],
    ["campur 5103 0123-4567.0001", "campur [NIK disamarkan]"],
    ["NIK: 5103-0123-4567-0001", "NIK: [NIK disamarkan]"],
    ["nik5103012345670001", "nik[NIK disamarkan]"],
    ["NIK5103-0123-4567-0001", "NIK[NIK disamarkan]"],
    ["abc5103012345670001def", "abc[NIK disamarkan]def"],
    ["no_5103012345670001", "no_[NIK disamarkan]"],
    ["#5103012345670001", "#[NIK disamarkan]"],
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
    "Biaya Rp 12.500.000,00 dan Rp1.234.567",
    "Tanggal 14/11/2026 pukul 07.30",
    "Angka 15 digit 510301234567000",
    "Angka 17 digit 51030123456700012",
    "kode x51030123456700012",
  ])("tidak menyentuh angka biasa: %s", (text) => {
    expect(maskPii(text)).toBe(text);
  });

  it.each(["0812-3456-7890", "+62 812-3456-7890", "6281234567890"])(
    "nomor telepon bertanda hubung tetap jadi phone, bukan NIK: %s",
    (phone) => {
      expect(maskPii(`WA ${phone}`)).toBe(`WA ${PII_MASKS.phone}`);
    },
  );

  it("NIK berspasi di data dan bertanda hubung di jawaban dianggap nilai yang sama", () => {
    const trusted = collectPiiValues(["NIK contoh: 5103 0123 4567 0001"]);
    expect(trusted.has("nik:5103012345670001")).toBe(true);
    expect(collectPiiValues(["jawaban: NIK5103-0123-4567-0001"])).toEqual(new Set(["nik:5103012345670001"]));
    const keep = (kind: string, value: string) => trusted.has(`${kind}:${value}`);
    expect(maskPii("NIK 5103-0123-4567-0001, bukan 5103-0123-4567-0002", keep)).toBe(
      `NIK 5103-0123-4567-0001, bukan ${PII_MASKS.nik}`,
    );
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

  it("href tautan markdown & path polos yang diizinkan tidak disamarkan walau berisi 16 digit setelah huruf", () => {
    const out = guardOutput("Baca [Berita](/berita/cuid5103012345670001) atau /berita/x5103012345670001.", routes);
    expect(out.text).toBe(
      "Baca [Berita](/berita/cuid5103012345670001) atau [/berita/x5103012345670001](/berita/x5103012345670001).",
    );
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
    ["kode inline berisi path + kata lain", "Ketik `/profil saja` di alamat"],
    ["kode inline berisi path tak diizinkan", "Jangan `/api/jenna/chat` atau `/rahasia/x`"],
    ["kode inline berisi perintah biasa", "Jalankan `bun run dev` lalu `cd /profil`"],
    ["tanggal & pecahan", "Tanggal 11/14, setengah 1/2, dan/atau Rp5.000/bulan"],
    ["path tidak diizinkan", "Jangan /api/jenna/chat atau /rahasia/x"],
    ["garis miring tunggal", "pilih A / B"],
  ])("tidak dijadikan tautan: %s", (_name, text) => {
    expect(guardOutput(text, new Set([...routes, "/layanan"])).text).toBe(text);
  });

  it("kode inline yang seluruh isinya satu path/URL diizinkan dijadikan tautan dan masuk sources", () => {
    const out = guardOutput("Ketik `/profil` atau ` /berita/abc `, juga `https://darmasaba.id/layanan`.", routes);
    expect(out.text).toBe(
      "Ketik [/profil](/profil) atau [/berita/abc](/berita/abc), juga [https://darmasaba.id/layanan](https://darmasaba.id/layanan).",
    );
    expect(out.sources.map((s) => s.url)).toEqual(["/profil", "/berita/abc", "https://darmasaba.id/layanan"]);
  });

  it("linkifyPaths: false → kode inline berisi path tetap kode", () => {
    expect(guardOutput("Ketik `/profil`.", routes, new Set(), { linkifyPaths: false })).toEqual({ text: "Ketik `/profil`.", sources: [] });
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

describe("judul tautan dari data", () => {
  const routes = new Set(["/", "/pemerintahan/pengumuman", "/profil"]);
  const PATH = "/pemerintahan/pengumuman/Ekonomi%20%26%20UMKM/cmk6a1";
  const snapshot = [
    "- Pemerintahan › [Pengumuman](/pemerintahan/pengumuman)",
    `- 2026-11-10 — [Pelatihan UMKM](${PATH})`,
    "| [Profil Desa](/profil/) | isi |",
  ].join("\n");
  const tool = wrapToolResult(
    "cari_konten",
    "DATA",
    JSON.stringify([{ title: "Digitalisasi [Desa]", url: "/pemerintahan/pengumuman/Digitalisasi%20Desa/cmk6a2", text: "isi" }]),
  );
  const titles = collectLinkTitles([snapshot, tool]);
  const guard = (text: string, opts = {}) => guardOutput(text, routes, new Set(), { titles, ...opts });

  it("normalizeHref: decode aman, tanpa query/hash/garis miring akhir", () => {
    expect(normalizeHref("/a%20b/c/?x=1#y")).toBe("/a b/c");
    expect(normalizeHref("/a%E0%A4%A")).toBe("/a%E0%A4%A");
    expect(normalizeHref("/")).toBe("/");
  });

  it("collectLinkTitles: snapshot [judul](/path) dan item hasil tool, kunci ter-normalisasi", () => {
    expect(titles.get("/pemerintahan/pengumuman/Ekonomi & UMKM/cmk6a1")).toBe("Pelatihan UMKM");
    expect(titles.get("/pemerintahan/pengumuman/Digitalisasi Desa/cmk6a2")).toBe("Digitalisasi (Desa)");
    expect(titles.get("/profil")).toBe("Profil Desa");
    expect(titles.get("/pemerintahan/pengumuman")).toBe("Pengumuman");
  });

  it("path polos → label & sumber = judul dari data", () => {
    const out = guard(`Lihat ${PATH}.`);
    expect(out.text).toBe(`Lihat [Pelatihan UMKM](${PATH}).`);
    expect(out.sources).toEqual([{ title: "Pelatihan UMKM", url: PATH }]);
  });

  it("[/path](/path), label ter-decode, dan label kosong → judul dari data", () => {
    const decoded = "/pemerintahan/pengumuman/Ekonomi & UMKM/cmk6a1";
    for (const label of [PATH, decoded, " "]) {
      const out = guard(`Baca [${label}](${PATH})`);
      expect(out.text).toBe(`Baca [Pelatihan UMKM](${PATH})`);
      expect(out.sources).toEqual([{ title: "Pelatihan UMKM", url: PATH }]);
    }
  });

  it("judul dari hasil tool dipakai; tanda kurung siku dinetralkan", () => {
    const url = "/pemerintahan/pengumuman/Digitalisasi%20Desa/cmk6a2";
    expect(guard(`Lihat ${url}`).text).toBe(`Lihat [Digitalisasi (Desa)](${url})`);
  });

  it("path tak dikenal → nama menu induk; tanpa menu → path ter-decode (tanpa %20/%26)", () => {
    const unknown = "/pemerintahan/pengumuman/Ekonomi%20%26%20UMKM/zzz";
    expect(guard(`Lihat ${unknown}`).sources).toEqual([{ title: "Pengumuman", url: unknown }]);
    const out = guardOutput(`Lihat ${unknown}`, routes);
    expect(out.text).toBe(`Lihat [/pemerintahan/pengumuman/Ekonomi & UMKM/zzz](${unknown})`);
    expect(out.sources[0].title).not.toMatch(/%2|%26/);
  });

  it("label markdown bermakna tulisan model dipertahankan", () => {
    const out = guard(`Info: [pelatihan bulan ini](${PATH})`);
    expect(out.text).toBe(`Info: [pelatihan bulan ini](${PATH})`);
    expect(out.sources).toEqual([{ title: "pelatihan bulan ini", url: PATH }]);
  });

  it("sumber tidak duplikat untuk href yang sama (encode/trailing slash berbeda)", () => {
    const out = guard(`${PATH} lalu [Pelatihan](${PATH}) dan /pemerintahan/pengumuman/Ekonomi%20%26%20UMKM/cmk6a1/ serta /profil/ dan /profil`);
    expect(out.sources).toEqual([
      { title: "Pelatihan", url: PATH },
      { title: "Profil Desa", url: "/profil/" },
    ]);
  });

  it("kode inline berisi path ter-encode → tautan berjudul, tanpa duplikat sumber", () => {
    const out = guard(`1. \`${PATH}\`\n2. ${PATH}`);
    expect(out.text).toBe(`1. [Pelatihan UMKM](${PATH})\n2. [Pelatihan UMKM](${PATH})`);
    expect(out.sources).toEqual([{ title: "Pelatihan UMKM", url: PATH }]);
  });

  it("giliran suara: path polos tetap teks, tautan markdown tetap memakai judul", () => {
    const out = guard(`Lihat ${PATH} dan [${PATH}](${PATH})`, { linkifyPaths: false });
    expect(out.text).toBe(`Lihat ${PATH} dan [Pelatihan UMKM](${PATH})`);
  });

  it("delta guard konsisten dengan hasil akhir, termasuk judul dari hasil tool yang datang di tengah giliran", () => {
    const live = collectLinkTitles([snapshot]);
    const emitted: string[] = [];
    const delta = createDeltaGuard({ routes, trustedPii: new Set(), emit: (t) => emitted.push(t), titles: live });
    const text = `Lihat \`${PATH}\`. Juga /pemerintahan/pengumuman/Digitalisasi%20Desa/cmk6a2.\n`;
    collectLinkTitles([tool], live);
    for (const part of [text.slice(0, 20), text.slice(20, 50), text.slice(50)]) delta.push(part);
    expect(emitted.join("")).toBe(guard(text).text + "\n");
  });
});

describe("sumber dari judul data yang disebut tanpa tautan", () => {
  const routes = new Set(["/", "/pemerintahan/pengumuman", "/profil"]);
  const LELANG = "/pemerintahan/pengumuman/Pembangunan/lelang1";
  const LELANG_2024 = "/pemerintahan/pengumuman/Pembangunan/lelang2";
  const RAPAT = "/pemerintahan/pengumuman/Umum/rapat";
  const LONG = "/pemerintahan/pengumuman/Umum/panjang";
  const longTitle = `Sosialisasi Program Ketahanan Pangan ${"Masyarakat ".repeat(12)}`.trim();
  const clippedTitle = `${longTitle.slice(0, 80)}…`;
  const titles = new Map([
    ["/pemerintahan/pengumuman", "Pengumuman"],
    ["/profil", "Profil Desa"],
    ["/pemerintahan/pengumuman/Umum/tunggal", "Pemberitahuanpenting"],
    [LELANG, "Pengumuman Lelang Penataan Landscape Lapangan Desa"],
    [LELANG_2024, "Pengumuman Lelang Penataan Landscape Lapangan Desa Darmasaba Tahun Anggaran 2024"],
    [RAPAT, "Rapat Koordinasi Kader Posyandu"],
    [LONG, clippedTitle],
    ["/admin/rahasia/x", "Dokumen Internal Rapat Perangkat"],
  ]);
  const guard = (text: string, opts = {}) => guardOutput(text, routes, new Set(), { titles, ...opts });

  it("judul tebal tanpa tautan → sumber berisi judul & href dari peta; teks tidak berubah", () => {
    const text = "Berikut pengumuman terbaru:\n1. **Rapat Koordinasi Kader Posyandu** — 10 Nov\n2. **Pengumuman Lelang Penataan Landscape Lapangan Desa** — 9 Nov";
    const out = guard(text);
    expect(out.text).toBe(text);
    expect(out.sources).toEqual([
      { title: "Rapat Koordinasi Kader Posyandu", url: RAPAT },
      { title: "Pengumuman Lelang Penataan Landscape Lapangan Desa", url: LELANG },
    ]);
  });

  it("cocok tanpa peduli huruf besar, spasi ganda, dan penanda markdown di dalam judul", () => {
    expect(guard("Ada *rapat   koordinasi* _kader_ `posyandu` besok.").sources).toEqual([
      { title: "Rapat Koordinasi Kader Posyandu", url: RAPAT },
    ]);
  });

  it("nama menu pendek / judul satu kata tidak memicu", () => {
    expect(guard("Buka menu Pengumuman atau Profil Desa. Pemberitahuanpenting ada di sana.").sources).toEqual([]);
  });

  it("judul sebagai potongan kata tidak memicu", () => {
    expect(guard("Xrapat koordinasi kader posyandu").sources).toEqual([]);
    expect(guard("Rapat Koordinasi Kader Posyandunya").sources).toEqual([]);
  });

  it("judul terpotong (…) tetap cocok dengan judul lengkap di jawaban", () => {
    expect(guard(`Info: ${longTitle}.`).sources).toEqual([{ title: clippedTitle, url: LONG }]);
  });

  it("judul bertumpuk → hanya yang terpanjang", () => {
    const out = guard("Lihat **Pengumuman Lelang Penataan Landscape Lapangan Desa Darmasaba Tahun Anggaran 2024**.");
    expect(out.sources.map((s) => s.url)).toEqual([LELANG_2024]);
  });

  it("judul pendek tetap ikut bila juga disebut di luar judul yang lebih panjang", () => {
    const out = guard(
      "1. Pengumuman Lelang Penataan Landscape Lapangan Desa Darmasaba Tahun Anggaran 2024\n2. Pengumuman Lelang Penataan Landscape Lapangan Desa",
    );
    expect(out.sources.map((s) => s.url)).toEqual([LELANG_2024, LELANG]);
  });

  it("tidak duplikat dengan tautan eksplisit; tautan eksplisit lebih dulu", () => {
    const out = guard(`Rapat Koordinasi Kader Posyandu dan [Rapat Koordinasi Kader Posyandu](${RAPAT}) serta [Profil Desa](/profil).`);
    expect(out.sources).toEqual([
      { title: "Rapat Koordinasi Kader Posyandu", url: RAPAT },
      { title: "Profil Desa", url: "/profil" },
    ]);
  });

  it("href tak diizinkan tidak ikut", () => {
    expect(guard("Ada Dokumen Internal Rapat Perangkat.").sources).toEqual([]);
  });

  it("href ber-spasi dari peta di-encode", () => {
    const own = new Map([["/pemerintahan/pengumuman/Ekonomi & UMKM/a1", "Pelatihan Digital UMKM Desa"]]);
    const out = guardOutput("Ikuti Pelatihan Digital UMKM Desa.", routes, new Set(), { titles: own });
    expect(out.sources).toEqual([{ title: "Pelatihan Digital UMKM Desa", url: "/pemerintahan/pengumuman/Ekonomi%20&%20UMKM/a1" }]);
  });

  it("dibatasi MAX_SOURCES", () => {
    const many = new Map(
      Array.from({ length: MAX_SOURCES + 3 }, (_, i) => [`/pemerintahan/pengumuman/x/${i}`, `Pengumuman Kegiatan Nomor ${i} Desa`]),
    );
    const text = [...many.values()].join("\n");
    const out = guardOutput(text, routes, new Set(), { titles: many });
    expect(out.sources).toHaveLength(MAX_SOURCES);
    expect(out.sources[0]).toEqual({ title: "Pengumuman Kegiatan Nomor 0 Desa", url: "/pemerintahan/pengumuman/x/0" });
  });

  it("giliran suara: sumber tetap terisi, teks tidak berubah", () => {
    const text = "Ada rapat koordinasi kader posyandu minggu ini.";
    const out = guard(text, { linkifyPaths: false });
    expect(out.text).toBe(text);
    expect(out.sources).toEqual([{ title: "Rapat Koordinasi Kader Posyandu", url: RAPAT }]);
  });

  it("delta guard: teks yang di-emit sama dengan teks akhir", () => {
    const emitted: string[] = [];
    const delta = createDeltaGuard({ routes, trustedPii: new Set(), emit: (t) => emitted.push(t), titles });
    const text = "1. **Rapat Koordinasi Kader Posyandu**.\n2. Pengumuman Lelang Penataan Landscape Lapangan Desa.\n";
    for (const part of [text.slice(0, 25), text.slice(25)]) delta.push(part);
    expect(emitted.join("")).toBe(text);
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

  it("kode inline berisi path yang terbelah antar delta tetap jadi satu tautan utuh", () => {
    expect(run(["Ketik `/pro", "fil` lalu `/pro", "fil x`. "]).join("")).toBe("Ketik [/profil](/profil) lalu `/profil x`. ");
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
