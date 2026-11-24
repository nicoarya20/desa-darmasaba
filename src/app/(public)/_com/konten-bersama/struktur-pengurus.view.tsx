import type { GambarRingkas, PengurusItem } from '@/lib/konten-bersama/konten-bersama.types'
import { Anchor, Image, SimpleGrid, Stack } from '@mantine/core'
import kartu from '../struktur-organisasi/struktur-card.module.css'
import { STRUKTUR_VARS } from '../struktur-organisasi/struktur.meta'
import KontenKosong from './konten-kosong'
import s from './struktur-pengurus.module.css'

type Props = {
  /** Foto bagan struktur organisasi (opsional). */
  bagan: GambarRingkas | null
  pengurus: readonly PengurusItem[]
  /** Nama pemilik struktur, untuk alt gambar bagan. */
  namaPemilik: string
}

/**
 * Satu pengurus dalam gaya kartu ringkas bagan Perangkat Desa (`StrukturCard size="xs"`): jabatan huruf kapital
 * di atas, foto bulat kecil (bila ada) + pil nama di bawah. Kelas dipakai ulang dari struktur-card.module.css agar
 * warna & tipografi satu sumber. Bukan tautan (pengurus tak punya halaman profil); tanpa foto → tanpa lingkaran inisial.
 */
function KartuPengurus({ p }: { p: PengurusItem }) {
  const foto = p.image?.link ?? null
  return (
    <div className={`${kartu.card} ${s.card}`} data-size="xs" data-tone="1" data-no-photo={!foto || undefined} data-testid="pengurus-card">
      <div className={kartu.cardText}>
        <p className={kartu.role}>{p.jabatan}</p>
        <p className={kartu.name}>{p.nama}</p>
      </div>
      {foto && (
        <div className={kartu.photo}>
          <Image src={foto} alt="" className={kartu.photoImage} loading="lazy" decoding="async" />
        </div>
      )}
    </div>
  )
}

/** Struktur organisasi publik: foto bagan (bila ada) lalu kartu pengurus; keduanya kosong → state kosong. */
export default function StrukturPengurusView({ bagan, pengurus, namaPemilik }: Props) {
  if (!bagan && pengurus.length === 0) return <KontenKosong pesan="Struktur organisasi belum tersedia." />
  return (
    <Stack gap="md" className={s.root} style={STRUKTUR_VARS} data-testid="struktur-pengurus-view">
      {bagan && (
        <Anchor href={bagan.link} target="_blank" rel="noopener noreferrer" underline="never" aria-label="Buka bagan struktur ukuran penuh">
          <Image src={bagan.link} alt={`Bagan struktur organisasi ${namaPemilik}`} radius="md" fit="contain" mah={420} />
        </Anchor>
      )}
      {pengurus.length > 0 && (
        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
          {pengurus.map((p) => (
            <KartuPengurus key={p.id} p={p} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}
