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

export type WheelState = { acc: number; locked: boolean; lastAt: number };

export const INITIAL_WHEEL_STATE: WheelState = { acc: 0, locked: false, lastAt: -Infinity };

/**
 * Satu gerakan dua jari (beserta momentumnya) = maksimal 1 kartu.
 * deltaX positif (jari ke kiri, konten bergulir ke kanan) = maju.
 */
export function reduceWheel(
  state: WheelState,
  deltaX: number,
  now: number,
  threshold = WHEEL_THRESHOLD_PX,
  quietMs = WHEEL_QUIET_MS,
): { state: WheelState; step: -1 | 0 | 1 } {
  const fresh = now - state.lastAt > quietMs;
  const base = fresh ? { acc: 0, locked: false } : state;
  if (base.locked) return { state: { ...base, lastAt: now }, step: 0 };
  const acc = base.acc + deltaX;
  if (Math.abs(acc) >= threshold) {
    return { state: { acc: 0, locked: true, lastAt: now }, step: acc > 0 ? 1 : -1 };
  }
  return { state: { acc, locked: false, lastAt: now }, step: 0 };
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
