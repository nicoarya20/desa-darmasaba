// Parser nilai sel impor CSV — fungsi murni, satu sumber untuk browser dan server.
// Angka mengikuti kebiasaan Indonesia: titik = pemisah ribuan ("15.000" = 15 ribu), koma = desimal ("1,5" bukan 15).
import type { Validasi } from "@/lib/program-kemiskinan/penerima.rules";
import { bersihkanTeks } from "./umkm-impor.rules";

const formatRibuan = (n: number) => n.toLocaleString("id-ID");

/**
 * Bilangan bulat ≥ 0 dari sel. Kosong → `null` (pemanggil memutuskan wajib/tidak). Menerima prefiks "Rp"/"Rp." dan
 * akhiran ",-"; titik ribuan ("15.000", "1.500.000"); desimal nol saja ("15.000,00", "15.0"). Menolak desimal bernilai,
 * notasi ilmiah (hasil Excel), negatif, huruf, dan "15,000" (ambigu: 15 atau 15 ribu).
 */
export function parseBilanganImpor(raw: unknown, kolom: string, maks: number): Validasi<number | null> {
  const teks = typeof raw === "number" ? String(raw) : bersihkanTeks(raw);
  if (!teks) return { ok: true, value: null };

  const gagal = (alasan: string): Validasi<number | null> => ({ ok: false, alasan: `Kolom '${kolom}' ${alasan}` });
  if (/^\d+([.,]\d+)?e[+-]?\d+$/i.test(teks.replace(/\s/g, ""))) {
    return gagal("memakai notasi ilmiah (mis. 1.5E4). Format kolom di Excel sebagai Teks atau Angka tanpa desimal");
  }
  if (teks.startsWith("-")) return gagal("tidak boleh negatif");

  const angka = teks.replace(/^rp\.?\s*/i, "").replace(/\s*[,.]-+$/, "").trim();
  const cocok = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:([.,])(\d+))?$/.exec(angka);
  if (!cocok) return gagal("harus berupa angka bulat (mis. 15000 atau 15.000)");

  const [, bulat, pemisah, pecahan] = cocok;
  if (pecahan !== undefined && !/^0{1,2}$/.test(pecahan)) {
    if (pemisah === "," && /^\d{3}$/.test(pecahan) && !bulat.includes(".")) {
      return gagal("ambigu (koma bisa pemisah ribuan atau desimal). Tulis tanpa pemisah (15000) atau dengan titik ribuan (15.000)");
    }
    return gagal("harus bilangan bulat tanpa desimal");
  }

  const nilai = Number(bulat.replace(/\./g, ""));
  if (nilai > maks) return gagal(`maksimal ${formatRibuan(maks)}`);
  return { ok: true, value: nilai };
}

const YA = new Set(["ya", "y", "true", "1", "yes"]);
const TIDAK = new Set(["tidak", "t", "n", "false", "0", "no"]);

/** Ya/tidak dari sel: ya/y/true/1 dan tidak/n/false/0 (tak peka huruf besar/kecil). Kosong → `null`. */
export function parseYaTidakImpor(raw: unknown, kolom: string): Validasi<boolean | null> {
  if (typeof raw === "boolean") return { ok: true, value: raw };
  const teks = bersihkanTeks(raw).toLowerCase();
  if (!teks) return { ok: true, value: null };
  if (YA.has(teks)) return { ok: true, value: true };
  if (TIDAK.has(teks)) return { ok: true, value: false };
  return { ok: false, alasan: `Kolom '${kolom}' harus diisi ya atau tidak (boleh juga 1/0 atau true/false)` };
}
