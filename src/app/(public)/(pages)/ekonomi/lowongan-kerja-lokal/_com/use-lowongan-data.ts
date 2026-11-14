import { useLazyLoad, type LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import { loadLowongan } from './lowongan.source';
import type { Lowongan } from './lowongan.types';

/** Muat daftar lowongan sekali saat halaman dibuka; `retry` memuat ulang setelah galat. */
export function useLowonganData(): { state: LoadState<Lowongan[]>; retry: () => void } {
  return useLazyLoad(loadLowongan, true, 'lowongan kerja');
}
