'use client'

import apbdesState from '@/app/admin/(dashboard)/_state/landing-page/apbdes'
import colors from '@/con/colors'
import { SegmentedControl } from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import Link from 'next/link'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useSnapshot } from 'valtio'

import { listYears, summarizeApbdes } from './apbdes.logic'
import s from './apbdes.module.css'
import { APBDES_TEXT } from './apbdes.text'
import { ApbdesChart } from './components/ApbdesChart'
import { ApbdesDetail } from './components/ApbdesDetail'
import { ApbdesSkeleton } from './components/ApbdesSkeleton'
import { ApbdesSummary } from './components/ApbdesSummary'
import type { APBDes } from './types/apbdes'

const DETAIL_HREF = '/darmasaba/apbdes'

const BRAND_VARS = {
  '--brand': colors['blue-button'],
  '--brand-hover': colors['blue-button-6'],
} as CSSProperties

/** Section beranda: ringkasan, grafik, dan rincian APBDes per tahun. */
function Apbdes() {
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
  const hasItems = (current?.items?.length ?? 0) > 0

  return (
    <section className={s.section} style={BRAND_VARS} aria-labelledby="apbdes-title">
      <div className={s.inner}>
        <header className={s.header}>
          <h2 id="apbdes-title" className={s.title}>
            {APBDES_TEXT.title}
          </h2>
          <p className={s.lead}>{APBDES_TEXT.lead}</p>
        </header>

        {list === null ? (
          <ApbdesSkeleton />
        ) : year === null ? (
          <p className={s.empty}>{APBDES_TEXT.emptyAll}</p>
        ) : (
          <>
            <div className={s.years}>
              {years.length > 1 ? (
                <SegmentedControl
                  aria-label={APBDES_TEXT.yearLabel}
                  radius="xl"
                  size="md"
                  value={String(year)}
                  onChange={(v) => setPickedYear(Number(v))}
                  data={years.map(String)}
                />
              ) : (
                <p className={s.yearCaption}>{APBDES_TEXT.singleYear(year)}</p>
              )}
            </div>

            {/* key=tahun: konten dipasang ulang agar animasi masuk berjalan tiap ganti tahun */}
            <div key={year} className={s.content}>
              {hasItems ? (
                <>
                  <ApbdesSummary categories={categories} />
                  <ApbdesChart categories={categories} tahun={year} />
                  <ApbdesDetail categories={categories} />
                </>
              ) : (
                <p className={s.empty}>{APBDES_TEXT.emptyYear(year)}</p>
              )}
            </div>
          </>
        )}

        <div className={s.cta}>
          <Link href={DETAIL_HREF} className={s.ctaLink}>
            {APBDES_TEXT.cta}
            <IconChevronRight size={18} stroke={2} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Apbdes
