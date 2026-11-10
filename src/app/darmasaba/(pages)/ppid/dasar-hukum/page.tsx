'use client'
import stateDasarHukum from '@/app/admin/(dashboard)/_state/ppid/dasar_hukum/dasarHukum'
import { useShallowEffect } from '@mantine/hooks'
import { useState } from 'react'
import { useProxy } from 'valtio/utils'
import { PpidPage } from '../_com/PpidPage'
import { PpidSectionsSkeleton } from '../_com/PpidSectionsSkeleton'
import s from '../_com/ppid-sections.module.css'
import { DASAR_HUKUM_TEXT } from './_com/dasar-hukum.text'

/** Baris tunggal dasar hukum PPID di CMS. */
const DASAR_HUKUM_ID = '1'

/** Halaman publik Dasar Hukum PPID: subjudul dan daftar peraturan (isi dari CMS). */
export default function Page() {
  const state = useProxy(stateDasarHukum)
  const [loaded, setLoaded] = useState(false)

  useShallowEffect(() => {
    // Loader menangkap galatnya sendiri (data tetap null) — finally hanya menandai selesai.
    void state.findById.load(DASAR_HUKUM_ID).finally(() => setLoaded(true))
  }, [])

  const data = state.findById.data

  let content
  if (data) {
    content = (
      <div className={s.sections}>
        <section className={s.section} aria-labelledby="ppid-dasar-hukum">
          <h2 id="ppid-dasar-hukum" className={s.sectionLabel} dangerouslySetInnerHTML={{ __html: data.judul }} />
          <div className={s.body} dangerouslySetInnerHTML={{ __html: data.content }} />
        </section>
      </div>
    )
  } else if (loaded) {
    content = <p className={s.empty}>{DASAR_HUKUM_TEXT.empty}</p>
  } else {
    content = <PpidSectionsSkeleton label={DASAR_HUKUM_TEXT.loading} />
  }

  return (
    <PpidPage title={DASAR_HUKUM_TEXT.title} lead={DASAR_HUKUM_TEXT.lead}>
      {content}
    </PpidPage>
  )
}
