import { proxy } from "valtio";

type Opsi = {
  /** URL detail satu entri, mis. `(id) => \`/api/lingkungan/keteranganbankterdekat/${id}\``. */
  url: (id: string) => string;
  /** Konteks log, mis. "bank sampah". */
  tag: string;
};

/**
 * State detail satu entri domain (find-unique): `loading`, `gagal`, dan `data`. Respons untuk id yang sudah
 * tidak diminta (klik cepat antar entri) diabaikan. Satu instance per domain.
 */
export function createDetailEntriState<T>({ url, tag }: Opsi) {
  const state = proxy({
    /** Id yang terakhir diminta. */
    id: null as string | null,
    data: null as T | null,
    loading: false,
    gagal: false,
    async load(id: string) {
      state.id = id;
      state.loading = true;
      state.gagal = false;
      try {
        const res = await fetch(url(id));
        const json = (await res.json()) as { success?: boolean; data?: T };
        if (state.id !== id) return;
        const ok = res.ok && json.success && json.data;
        state.data = ok ? (json.data as T) : null;
        state.gagal = !ok;
      } catch (error) {
        console.error(`[${tag}] Gagal memuat detail ${id}:`, error);
        if (state.id !== id) return;
        state.data = null;
        state.gagal = true;
      } finally {
        if (state.id === id) state.loading = false;
      }
    },
  });
  return state;
}
