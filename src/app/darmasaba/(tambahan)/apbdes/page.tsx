'use client'

import BackButton from '../../(pages)/pemerintahan/layanan/_com/BackButto'
import { APBDES_BRAND_VARS } from '../../_com/main-page/apbdes/apbdes.meta'
import s from '../../_com/main-page/apbdes/apbdes.module.css'
import { APBDES_TEXT } from '../../_com/main-page/apbdes/apbdes.text'
import { ApbdesBody } from '../../_com/main-page/apbdes/components/ApbdesBody'
import { useApbdesData } from '../../_com/main-page/apbdes/use-apbdes-data'

/** Halaman detail APBDes: ringkasan, grafik, rincian lengkap (dengan selisih), dan dokumen per tahun. */
function Page() {
  const data = useApbdesData()

  return (
    <section className={`${s.section} ${s.page}`} style={APBDES_BRAND_VARS} aria-labelledby="apbdes-page-title">
      <div className={s.inner}>
        <div className={s.back}>
          <BackButton />
        </div>
        <header className={s.header}>
          <h1 id="apbdes-page-title" className={s.title}>
            {APBDES_TEXT.pageTitle}
          </h1>
          <p className={s.lead}>{APBDES_TEXT.pageLead}</p>
        </header>

        <ApbdesBody data={data} variant="full" />
      </div>
    </section>
  )
}

export default Page
