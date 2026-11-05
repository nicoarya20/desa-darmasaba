/*
 * Memutar timeline splash pada elemen splash (sisi DOM; timeline-nya data murni).
 * Dipanggil dari useLayoutEffect; fungsi kembalian membersihkan semuanya (unmount /
 * StrictMode dev) tanpa menandai splash sudah dilihat.
 */
import { markGateSplashSeen } from "./gate-splash.session";
import { buildIntroTimeline, buildReducedTimeline, buildWaterLoops, type GatePart, type GateStep } from "./gate-splash.timeline";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}

/** Putar splash pada `root`; kembalikan fungsi cleanup. */
export function playGateSplash(root: HTMLElement): () => void {
  // CSS failsafe (lihat .root di CSS) memudarkan splash bila JS tak pernah jalan.
  // Kalau hidrasi baru tiba setelah failsafe selesai, jangan munculkan splash lagi.
  const failsafe = root.getAnimations();
  if (failsafe.some((a) => a.playState === "finished")) {
    markGateSplashSeen();
    return () => {};
  }
  failsafe.forEach((a) => a.cancel());

  let disposed = false;
  let started = false;
  const running: Animation[] = [];
  const loops: Animation[] = [];

  const elementsOf = (part: GatePart): Element[] =>
    part === "root" ? [root] : Array.from(root.querySelectorAll(`[data-part="${part}"]`));
  const apply = (steps: GateStep[], bucket: Animation[]) =>
    steps.forEach((step) => elementsOf(step.part).forEach((el) => bucket.push(el.animate(step.keyframes, step.options))));

  // Klik/tap/Escape = lewati. Animasi berulang (air) tak bisa finish(), jadi disimpan terpisah.
  const skip = () => (started ? running.forEach((a) => a.finish()) : finish());
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") skip();
  };
  // Splash menutupi layar: cegah halaman di belakangnya ikut ter-scroll. Tanpa overflow:hidden
  // pada <html>, agar scrollbar tak hilang-muncul dan menggeser layout saat splash pudar.
  const blockScroll = (e: Event) => e.preventDefault();
  const onVisible = () => {
    if (document.visibilityState !== "visible") return;
    document.removeEventListener("visibilitychange", onVisible);
    start();
  };

  root.addEventListener("click", skip);
  root.addEventListener("wheel", blockScroll, { passive: false });
  root.addEventListener("touchmove", blockScroll, { passive: false });
  window.addEventListener("keydown", onKey);

  function teardown() {
    disposed = true;
    [...running, ...loops].forEach((a) => a.cancel());
    root.removeEventListener("click", skip);
    root.removeEventListener("wheel", blockScroll);
    root.removeEventListener("touchmove", blockScroll);
    window.removeEventListener("keydown", onKey);
    document.removeEventListener("visibilitychange", onVisible);
  }

  function finish() {
    if (disposed) return;
    teardown();
    markGateSplashSeen();
  }

  function run() {
    const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (!reduce) apply(buildWaterLoops(), loops);
    const gate = root.querySelector('[data-part="gate-l"]');
    const steps = reduce
      ? buildReducedTimeline()
      : buildIntroTimeline({ viewportWidth: window.innerWidth, gateWidth: gate?.getBoundingClientRect().width ?? 0 });
    apply(steps, running);
    started = true;

    const fade = running.find((a) => (a.effect as KeyframeEffect | null)?.target === root);
    if (!fade) throw new Error("Timeline splash tidak punya langkah 'root' (fade keluar)");
    fade.finished.then(finish, (e: unknown) => {
      if (isAbortError(e)) return; // dibatalkan oleh cleanup
      console.error("Animasi splash gerbang gagal, halaman langsung ditampilkan:", e);
      finish();
    });
  }

  function start() {
    if (disposed) return;
    try {
      run();
    } catch (e) {
      // Jangan biarkan splash menutupi halaman bila animasi gagal dibuat.
      console.error("Splash gerbang gagal diputar, halaman langsung ditampilkan:", e);
      finish();
    }
  }

  // Mulai setelah logo siap & tab terlihat — kalau tidak, bagian awal terlewat tanpa terlihat.
  const logo = root.querySelector("img");
  const logoReady = logo
    ? logo.decode().catch((e: unknown) => console.warn("Logo splash gagal di-decode, animasi tetap jalan:", e))
    : Promise.resolve();
  logoReady.then(() => {
    if (disposed) return;
    if (document.visibilityState === "visible") start();
    else document.addEventListener("visibilitychange", onVisible);
  });

  return () => {
    if (!disposed) teardown();
  };
}
