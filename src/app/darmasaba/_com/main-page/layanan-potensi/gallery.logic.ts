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
