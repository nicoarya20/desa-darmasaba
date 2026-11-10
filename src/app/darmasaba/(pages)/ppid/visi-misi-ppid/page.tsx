'use client'
import stateVisiMisiPPID from '@/app/admin/(dashboard)/_state/ppid/visi_misi_ppid/visimisiPPID'
import { useShallowEffect } from '@mantine/hooks'
import { useState } from 'react'
import { useProxy } from 'valtio/utils'
import { PpidPage } from '../_com/PpidPage'
import { PpidSectionsSkeleton } from '../_com/PpidSectionsSkeleton'
import s from '../_com/ppid-sections.module.css'
import { VisiMisiContent } from './_com/VisiMisiContent'
import { VISI_MISI_TEXT } from './_com/visi-misi.text'

/** Baris tunggal visi-misi PPID di CMS. */
const VISI_MISI_ID = '1'

/** Halaman publik Visi dan Misi PPID: memuat visi dan misi dari CMS lalu menyerahkannya ke `VisiMisiContent`. */
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
    content = <VisiMisiContent visi={data.visi} misi={data.misi} />
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
