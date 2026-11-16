/**
 * Posisi & durasi lagu sebagai store eksternal (dibaca lewat useSyncExternalStore di `useMusicTime`).
 * 'timeupdate' berbunyi beberapa kali per detik; dengan store ini hanya komponen yang membaca waktu
 * yang render ulang, bukan semua konsumen useMusic().
 */
export type MusicTime = { readonly currentTime: number; readonly duration: number };

export const ZERO_TIME: MusicTime = Object.freeze({ currentTime: 0, duration: 0 });

export type MusicTimeStore = {
  getSnapshot: () => MusicTime;
  subscribe: (listener: () => void) => () => void;
  /** Ubah sebagian nilai; snapshot & pendengar hanya berganti bila nilainya benar-benar berubah. */
  set: (patch: Partial<MusicTime>) => void;
};

export function createMusicTimeStore(): MusicTimeStore {
  let snapshot = ZERO_TIME;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set: (patch) => {
      const next = { ...snapshot, ...patch };
      if (next.currentTime === snapshot.currentTime && next.duration === snapshot.duration) return;
      snapshot = next;
      listeners.forEach((listener) => listener());
    },
  };
}
