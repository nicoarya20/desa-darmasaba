/** Helper murni galeri loop Layanan & Potensi (tanpa React, dites di __tests__/api). */

/** Jeda antar langkah otomatis (ms). */
export const AUTO_ADVANCE_MS = 5000;

/** Jumlah kartu minimal di tiap sisi indeks aktif agar tepi track tidak pernah terlihat. */
export const LOOP_BUFFER = 4;

/** Jarak geser minimal (px) agar swipe dianggap pindah kartu. */
export const SWIPE_THRESHOLD_PX = 50;

/** Jarak geser (px) yang membatalkan klik kartu (geser, bukan tap). */
export const DRAG_CLICK_TOLERANCE_PX = 8;

/** Banyak salinan item di tiap sisi salinan tengah. */
function copiesPerSide(count: number, buffer: number): number {
  return Math.ceil(buffer / count);
}

/** Indeks track awal (item pertama di salinan tengah); 0 bila item ≤ 1 (tanpa loop). */
export function loopStart(count: number, buffer = LOOP_BUFFER): number {
  if (count <= 1) return 0;
  return copiesPerSide(count, buffer) * count;
}

/** Item diulang agar track bisa digeser tanpa ujung; item ≤ 1 dikembalikan apa adanya. */
export function buildLoopTrack<T>(items: readonly T[], buffer = LOOP_BUFFER): T[] {
  if (items.length <= 1) return [...items];
  const total = copiesPerSide(items.length, buffer) * 2 + 1;
  return Array.from({ length: total }, () => items).flat();
}

/** Posisi item asli (0..count-1) dari indeks track. */
export function realIndex(trackIndex: number, count: number): number {
  if (count <= 0) return 0;
  return ((trackIndex % count) + count) % count;
}

/** Kembalikan indeks track ke salinan tengah dengan item yang sama. */
export function normalizeLoopIndex(trackIndex: number, count: number, buffer = LOOP_BUFFER): number {
  if (count <= 1) return 0;
  return loopStart(count, buffer) + realIndex(trackIndex, count);
}

/** Arah langkah dari jarak geser horizontal: geser ke kiri = maju (+1). */
export function swipeStep(deltaX: number, threshold = SWIPE_THRESHOLD_PX): -1 | 0 | 1 {
  if (deltaX <= -threshold) return 1;
  if (deltaX >= threshold) return -1;
  return 0;
}

/** Akumulasi geser trackpad (px) sebelum pindah 1 kartu. */
export const WHEEL_THRESHOLD_PX = 40;

/** Jeda tanpa event wheel (ms) yang menandai akhir satu gerakan (termasuk momentum). */
export const WHEEL_QUIET_MS = 160;

/**
 * Deteksi gerakan baru saat event masih beruntun. Momentum macOS selalu melemah dan tak pernah berbalik
 * arah, jadi gerakan baru = (a) sempat melemah ≤ LOW lalu naik ≥ RISE, (b) naik > RISE_FACTOR× event
 * sebelumnya dan ≥ RISE, atau (c) berbalik arah dengan |delta| ≥ RISE.
 */
export const WHEEL_GESTURE = { lowPx: 4, risePx: 10, riseFactor: 2 } as const;

export type WheelState = {
  acc: number;
  locked: boolean;
  lastAt: number;
  /** |delta| event sebelumnya dan |delta| terkecil sejak terkunci. */
  lastAbs: number;
  minAbs: number;
  /** Arah langkah terakhir (1 maju, -1 mundur, 0 belum ada). */
  dir: -1 | 0 | 1;
};

export const INITIAL_WHEEL_STATE: WheelState = {
  acc: 0,
  locked: false,
  lastAt: -Infinity,
  lastAbs: 0,
  minAbs: Infinity,
  dir: 0,
};

function isNewGesture(state: WheelState, deltaX: number): boolean {
  const abs = Math.abs(deltaX);
  const { lowPx, risePx, riseFactor } = WHEEL_GESTURE;
  if (abs < risePx) return false;
  const reversed = state.dir !== 0 && Math.sign(deltaX) !== state.dir;
  return reversed || state.minAbs <= lowPx || abs > state.lastAbs * riseFactor;
}

/**
 * Satu gerakan dua jari (beserta momentumnya) = maksimal 1 kartu. Kunci dibuka oleh jeda hening ATAU
 * deteksi gerakan baru (agar geser cepat beruntun tetap jalan walau momentum belum habis).
 * deltaX positif (jari ke kiri, konten bergulir ke kanan) = maju.
 */
export function reduceWheel(
  state: WheelState,
  deltaX: number,
  now: number,
  threshold = WHEEL_THRESHOLD_PX,
  quietMs = WHEEL_QUIET_MS,
): { state: WheelState; step: -1 | 0 | 1 } {
  const abs = Math.abs(deltaX);
  const unlocked = now - state.lastAt > quietMs || (state.locked && isNewGesture(state, deltaX));
  const base: WheelState = unlocked ? { ...INITIAL_WHEEL_STATE, dir: state.dir } : state;

  if (base.locked) {
    return {
      state: { ...base, lastAt: now, lastAbs: abs, minAbs: Math.min(base.minAbs, abs) },
      step: 0,
    };
  }
  const acc = base.acc + deltaX;
  if (Math.abs(acc) >= threshold) {
    const step = acc > 0 ? 1 : -1;
    return { state: { acc: 0, locked: true, lastAt: now, lastAbs: abs, minAbs: abs, dir: step }, step };
  }
  return { state: { ...base, acc, lastAt: now, lastAbs: abs }, step: 0 };
}

/** Geometri titik indikator (px): titik biasa, titik aktif (progress bar), jarak antar titik. */
export const DOT = { size: 6, activeWidth: 26, gap: 10 } as const;

/** Banyak titik terlihat di tiap sisi titik aktif (2 → total 5 titik). */
export const DOT_WINDOW = 2;

/** Posisi tengah titik relatif ke titik aktif (0 = tengah strip). */
export function dotCenterX(offset: number): number {
  if (offset === 0) return 0;
  const steps = Math.abs(offset) - 1;
  const distance = DOT.activeWidth / 2 + DOT.gap + DOT.size / 2 + steps * (DOT.size + DOT.gap);
  return Math.sign(offset) * distance;
}
