/*
 * Rencana animasi transisi tema Candi Bentar sebagai data murni (tanpa DOM) supaya bisa diuji.
 * Player (theme-gate.player.ts) memetakan `part` ke elemen yang atribut `data-part`-nya memuat kata itu
 * (`[data-part~="..."]`), jadi satu elemen boleh ikut beberapa langkah (mis. "wall wall-l").
 *
 * Alur (adegan = tema TUJUAN; ke gelap = malam, ke terang = siang):
 *   T1 Masuk   kelompok kiri (gerbang + tembok) meluncur dari luar layar kiri, kanan dari kanan. Belum ada latar.
 *   T2 Latar   langit, air + pantulan, cahaya, halo, bulan/bintang pudar masuk sampai opak.
 *   T3 Tukar   tema halaman ditukar TEPAT saat langit opak penuh (THEME_SWAP_MS); logo tampil lalu pamit.
 *   T4 Keluar  kamera menembus celah, sama dengan splash pembuka (PUSH + cahaya + root pudar).
 *
 * Batas performa (temuan uji di monitor 4K eksternal, 1920x1080 @2x; lihat gate-splash.timeline.ts): browser
 * me-raster layer yang dianimasikan pada skala MAKSIMAL animasinya, jadi zoom besar pada layer selayar penuh
 * melampaui memori GPU (gerbang/logo hilang, frame macet). Karena itu hanya SATU pembungkus adegan yang di-zoom,
 * paling jauh MAX_SCENE_SCALE; kesan menembus celah datang dari gerbang (elemen kecil) yang membesar & bergeser.
 * Supaya beban T4 setara splash, animasi masuk yang nilai akhirnya = nilai CSS "diendapkan" (`settle`: di-cancel
 * begitu selesai): saat zoom berjalan tak ada animasi opacity selayar penuh selain cahaya akhir & root.
 */
import { EASE_OUT, EASE_PUSH, GATE_PUSH_SCALE, GATE_PUSH_SHIFT_VW, MAX_SCENE_SCALE, wallShiftPx, type GateMetrics, type GateStep } from "../splash/gate-splash.timeline";

/** Durasi total transisi: 5 dtk (2026-11-18) dipersingkat ke 3 dtk atas masukan rekan tim user (2026-11-19). */
export const THEME_TRANSITION_TOTAL_MS = 3000;
/** Total prototipe; semua waktu di bawah ditulis pada skala ini lalu diskalakan ke THEME_TRANSITION_TOTAL_MS. */
const PROTOTYPE_TOTAL_MS = 3750;

const ms = (prototypeMs: number) => Math.round((prototypeMs * THEME_TRANSITION_TOTAL_MS) / PROTOTYPE_TOTAL_MS);
const span = (from: number, to: number) => ({ delay: ms(from), duration: ms(to) - ms(from) });

/** Fase dalam ms prototipe: [mulai, selesai]. */
const ENTER = [0, 1200] as const;
const BACKDROP_IN = [1200, 1800] as const;
const BRAND_IN = [1600, 2050] as const;
const BRAND_OUT = [2380, 2600] as const;
const PUSH_AT = [2600, 3500] as const;
const FLASH_AT = [3000, 3400] as const;
const ROOT_OUT = [3400, PROTOTYPE_TOTAL_MS] as const;

/** Tema halaman ditukar saat langit selesai pudar masuk (opak penuh, menutup seluruh layar). */
export const THEME_SWAP_MS = ms(BACKDROP_IN[1]);

export type ThemeTarget = "light" | "dark";
export type ThemeGateScene = "day" | "night";

/** Adegan mengikuti tema tujuan. */
export function sceneFor(target: ThemeTarget): ThemeGateScene {
  return target === "dark" ? "night" : "day";
}

/** Nilai kata di `data-part`; "root" = elemen overlay itu sendiri. */
export type ThemeGatePart =
  | "root"
  | "scene"
  | "sky"
  | "backdrop"
  | "side-l"
  | "side-r"
  | "gate-l"
  | "gate-r"
  | "rim"
  | "wall"
  | "wall-l"
  | "wall-r"
  | "glow"
  | "brand"
  | "flash";

/**
 * `settle`: "self" = cancel animasi ini begitu selesai (nilai akhirnya = nilai CSS);
 * "part" = begitu selesai, cancel SEMUA animasi pada part yang sama (logo setelah pamit).
 * `swap`: tema halaman ditukar saat langkah ini selesai.
 * `holdUntilSwap`: langkah ditahan (pause) sampai tema tertukar DAN satu frame bertema baru sudah dilukis,
 * lalu dilanjutkan dari rootFadeResumeTime(); lihat komentar di sana.
 */
export interface ThemeGateStep extends Omit<GateStep, "part"> {
  part: ThemeGatePart;
  settle?: "self" | "part";
  swap?: true;
  holdUntilSwap?: true;
}

export interface ThemeGateMetrics extends GateMetrics {
  /** Lebar render cahaya celah (px) sebelum animasi. */
  glowWidth: number;
  /** Opacity garis tepi: tegas selama pilar di atas halaman lama, lalu nilai adegan (token --tt-rim-opacity*). */
  rim: { enter: number; rest: number };
}

const FADE = "ease-in-out";
const OFF_L = "calc(-100% - 8px)"; // 1 lebar kelompok + sisa garis tepi non-scaling
const OFF_R = "calc(100% + 8px)";
const BRAND_POS = "translate(-50%,-50%)";
const FADE_IN: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];

