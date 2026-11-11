/*
 * Rencana animasi splash Candi Bentar sebagai data murni (tanpa DOM) supaya bisa diuji.
 * Player (gate-splash.player.ts) memetakan `part` ke elemen ber-`data-part` yang sama.
 *
 * Batas performa (temuan uji di monitor 4K eksternal, 1920x1080 @2x): browser me-raster
 * layer yang dianimasikan pada skala MAKSIMAL animasinya. Zoom besar pada layer selayar
 * penuh membuat teksturnya melebihi memori GPU → gerbang/logo hilang & frame macet.
 * Karena itu adegan hanya di-zoom tipis (MAX_SCENE_SCALE); kesan "maju menembus celah"
 * datang dari gerbang (elemen kecil) yang membesar & bergeser keluar.
 */

/** Nilai `data-part` elemen splash; "root" = elemen splash itu sendiri. */
export type GatePart =
  | "root"
  | "scene"
  | "glow"
  | "brand"
  | "gate-l"
  | "gate-r"
  | "curtain-l"
  | "curtain-r"
  | "wall-l"
  | "wall-r"
  | "flash"
  | "ripple-a"
  | "ripple-b"
  | "reflection";

/** Satu animasi Web Animations API untuk semua elemen dengan `part` tersebut. */
export interface GateStep {
  part: GatePart;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

/** Ukuran yang hanya diketahui saat runtime. */
export interface GateMetrics {
  viewportWidth: number;
  /** Lebar render satu gerbang (px) sebelum animasi. */
  gateWidth: number;
}

export const EASE_OUT = "cubic-bezier(.22,1,.36,1)";
export const EASE_PUSH = "cubic-bezier(.55,0,.25,1)";

/** Zoom maksimal adegan selayar penuh (lihat catatan performa di atas). */
export const MAX_SCENE_SCALE = 1.25;
/** Gerbang membesar sekian kali dari tengah-bawah saat kamera menembus celah. */
export const GATE_PUSH_SCALE = 1.6;
/** Gerbang & tirai langit bergeser keluar sejauh ini (vw). */
export const GATE_PUSH_SHIFT_VW = 38;

const PUSH: KeyframeAnimationOptions = { delay: 1400, duration: 900, easing: EASE_PUSH, fill: "both" };
const BRAND_POS = "translate(-50%,-50%)";

/**
 * Pergeseran tembok (px) agar tetap menempel ke sisi luar gerbang: gerbang bergeser
 * GATE_PUSH_SHIFT_VW dan membesar dari tengah, sehingga sisi luarnya maju (scale-1)/2 x lebarnya.
 */
export function wallShiftPx({ viewportWidth, gateWidth }: GateMetrics): number {
  return (GATE_PUSH_SHIFT_VW / 100) * viewportWidth + ((GATE_PUSH_SCALE - 1) / 2) * gateWidth;
}

/** Urutan lengkap: cahaya menyala → logo tampil & pamit → kamera menembus celah → cahaya memenuhi layar → splash pudar. */
export function buildIntroTimeline(metrics: GateMetrics): GateStep[] {
  const shift = `${GATE_PUSH_SHIFT_VW}vw`;
  const wall = wallShiftPx(metrics);
  return [
    { part: "glow", keyframes: [{ opacity: 0 }, { opacity: 1 }], options: { duration: 900, easing: EASE_OUT, fill: "both" } },
    {
      part: "brand",
      keyframes: [
        { opacity: 0, filter: "blur(10px)", transform: `${BRAND_POS} scale(.94)` },
        { opacity: 1, filter: "blur(0)", transform: `${BRAND_POS} scale(1)` },
      ],
      options: { delay: 100, duration: 650, easing: EASE_OUT, fill: "both" },
    },
    // Animasi keluar memakai fill "forwards": dengan "both" keyframe pertamanya (opacity 1)
    // ikut berlaku sejak t=0 dan menimpa fade-in di atas.
    {
      part: "brand",
      keyframes: [
        { opacity: 1, transform: `${BRAND_POS} scale(1)` },
        { opacity: 0, transform: `${BRAND_POS} scale(1.06)` },
      ],
      options: { delay: 1350, duration: 250, easing: "ease-in", fill: "forwards" },
    },
    { part: "scene", keyframes: [{ transform: "scale(1)" }, { transform: `scale(${MAX_SCENE_SCALE})` }], options: PUSH },
    { part: "gate-l", keyframes: [{ translate: "0 0", scale: "1" }, { translate: `-${shift} 0`, scale: `${GATE_PUSH_SCALE}` }], options: PUSH },
    { part: "gate-r", keyframes: [{ translate: "0 0", scale: "1" }, { translate: `${shift} 0`, scale: `${GATE_PUSH_SCALE}` }], options: PUSH },
    { part: "curtain-l", keyframes: [{ translate: "0 0" }, { translate: `-${shift} 0` }], options: PUSH },
    { part: "curtain-r", keyframes: [{ translate: "0 0" }, { translate: `${shift} 0` }], options: PUSH },
    { part: "wall-l", keyframes: [{ translate: "0 0", scale: "1 1" }, { translate: `${-wall}px 0`, scale: `1 ${GATE_PUSH_SCALE}` }], options: PUSH },
    { part: "wall-r", keyframes: [{ translate: "0 0", scale: "1 1" }, { translate: `${wall}px 0`, scale: `1 ${GATE_PUSH_SCALE}` }], options: PUSH },
    { part: "flash", keyframes: [{ opacity: 0 }, { opacity: 1 }], options: { delay: 1800, duration: 400, easing: "ease-in", fill: "forwards" } },
    { part: "root", keyframes: [{ opacity: 1 }, { opacity: 0 }], options: { delay: 2200, duration: 350, easing: "ease-out", fill: "forwards" } },
  ];
}

/** Versi "kurangi animasi": tanpa gerak, hanya fade. */
export function buildReducedTimeline(): GateStep[] {
  return [
    { part: "glow", keyframes: [{ opacity: 0 }, { opacity: 1 }], options: { duration: 300, fill: "both" } },
    { part: "brand", keyframes: [{ opacity: 0 }, { opacity: 1 }], options: { duration: 300, fill: "both" } },
    { part: "root", keyframes: [{ opacity: 1 }, { opacity: 0 }], options: { delay: 900, duration: 300, fill: "forwards" } },
  ];
}

/**
 * Riak air & goyangan pantulan, berulang selama splash tampil. Riak digeser tepat satu
 * ukuran tile (lihat .rippleA/.rippleB di CSS) supaya loop mulus tanpa lompatan.
 */
export function buildWaterLoops(): GateStep[] {
  return [
    { part: "ripple-a", keyframes: [{ transform: "translate(0, 0)" }, { transform: "translate(160px, 18px)" }], options: { duration: 3400, iterations: Infinity } },
    { part: "ripple-b", keyframes: [{ transform: "translate(260px, 0)" }, { transform: "translate(0, 26px)" }], options: { duration: 5200, iterations: Infinity } },
    {
      part: "reflection",
      keyframes: [
        { translate: "0 0", scale: "1 1" },
        { translate: "3px 0", scale: "1.004 1.025" },
        { translate: "-2px 0", scale: "0.998 0.99" },
        { translate: "0 0", scale: "1 1" },
      ],
      options: { duration: 3200, iterations: Infinity, easing: "ease-in-out" },
    },
  ];
}

/** Waktu (ms) saat langkah terakhir yang berhingga selesai. */
export function timelineEndMs(steps: GateStep[]): number {
  return Math.max(0, ...steps.map((s) => Number(s.options.delay ?? 0) + Number(s.options.duration ?? 0)));
}
