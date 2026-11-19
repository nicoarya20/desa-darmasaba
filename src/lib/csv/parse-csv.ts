// Parser CSV generik (fungsi murni, jalan di browser maupun server): BOM, deteksi pemisah "," / ";",
// kutip RFC 4180 ("" di dalam kutip, koma/baris baru di dalam kutip), CRLF. Dipakai impor CSV tiap domain;
// aturan kolom/validasi tetap di domain masing-masing.

/** Batas ukuran berkas CSV standar impor admin (byte). */
export const CSV_MAKS_BYTES = 2 * 1024 * 1024;

/** Hasil baca tabel CSV: header, baris data tak kosong, dan galat berkas bila ada. */
export type TabelCsv = {
  /** Header dinormalkan (lihat `normalHeader`). */
  headers: string[];
  /** Baris data tak kosong; `baris` = nomor baris di berkas (1 = header). */
  data: { baris: number; cells: string[] }[];
  galat: string | null;
};

/** Header dinormalkan: huruf kecil, selain huruf/angka → spasi. "NAMA_PENERIMA" → "nama penerima". */
export const normalHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Pemisah kolom baris pertama: ";" (ekspor Excel lokal Indonesia) bila lebih banyak dari ",". */
function deteksiPemisah(teks: string): "," | ";" {
  const barisPertama = teks.split(/\r?\n/, 1)[0] ?? "";
  const hitung = (c: string) => barisPertama.split(c).length - 1;
  return hitung(";") > hitung(",") ? ";" : ",";
}

function urai(teks: string, pemisah: "," | ";"): { rows: string[][]; kutipTerbuka: boolean } {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let dalamKutip = false;
  const src = teks.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (dalamKutip) {
      if (c === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') dalamKutip = false;
      else cell += c;
    } else if (c === '"') dalamKutip = true;
    else if (c === pemisah) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return { rows, kutipTerbuka: dalamKutip };
}

/** Pecah teks CSV (RFC 4180: kutip ganda, "" di dalam kutip, CRLF) menjadi baris sel; jumlah sel per baris boleh beda. */
export function parseCsv(teks: string, pemisah: "," | ";" = deteksiPemisah(teks)): string[][] {
  return urai(teks, pemisah).rows;
}

/** Indeks kolom pertama yang header-nya cocok dengan alias (urutan alias = prioritas). */
export function cariKolom(headers: string[], alias: readonly string[]): number {
  for (const a of alias) {
    const i = headers.indexOf(a);
    if (i >= 0) return i;
  }
  return -1;
}

/** Berapa header yang cocok dengan salah satu alias (>1 = ambigu, mis. "nama" dan "nama umkm" sekaligus). */
export function hitungKolom(headers: string[], alias: readonly string[]): number {
  return headers.filter((h) => alias.includes(h)).length;
}

/** Semua sel kosong (atau spasi saja). */
export const barisKosong = (cells: string[]) => cells.every((c) => c.trim() === "");

/**
 * Baca CSV sebagai tabel: tolak berkas kosong, melebihi `maksBytes`, atau bertanda kutip tak tertutup;
 * baris kosong sepenuhnya dilewati diam-diam; nomor baris tetap nomor di berkas.
 */
export function bacaTabelCsv(teks: string, maksBytes: number = CSV_MAKS_BYTES): TabelCsv {
  const kosong = (galat: string): TabelCsv => ({ headers: [], data: [], galat });
  if (new TextEncoder().encode(teks).length > maksBytes) {
    return kosong(`Ukuran berkas maksimal ${Math.round(maksBytes / (1024 * 1024))} MB`);
  }
  const { rows, kutipTerbuka } = urai(teks, deteksiPemisah(teks));
  const [header, ...sisa] = rows;
  if (!header || barisKosong(header)) return kosong("Berkas CSV kosong");
  if (kutipTerbuka) return kosong('Berkas CSV rusak: ada tanda kutip (") yang tidak ditutup');
  const data = sisa.flatMap((cells, i) => (barisKosong(cells) ? [] : [{ baris: i + 2, cells }]));
  return { headers: header.map(normalHeader), data, galat: null };
}
