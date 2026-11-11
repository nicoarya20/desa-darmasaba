import apbdesState from '@/app/admin/(dashboard)/_state/landing-page/apbdes'
import { useEffect, useMemo, useState } from 'react'
import { useSnapshot } from 'valtio'

import { latestUpdate, listYears, summarizeApbdes } from './apbdes.logic'
import type { APBDes } from './types/apbdes'

/** Data APBDes publik (beranda & halaman detail): tahun, APBDes terpilih, ringkasan kategori, tanggal update. */
export function useApbdesData() {
  const snap = useSnapshot(apbdesState.findMany)
  const [pickedYear, setPickedYear] = useState<number | null>(null)

  useEffect(() => {
    // load() menangani error sendiri (data → [] + toast), jadi tidak perlu catch di sini.
    void apbdesState.findMany.load()
  }, [])

  // Payload Prisma (include items + realisasiItems) berbentuk sama dengan tipe APBDes lokal.
  const list = snap.data as unknown as readonly APBDes[] | null
  const years = useMemo(() => listYears(list ?? []), [list])
  const year = pickedYear ?? years[0] ?? null
  const current = list?.find((a) => a.tahun === year) ?? null
  const categories = useMemo(() => summarizeApbdes(current?.items ?? []), [current])
  const updated = useMemo(() => (current ? latestUpdate(current) : null), [current])
  const hasItems = (current?.items?.length ?? 0) > 0

  return { list, years, year, setYear: setPickedYear, current, categories, updated, hasItems }
}
