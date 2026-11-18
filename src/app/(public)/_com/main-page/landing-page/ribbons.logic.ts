/** Geometri pita latar hero: garis tengah Bézier → bidang-bidang sejajar yang melebar di pangkal (kipas). */

export const RIBBON_VIEWBOX = { width: 1600, height: 700 };

type Point = readonly [number, number];
type Cubic = readonly [Point, Point, Point, Point];

/** Dari atas-tengah turun ke kanan, lalu mendatar di belakang foto Perbekel sampai keluar tepi kanan. */
const CENTERLINE: readonly Cubic[] = [
  [[700, -60], [820, 250], [1000, 440], [1300, 430]],
  [[1300, 430], [1600, 420], [1700, 395], [1900, 430]],
];

/** Tepi luar (kiri-bawah) tetap, supaya kipas tidak pernah mendekati teks sambutan. */
const OUTER_EDGE = 154;
const BASE_WIDTH = 180;
const SAMPLES_PER_CURVE = 24;

/**
 * Dari tepi dalam (kanan-atas) ke luar. `share` = porsi lebar; total 1. Warna (dari seragam Perbekel) bukan di sini:
 * pita ke-n diisi `var(--ribbon-n)` yang terang/gelapnya dideklarasikan di landing.module.css, supaya ganti tema
 * cukup lewat CSS (tanpa kedip atau hydration mismatch). Urutan & jumlah di sini harus sama dengan --ribbon-1..11.
 */
export const RIBBON_STRIPES = [
  { share: 0.16 },
  { share: 0.04 },
  { share: 0.2 },
  { share: 0.03 },
  { share: 0.03 }, // emas
  { share: 0.09 },
  { share: 0.12 },
  { share: 0.04 },
  { share: 0.17 }, // putih
  { share: 0.025 }, // merah
  { share: 0.095 },
] as const;

/** Nilai `fill` pita ke-`index` (0 = terdalam): variabel CSS --ribbon-1, --ribbon-2, … di landing.module.css. */
export function ribbonFill(index: number): string {
  return `var(--ribbon-${index + 1})`;
}

/** Lebar relatif sepanjang pita: 1.35× di pangkal (atas), 1× di belakang foto, 0.9× di ujung kanan. */
export function ribbonScale(u: number): number {
  return u < 1 ? 1 + 0.35 * (1 - u) ** 2 : 1 - 0.1 * (u - 1);
}

function cubicAt([p0, p1, p2, p3]: Cubic, t: number, axis: 0 | 1): number {
  const m = 1 - t;
  return m ** 3 * p0[axis] + 3 * m * m * t * p1[axis] + 3 * m * t * t * p2[axis] + t ** 3 * p3[axis];
}

function cubicSlopeAt([p0, p1, p2, p3]: Cubic, t: number, axis: 0 | 1): number {
  const m = 1 - t;
  return 3 * m * m * (p1[axis] - p0[axis]) + 6 * m * t * (p2[axis] - p1[axis]) + 3 * t * t * (p3[axis] - p2[axis]);
}

/** Titik garis tengah beserta normal satuan ke sisi luar dan skala lebarnya. */
function sampleCenterline() {
  return CENTERLINE.flatMap((curve, index) =>
    Array.from({ length: SAMPLES_PER_CURVE + 1 }, (_, i) => {
      const t = i / SAMPLES_PER_CURVE;
      const dx = cubicSlopeAt(curve, t, 0);
      const dy = cubicSlopeAt(curve, t, 1);
      const length = Math.hypot(dx, dy);
      return {
        x: cubicAt(curve, t, 0),
        y: cubicAt(curve, t, 1),
        nx: -dy / length,
        ny: dx / length,
        scale: ribbonScale(index + t),
      };
    }).slice(index === 0 ? 0 : 1),
  );
}

/**
 * Satu path tertutup per pita. Tiap pita digambar dari tepi dalamnya sampai tepi luar seluruh berkas,
 * lalu ditimpa pita berikutnya — tanpa celah sehalus rambut di antara dua pita bersebelahan.
 */
export function buildRibbonPaths(): { fill: string; d: string }[] {
  const samples = sampleCenterline();
  const edge = (shareFromInner: number) =>
    samples.map(({ x, y, nx, ny, scale }) => {
      const offset = OUTER_EDGE - BASE_WIDTH * scale * (1 - shareFromInner);
      return `${(x + nx * offset).toFixed(1)} ${(y + ny * offset).toFixed(1)}`;
    });
  const outer = edge(1).reverse().join("L");

  let start = 0;
  return RIBBON_STRIPES.map(({ share }, index) => {
    const d = `M${edge(start).join("L")}L${outer}Z`;
    start += share;
    return { fill: ribbonFill(index), d };
  });
}
