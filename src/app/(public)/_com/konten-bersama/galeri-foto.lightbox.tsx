'use client'
import type { FotoGaleriItem } from '@/lib/konten-bersama/konten-bersama.types'
import { Image, Modal, Text } from '@mantine/core'
import { useReducedMotion, useWindowEvent } from '@mantine/hooks'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { altFoto, langkahFoto } from './galeri-foto.logic'
import s from './galeri-foto.module.css'
import { GALERI_FOTO_TEXT as T } from './galeri-foto.text'

type Props = {
  foto: readonly FotoGaleriItem[]
  /** Index foto yang tampil; null = modal tertutup. */
  index: number | null
  /** Dipanggil dengan index baru (klik thumbnail, tombol, ←/→) atau null saat modal ditutup. */
  onIndexChange: (index: number | null) => void
  /** Nama pemilik galeri; judul modal untuk foto tanpa keterangan. */
  namaPemilik: string
}

/** Modal pratinjau galeri: foto besar bertinggi tetap, strip thumbnail untuk pindah foto, ←/→ di keyboard (tanpa wrap). */
export default function GaleriFotoLightbox({ foto, index, onIndexChange, namaPemilik }: Props) {
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])
  const indexSebelumnya = useRef<number | null>(null)
  const kurangiGerak = useReducedMotion()
  const total = foto.length
  const terbuka = index !== null && foto[index] !== undefined
  // Foto terakhir tetap dirender selama animasi tutup, agar modal tidak menciut ke kepala saja sebelum hilang.
  const [terakhir, setTerakhir] = useState<number | null>(index)
  if (terbuka && index !== terakhir) setTerakhir(index)
  const tampil = terbuka ? index : terakhir
  const aktif = tampil === null ? null : (foto[tampil] ?? null)

  // Thumbnail aktif digeser ke tengah strip (sejalan dengan scroll-snap center; 'nearest' ditarik balik oleh snap
  // sehingga thumbnail di tepi terpotong). Saat modal baru dibuka langsung lompat (tanpa animasi).
  useEffect(() => {
    const baruDibuka = indexSebelumnya.current === null
    indexSebelumnya.current = index
    if (index === null) return
    thumbRefs.current[index]?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: baruDibuka || kurangiGerak ? 'auto' : 'smooth',
    })
  }, [index, kurangiGerak])

  const pilih = (i: number) => {
    if (i !== index) onIndexChange(i)
  }
  const langkah = (delta: -1 | 1) => {
    if (index !== null) pilih(langkahFoto(index, delta, total))
  }

  // Didengar di window: fokus bisa di tombol tutup (kepala modal), bukan hanya di isi.
  useWindowEvent('keydown', (event) => {
    if (!terbuka || total < 2 || event.isComposing || event.defaultPrevented) return
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    langkah(event.key === 'ArrowLeft' ? -1 : 1)
  })

  return (
    <Modal
      opened={terbuka}
      onClose={() => onIndexChange(null)}
      size="xl"
      centered
      radius="lg"
      classNames={{ content: s.content }}
      title={<Text fw={600}>{aktif?.keterangan ?? namaPemilik}</Text>}
    >
      {aktif && tampil !== null && (
        <>
          <div className={s.stage} data-testid="galeri-foto-stage">
            <Image className={s.stageImg} src={aktif.image.link} alt={altFoto(aktif, tampil, namaPemilik)} fit="contain" />
            {total > 1 && (
              <>
                <button
                  type="button"
                  className={`${s.nav} ${s.navPrev}`}
                  aria-label={T.sebelumnya}
                  aria-disabled={tampil === 0 || undefined}
                  onClick={() => langkah(-1)}
                >
                  <IconChevronLeft size={22} stroke={2} aria-hidden />
                </button>
                <button
                  type="button"
                  className={`${s.nav} ${s.navNext}`}
                  aria-label={T.berikutnya}
                  aria-disabled={tampil === total - 1 || undefined}
                  onClick={() => langkah(1)}
                >
                  <IconChevronRight size={22} stroke={2} aria-hidden />
                </button>
              </>
            )}
          </div>

          {total > 1 && (
            <div className={s.strip} role="group" aria-label={T.stripLabel} data-testid="galeri-foto-strip">
              {foto.map((f, i) => (
                <button
                  key={f.id}
                  ref={(el) => {
                    thumbRefs.current[i] = el
                  }}
                  type="button"
                  className={s.thumb}
                  aria-current={i === tampil ? 'true' : undefined}
                  aria-label={T.lihatFotoKe(i + 1, total)}
                  onClick={() => pilih(i)}
                  data-testid="galeri-foto-thumb"
                >
                  <Image className={s.thumbImg} src={f.image.link} alt="" fit="cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {aktif.keterangan && (
            <Text className={s.caption} fz="sm">
              {aktif.keterangan}
            </Text>
          )}
        </>
      )}
    </Modal>
  )
}
