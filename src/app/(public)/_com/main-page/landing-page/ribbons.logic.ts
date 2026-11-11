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

/** Dari tepi dalam (kanan-atas) ke luar. `share` = porsi lebar; total 1. Warna diambil dari seragam Perbekel. */
export const RIBBON_STRIPES = [
  { color: "#062f49", share: 0.16 },
  { color: "#0b3d5e", share: 0.04 },
  { color: "#0a4e78", share: 0.2 },
  { color: "#2f6f99", share: 0.03 },
  { color: "#d4a72c", share: 0.03 },
  { color: "#5f8db3", share: 0.09 },
  { color: "#7fa6c6", share: 0.12 },
  { color: "#a9c3da", share: 0.04 },
  { color: "#ffffff", share: 0.17 },
  { color: "#c8102e", share: 0.025 },
  { color: "#bccbe0", share: 0.095 },
] as const;

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
export function buildRibbonPaths(): { color: string; d: string }[] {
  const samples = sampleCenterline();
  const edge = (shareFromInner: number) =>
    samples.map(({ x, y, nx, ny, scale }) => {
      const offset = OUTER_EDGE - BASE_WIDTH * scale * (1 - shareFromInner);
      return `${(x + nx * offset).toFixed(1)} ${(y + ny * offset).toFixed(1)}`;
    });
  const outer = edge(1).reverse().join("L");

  let start = 0;
  return RIBBON_STRIPES.map(({ color, share }) => {
    const d = `M${edge(start).join("L")}L${outer}Z`;
    start += share;
    return { color, d };
  });
}
