import { useLazyLoad } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import { loadKeunggulan, loadRingkasan } from './beasiswa.source';

/** Data halaman Beasiswa: keunggulan & ringkasan dimuat terpisah agar satu galat tidak menahan yang lain. */
export function useBeasiswaData() {
  const keunggulan = useLazyLoad(loadKeunggulan, true, 'keunggulan program beasiswa');
  const ringkasan = useLazyLoad(loadRingkasan, true, 'ringkasan beasiswa');
  return { keunggulan, ringkasan };
}
