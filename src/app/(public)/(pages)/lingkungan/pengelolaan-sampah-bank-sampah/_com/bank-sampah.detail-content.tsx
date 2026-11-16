'use client'
import GaleriFoto from '@/app/(public)/_com/konten-bersama/galeri-foto.grid'
import KontenKosong from '@/app/(public)/_com/konten-bersama/konten-kosong'
import StrukturPengurusView from '@/app/(public)/_com/konten-bersama/struktur-pengurus.view'
import type { BankSampahDetail } from '@/lib/bank-sampah/bank-sampah.types'
import { Tabs } from '@mantine/core'
import { IconPhoto, IconSitemap, IconUser } from '@tabler/icons-react'
import BankSampahProfilTab from './bank-sampah.profil-tab'

export type TabBankSampah = 'profil' | 'struktur' | 'dokumentasi'

type Props = {
  data: BankSampahDetail
  /** Tab yang terbuka pertama kali (default Profil). */
  tabAwal?: TabBankSampah
  /** Diteruskan ke galeri: pratinjau foto terbuka/tertutup. */
  onPreviewChange?: (terbuka: boolean) => void
}

/** Isi modal detail bank sampah: tab Profil, Struktur (bagan + pengurus), Dokumentasi (galeri kegiatan). */
export default function BankSampahDetailContent({ data, tabAwal = 'profil', onPreviewChange }: Props) {
  return (
    <Tabs defaultValue={tabAwal} keepMounted={false} data-testid="bank-sampah-detail">
      <Tabs.List mb="md">
        <Tabs.Tab value="profil" leftSection={<IconUser size={16} />}>Profil</Tabs.Tab>
        <Tabs.Tab value="struktur" leftSection={<IconSitemap size={16} />}>Struktur</Tabs.Tab>
        <Tabs.Tab value="dokumentasi" leftSection={<IconPhoto size={16} />}>Dokumentasi</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="profil">
        <BankSampahProfilTab data={data} />
      </Tabs.Panel>
      <Tabs.Panel value="struktur">
        <StrukturPengurusView bagan={data.fotoBaganStruktur} pengurus={data.pengurus} namaPemilik={data.name} />
      </Tabs.Panel>
      <Tabs.Panel value="dokumentasi">
        {data.fotoKegiatan.length === 0 ? (
          <KontenKosong pesan="Dokumentasi kegiatan belum tersedia." />
        ) : (
          <GaleriFoto
            foto={data.fotoKegiatan}
            namaPemilik={data.name}
            judul={null}
            ariaLabel={`Dokumentasi kegiatan ${data.name}`}
            testId="galeri-bank-sampah"
            onPreviewChange={onPreviewChange}
          />
        )}
      </Tabs.Panel>
    </Tabs>
  )
}
