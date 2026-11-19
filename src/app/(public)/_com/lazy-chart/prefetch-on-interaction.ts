/** Peristiwa yang menandakan pengunjung mulai berinteraksi (gulir, sentuh, klik, tombol). */
export const INTERACTION_EVENTS = ["scroll", "pointerdown", "touchstart", "keydown"] as const;

type Target = Pick<EventTarget, "addEventListener" | "removeEventListener">;

/**
 * Menjalankan `task` tepat sekali pada interaksi pertama pengunjung, lalu berhenti mendengarkan. Mengembalikan fungsi
 * pembatal. Dipakai untuk mengunduh kode grafik lebih awal: tanpa interaksi (mis. uji Lighthouse) tidak ada unduhan
 * tambahan sehingga TBT awal tidak naik, sedangkan pengunjung yang menggulir sudah punya kodenya saat grafik mendekat.
 */
export function runOnFirstInteraction(task: () => void, target: Target = window): () => void {
  const stop = () => INTERACTION_EVENTS.forEach((name) => target.removeEventListener(name, onFirst));
  function onFirst() {
    stop();
    task();
  }
  INTERACTION_EVENTS.forEach((name) => target.addEventListener(name, onFirst, { passive: true }));
  return stop;
}