/** Urutan lengkap T1-T4 (lihat komentar berkas). */
export function buildThemeGateTimeline(m: ThemeGateMetrics): ThemeGateStep[] {
  const enter = { ...span(...ENTER), easing: EASE_OUT, fill: "both" } as const;
  const backdrop = { ...span(...BACKDROP_IN), easing: FADE, fill: "both" } as const;
  const push = { ...span(...PUSH_AT), easing: EASE_PUSH, fill: "forwards" } as const;
  const rim: Keyframe[] = [{ opacity: m.rim.enter }, { opacity: m.rim.rest }];
  const shift = `${GATE_PUSH_SHIFT_VW}vw`;
  const wall = wallShiftPx(m);
  // Tepi dalam gerbang mundur (wall - (scale-1) x lebar gerbang) per sisi, linear terhadap progres yang sama
  // dengan gerbang, jadi cahaya melebar mengikuti celah dengan easing yang sama (zoom adegan berlaku seragam).
  const glow = 1 + (2 * (wall - (GATE_PUSH_SCALE - 1) * m.gateWidth)) / m.glowWidth;

  return [
    { part: "side-l", keyframes: [{ translate: `${OFF_L} 0` }, { translate: "0 0" }], options: enter, settle: "self" },
    { part: "side-r", keyframes: [{ translate: `${OFF_R} 0` }, { translate: "0 0" }], options: enter, settle: "self" },
    { part: "sky", keyframes: FADE_IN, options: backdrop, settle: "self", swap: true },
    { part: "backdrop", keyframes: FADE_IN, options: backdrop, settle: "self" },
    { part: "rim", keyframes: rim, options: backdrop, settle: "self" },
    { part: "wall", keyframes: rim, options: { ...backdrop, pseudoElement: "::before" }, settle: "self" },
    {
      part: "brand",
      keyframes: [
        { opacity: 0, filter: "blur(10px)", transform: `${BRAND_POS} scale(.94)` },
        { opacity: 1, filter: "blur(0)", transform: `${BRAND_POS} scale(1)` },
      ],
      options: { ...span(...BRAND_IN), easing: EASE_OUT, fill: "both" },
    },
    // fill "forwards": dengan "both" keyframe pertamanya (opacity 1) berlaku sejak t=0 dan menimpa fade-in.
    {
      part: "brand",
      keyframes: [
        { opacity: 1, transform: `${BRAND_POS} scale(1)` },
        { opacity: 0, transform: `${BRAND_POS} scale(1.06)` },
      ],
      options: { ...span(...BRAND_OUT), easing: "ease-in", fill: "forwards" },
      settle: "part",
    },
    { part: "scene", keyframes: [{ transform: "scale(1)" }, { transform: `scale(${MAX_SCENE_SCALE})` }], options: push },
    { part: "gate-l", keyframes: [{ translate: "0 0", scale: "1" }, { translate: `-${shift} 0`, scale: `${GATE_PUSH_SCALE}` }], options: push },
    { part: "gate-r", keyframes: [{ translate: "0 0", scale: "1" }, { translate: `${shift} 0`, scale: `${GATE_PUSH_SCALE}` }], options: push },
    { part: "wall-l", keyframes: [{ translate: "0 0", scale: "1 1" }, { translate: `${-wall}px 0`, scale: `1 ${GATE_PUSH_SCALE}` }], options: push },
    { part: "wall-r", keyframes: [{ translate: "0 0", scale: "1 1" }, { translate: `${wall}px 0`, scale: `1 ${GATE_PUSH_SCALE}` }], options: push },
    { part: "glow", keyframes: [{ scale: "1 1" }, { scale: `${glow} 1` }], options: push },
    // Seperti splash: cahaya penuh menyala sebelum PUSH selesai, root pudar setelah cahaya penuh.
    { part: "flash", keyframes: FADE_IN, options: { ...span(...FLASH_AT), easing: "ease-in", fill: "forwards" } },
    {
      part: "root",
      keyframes: [{ opacity: 1 }, { opacity: 0 }],
      options: { ...span(...ROOT_OUT), easing: "ease-out", fill: "forwards" },
      holdUntilSwap: true,
    },
  ];
}

/**
 * currentTime untuk melanjutkan pudar root yang ditahan, saat syarat "tema tertukar + sudah dilukis" terpenuhi
 * pada `elapsedMs` sejak transisi mulai.
 * Kenapa: pudar root berjalan di compositor, sedangkan restyle halaman ke tema baru di main thread. Kalau pudar
 * hanya dijadwalkan dengan ms, perangkat lambat (atau swap yang terlambat) bisa memperlihatkan raster halaman LAMA.
 * Tepat waktu (elapsed ≤ delay) → jadwal identik (pudar mulai di delay, total tetap); terlambat → pudar dimulai
 * sekarang dengan durasi penuh, sementara cahaya akhir (fill forwards) tetap opak menutup layar.
 */
export function rootFadeResumeTime(elapsedMs: number, fadeDelayMs: number): number {
  return Math.min(Math.max(0, elapsedMs), fadeDelayMs);
}

/** Waktu (ms) saat langkah selesai. */
export function stepEndMs(step: Pick<GateStep, "options">): number {
  return Number(step.options.delay ?? 0) + Number(step.options.duration ?? 0);
}
