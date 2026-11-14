/**
 * Daftar "Baru diputar": id lagu terbaru dulu, unik, maks RECENT_MAX, disimpan di localStorage.
 * Fungsi murni + pembungkus penyimpanan yang aman di SSR / mode privat (akses storage bisa melempar).
 */
export const RECENT_STORAGE_KEY = 'musik-desa:recent';
export const RECENT_MAX = 20;

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

/** Baca isi mentah storage menjadi daftar id; JSON rusak / bukan array → []. */
export function parseRecentIds(raw: string | null, max: number = RECENT_MAX): string[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Isi storage rusak (diedit manual / versi lama): riwayat dianggap kosong, akan ditimpa saat lagu berikutnya diputar.
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const ids = parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
  return [...new Set(ids)].slice(0, max);
}

/** Taruh id di depan, buang duplikatnya, potong ke `max`. */
export function pushRecentId(ids: readonly string[], id: string, max: number = RECENT_MAX): string[] {
  return [id, ...ids.filter((x) => x !== id)].slice(0, max);
}

/** localStorage browser, atau null di server. Akses properti bisa melempar (cookie diblokir) → ditangani pemanggil. */
function browserStorage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

/** Baca riwayat dari storage; storage tak tersedia / melempar → [] dengan peringatan berkonteks. */
export function readRecentIds(getStorage: () => ReadableStorage | null = browserStorage): string[] {
  try {
    const storage = getStorage();
    return storage ? parseRecentIds(storage.getItem(RECENT_STORAGE_KEY)) : [];
  } catch (error) {
    console.warn(`Musik Desa: riwayat "Baru diputar" tidak bisa dibaca dari localStorage (${String(error)}).`);
    return [];
  }
}

/** Simpan riwayat; gagal (kuota penuh / mode privat) → peringatan, daftar di memori tetap jalan. */
export function writeRecentIds(ids: readonly string[], getStorage: () => WritableStorage | null = browserStorage): void {
  try {
    getStorage()?.setItem(RECENT_STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    console.warn(`Musik Desa: riwayat "Baru diputar" tidak bisa disimpan ke localStorage (${String(error)}).`);
  }
}
