'use client'

import { IconChevronRight } from '@tabler/icons-react'
import Link from 'next/link'

import { APBDES_BRAND_VARS } from './apbdes.meta'
import s from './apbdes.module.css'
import { APBDES_TEXT } from './apbdes.text'
import { ApbdesBody } from './components/ApbdesBody'
import { useApbdesData } from './use-apbdes-data'

const DETAIL_HREF = '/apbdes'

/** Section beranda: ringkasan, grafik, dan rincian APBDes per tahun. */
function Apbdes() {
  const data = useApbdesData()

  return (
    <section className={s.section} style={APBDES_BRAND_VARS} aria-labelledby="apbdes-title">
      <div className={s.inner}>
        <header className={s.header}>
          <h2 id="apbdes-title" className={s.title}>
            {APBDES_TEXT.title}
          </h2>
          <p className={s.lead}>{APBDES_TEXT.lead}</p>
        </header>

        <ApbdesBody data={data} variant="compact" />

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
