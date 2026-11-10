'use client'
import stateVisiMisiPPID from '@/app/admin/(dashboard)/_state/ppid/visi_misi_ppid/visimisiPPID'
import { useShallowEffect } from '@mantine/hooks'
import { useState } from 'react'
import { useProxy } from 'valtio/utils'
import { PpidPage } from '../_com/PpidPage'
import { PpidSectionsSkeleton } from '../_com/PpidSectionsSkeleton'
import s from '../_com/ppid-sections.module.css'
import { VISI_MISI_TEXT } from './_com/visi-misi.text'

/** Baris tunggal visi-misi PPID di CMS. */
const VISI_MISI_ID = '1'

/** Halaman publik Visi dan Misi PPID: moto, visi, dan daftar misi bernomor (isi dari CMS). */
export default function Page() {
  const state = useProxy(stateVisiMisiPPID)
  const [loaded, setLoaded] = useState(false)

  useShallowEffect(() => {
    // Loader menangkap galatnya sendiri (data tetap null) — finally hanya menandai selesai.
    void state.findById.load(VISI_MISI_ID).finally(() => setLoaded(true))
  }, [])

  const data = state.findById.data

  let content
  if (data) {
    content = (
      <div className={s.sections}>
        <section className={s.section} aria-labelledby="ppid-moto">
          <h2 id="ppid-moto" className={s.sectionTitle}>{VISI_MISI_TEXT.moto}</h2>
          <p className={`${s.body} ${s.statement}`}>{VISI_MISI_TEXT.motoStatement}</p>
        </section>
        <section className={s.section} aria-labelledby="ppid-visi">
          <h2 id="ppid-visi" className={s.sectionTitle}>{VISI_MISI_TEXT.visi}</h2>
          <div className={s.body} dangerouslySetInnerHTML={{ __html: data.visi }} />
        </section>
        <section className={s.section} aria-labelledby="ppid-misi">
          <h2 id="ppid-misi" className={s.sectionTitle}>{VISI_MISI_TEXT.misi}</h2>
          <div className={s.body} dangerouslySetInnerHTML={{ __html: data.misi }} />
        </section>
      </div>
    )
  } else if (loaded) {
    content = <p className={s.empty}>{VISI_MISI_TEXT.empty}</p>
  } else {
    content = <PpidSectionsSkeleton label={VISI_MISI_TEXT.loading} rows={6} />
  }

  return (
    <PpidPage title={VISI_MISI_TEXT.title} lead={VISI_MISI_TEXT.lead}>
      {content}
    </PpidPage>
  )
}
