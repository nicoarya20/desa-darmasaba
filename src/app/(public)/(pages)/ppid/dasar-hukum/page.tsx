'use client'
import stateDasarHukum from '@/app/admin/(dashboard)/_state/ppid/dasar_hukum/dasarHukum'
import stateDokumen from '@/app/admin/(dashboard)/_state/ppid/dasar_hukum/dokumenDasarHukum'
import { useShallowEffect } from '@mantine/hooks'
import { useState } from 'react'
import { useProxy } from 'valtio/utils'
import { PpidPage } from '../_com/PpidPage'
import { PpidSectionsSkeleton } from '../_com/PpidSectionsSkeleton'
import s from '../_com/ppid-sections.module.css'
import { DasarHukumSection } from './_com/DasarHukumSection'
import { DokumenDasarHukumSection } from './_com/DokumenDasarHukumSection'
import { DASAR_HUKUM_TEXT } from './_com/dasar-hukum.text'

/** Baris tunggal dasar hukum PPID di CMS. */
const DASAR_HUKUM_ID = '1'

/** Halaman publik Dasar Hukum PPID: daftar peraturan bernomor (isi dari CMS) dan daftar dokumen PDF yang bisa dilihat/diunduh. */
export default function Page() {
  const state = useProxy(stateDasarHukum)
  const dokumen = useProxy(stateDokumen)
  const [loaded, setLoaded] = useState(false)

  useShallowEffect(() => {
    // Loader menangkap galatnya sendiri (data tetap null/kosong) — finally hanya menandai selesai.
    void Promise.all([state.findById.load(DASAR_HUKUM_ID), dokumen.list.load()]).finally(() => setLoaded(true))
  }, [])

  const data = state.findById.data
  const daftarDokumen = dokumen.list.data

  let content
  if (data || daftarDokumen.length > 0) {
    content = (
      <div className={s.sections}>
        {data && <DasarHukumSection data={data} />}
        <DokumenDasarHukumSection items={daftarDokumen} />
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
