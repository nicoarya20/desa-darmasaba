import apbdesState from '@/app/admin/(dashboard)/_state/landing-page/apbdes'
import { useEffect, useMemo } from 'react'
import { useSnapshot } from 'valtio'

import { latestUpdate, pickLatestApbdes, summarizeApbdes } from './apbdes.logic'
import type { APBDes } from './types/apbdes'

/**
 * Data APBDes publik (beranda & halaman detail): hanya tahun terbaru yang punya rincian, ringkasan kategori, tanggal update.
 * `enabled` false menunda fetch (beranda: sampai section mendekati layar); halaman detail memakai bawaan true.
 */
export function useApbdesData(enabled = true) {
  const snap = useSnapshot(apbdesState.findMany)

  useEffect(() => {
    if (!enabled) return;
    // load() menangani error sendiri (data → [] + toast), jadi tidak perlu catch di sini.
    void apbdesState.findMany.load()
  }, [enabled])

  // Payload Prisma (include items + realisasiItems) berbentuk sama dengan tipe APBDes lokal.
  const list = snap.data as unknown as readonly APBDes[] | null
  const current = useMemo(() => pickLatestApbdes(list), [list])
  const year = current?.tahun ?? null
  const categories = useMemo(() => summarizeApbdes(current?.items ?? []), [current])
  const updated = useMemo(() => (current ? latestUpdate(current) : null), [current])
  const hasItems = (current?.items?.length ?? 0) > 0

  return { list, year, current, categories, updated, hasItems }
}
