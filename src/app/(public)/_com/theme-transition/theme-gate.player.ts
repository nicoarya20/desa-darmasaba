/*
 * Memutar transisi tema Candi Bentar pada elemen overlay (sisi DOM; timeline-nya data murni).
 * Dipanggil dari useLayoutEffect setelah overlay tampil (data-playing); fungsi kembalian membatalkan semuanya.
 */
import { buildWaterLoops } from "../splash/gate-splash.timeline";
import { buildThemeGateTimeline, rootFadeResumeTime, type ThemeGateMetrics, type ThemeGateStep } from "./theme-gate.timeline";

export interface ThemeGateCallbacks {
  /** Langit sudah opak penuh: tukar tema halaman di baliknya. Dipanggil tepat sekali. */
  onSwap: () => void;
  /** Transisi selesai (atau gagal dan tema sudah ditukar): overlay boleh disembunyikan. */
  onDone: () => void;
}

/** Bawaan bila token adegan tak terbaca (= splash siang). */
const RIM_FALLBACK = { enter: 0.9, rest: 0.55 } as const;

type AnyStep = Pick<ThemeGateStep, "keyframes" | "options"> & { part: string };

function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}

/** Token angka dari modul seni; token kosong = fallback (bukan error), token rusak = error. */
function readNumberToken(style: CSSStyleDeclaration, name: string, fallback: number): number {
  const raw = style.getPropertyValue(name).trim();
  if (raw === "") return fallback;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) throw new Error(`Token ${name} bukan angka: "${raw}"`);
  return n;
}

function widthOf(root: HTMLElement, part: string): number {
  const el = root.querySelector(`[data-part~="${part}"]`);
  if (!el) throw new Error(`Elemen transisi tema data-part~="${part}" tidak ditemukan`);
  return el.getBoundingClientRect().width;
}

/** Ukur SEBELUM animasi dipasang (fill "both" langsung menimpa nilai komputasi). */
function measure(root: HTMLElement): ThemeGateMetrics {
  const style = getComputedStyle(root);
  return {
    viewportWidth: window.innerWidth,
    gateWidth: widthOf(root, "gate-l"),
    glowWidth: widthOf(root, "glow"),
    rim: {
      enter: readNumberToken(style, "--tt-rim-opacity-enter", RIM_FALLBACK.enter),
      rest: readNumberToken(style, "--tt-rim-opacity", RIM_FALLBACK.rest),
    },
  };
}

/** Putar transisi pada `root`; kembalikan fungsi cleanup. */
export function playThemeGate(root: HTMLElement, { onSwap, onDone }: ThemeGateCallbacks): () => void {
  let disposed = false;
  let swapped = false;
  const all: Animation[] = [];

  const elementsOf = (part: string): Element[] =>
    part === "root" ? [root] : Array.from(root.querySelectorAll(`[data-part~="${part}"]`));
  const apply = (step: AnyStep): Animation[] => {
    const els = elementsOf(step.part);
    if (els.length === 0) throw new Error(`Elemen transisi tema untuk part "${step.part}" tidak ditemukan`);
    const anims = els.map((el) => el.animate(step.keyframes, step.options));
    all.push(...anims);
    return anims;
  };

  const swap = () => {
    if (swapped || disposed) return;
    swapped = true;
    onSwap();
  };
  // Gagal di tengah jalan: jangan biarkan overlay menutupi halaman, dan tema tetap berganti.
  const fail = (e: unknown) => {
    if (disposed || isAbortError(e)) return;
    console.error("Transisi tema Candi Bentar gagal, tema langsung ditukar:", e);
    swap();
    onDone();
  };

  // Overlay menutupi layar: halaman di belakangnya tak ikut ter-scroll (tanpa overflow:hidden pada <html>,
  // agar scrollbar tak hilang-muncul dan menggeser layout). Klik ditangkap overlay itu sendiri.
  const blockScroll = (e: Event) => e.preventDefault();
  root.addEventListener("wheel", blockScroll, { passive: false });
  root.addEventListener("touchmove", blockScroll, { passive: false });

  try {
    const metrics = measure(root);
    buildWaterLoops().forEach(apply);
    const steps = buildThemeGateTimeline(metrics).map((step) => ({ step, anims: apply(step) }));

    const swapStep = steps.find((s) => s.step.swap);
    if (!swapStep) throw new Error("Timeline transisi tema tak punya langkah penukar tema (langit)");
    // Jam transisi: animasi yang tak pernah diendapkan dan berjalan sejak awal (adegan, fill forwards).
    const clock = steps.find((s) => s.step.part === "scene")?.anims[0];
    if (!clock) throw new Error("Timeline transisi tema tak punya langkah adegan (jam transisi)");

    // Pudar root ditahan sampai tema tertukar dan satu frame bertema baru sudah dilukis (lihat rootFadeResumeTime).
    const held = steps.filter((s) => s.step.holdUntilSwap);
    held.forEach((s) => s.anims.forEach((a) => a.pause()));
    const release = () => {
      if (disposed) return;
      const now = Number(document.timeline.currentTime ?? 0);
      const elapsed = Number(clock.currentTime ?? 0);
      for (const { step, anims } of held) {
        const at = rootFadeResumeTime(elapsed, Number(step.options.delay ?? 0));
        // startTime (bukan currentTime + play()): langsung berjalan tanpa fase pending, jadi saat tepat waktu
        // jamnya sama persis dengan adegan (play() tertinggal satu frame).
        anims.forEach((a) => (a.startTime = now - at));
      }
    };
    const swapReady = Promise.all(swapStep.anims.map((a) => a.finished)).then(() => {
      swap();
      // setColorScheme menulis atribut sinkron; rAF pertama jatuh SEBELUM frame bertema baru dihasilkan,
      // rAF kedua sesudahnya. Baru setelah itu halaman boleh terlihat.
      requestAnimationFrame(() => requestAnimationFrame(release));
    });

    // Endapkan: nilai akhirnya = nilai CSS, jadi cancel tak mengubah tampilan tapi layernya kembali biasa
    // sebelum zoom T4 (beban setara splash). Penolakan (AbortError saat cleanup) ditangani `done` di bawah.
    for (const { step, anims } of steps) {
      if (!step.settle) continue;
      const group = step.settle === "part" ? steps.filter((s) => s.step.part === step.part).flatMap((s) => s.anims) : anims;
      Promise.all(anims.map((a) => a.finished)).then(() => group.forEach((a) => a.cancel()), fail);
    }

    const done = steps.flatMap((s) => s.anims.map((a) => a.finished));
    Promise.all([swapReady, ...done]).then(() => {
      if (!disposed) onDone();
    }, fail);
  } catch (e) {
    fail(e);
  }

  return () => {
    disposed = true;
    all.forEach((a) => a.cancel());
    root.removeEventListener("wheel", blockScroll);
    root.removeEventListener("touchmove", blockScroll);
  };
}
