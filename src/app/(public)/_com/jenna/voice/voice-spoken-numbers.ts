// Pemformat angka lisan: angka id-ID 1.000.000 ke atas di teks yang akan DIUCAPKAN diringkas ke
// juta/miliar/triliun ("Rp 940.248.688" jadi "sekitar 940,2 juta rupiah"). Teks di panel tidak diubah.
// Tidak disentuh: angka di bawah sejuta, persen, tahun, tanggal, nomor polos, dan angka yang sudah
// diikuti kata skala. "sekitar" hanya ditambahkan bila pembulatan mengubah nilai.

export const SPOKEN_MIN_VALUE = 1_000_000;

const SCALES = [
  { word: "triliun", value: 1e12, decimals: 2 },
  { word: "miliar", value: 1e9, decimals: 2 },
  { word: "juta", value: 1e6, decimals: 1 },
] as const;

const APPROX_WORD = "sekitar";
const CURRENCY_WORD = "rupiah";
const APPROX_BEFORE_RE =
  /(?:sekitar|kurang lebih|kira-kira|hampir|lebih dari|kurang dari|±|~)\s*$/i;
const SKIP_AFTER_RE = /^\s*(?:%|persen\b|ribu\b|juta\b|mil[iy]ar\b|triliun\b)/i;

const AMOUNT_RE =
  /(?<![\p{L}\d.,])(?:(Rp\.?\s?)(\d{7,}|\d{1,3}(?:\.\d{3}){2,})|(\d{1,3}(?:\.\d{3}){2,}))(?:,(\d+))?(?![\d]|[.,]\d)(\s+rupiah\b)?/giu;

const groupThousands = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Nilai ke bentuk ringkas; skala naik bila pembulatan mencapai 1.000 (999,96 juta jadi 1 miliar). */
export function shortForm(value: number): { spoken: string; spokenValue: number } {
  let i = SCALES.findIndex((s) => value >= s.value);
  if (i < 0) i = SCALES.length - 1;
  let scale = SCALES[i] ?? SCALES[0];
  let fixed = (value / scale.value).toFixed(scale.decimals);
  if (Number(fixed) >= 1000 && i > 0) {
    scale = SCALES[i - 1] ?? scale;
    fixed = (value / scale.value).toFixed(scale.decimals);
  }
  const [int = "0", frac = ""] = fixed.split(".");
  const trimmed = frac.replace(/0+$/, "");
  const num = `${groupThousands(int)}${trimmed ? `,${trimmed}` : ""}`;
  return { spoken: `${num} ${scale.word}`, spokenValue: Number(fixed) * scale.value };
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function formatSpokenNumbers(text: string): string {
  return text.replace(AMOUNT_RE, (match, rp, rpDigits, plain, decimals, rupiah, offset: number) => {
    if (SKIP_AFTER_RE.test(text.slice(offset + match.length))) return match;
    const digits = String(rpDigits ?? plain).replace(/\./g, "");
    const value = Number(`${digits}${decimals ? `.${decimals}` : ""}`);
    if (!(value >= SPOKEN_MIN_VALUE)) return match;
    const short = shortForm(value);
    const before = text.slice(0, offset);
    const approx = short.spokenValue !== value && !APPROX_BEFORE_RE.test(before);
    const spoken = [approx ? APPROX_WORD : "", short.spoken, rp || rupiah ? CURRENCY_WORD : ""]
      .filter(Boolean)
      .join(" ");
    return /(?:^|[.!?]\s+)$/.test(before) ? capitalize(spoken) : spoken;
  });
}
