'use client'
import GaleriFotoAdmin from '@/app/admin/(dashboard)/_com/konten-bersama/galeri-foto.admin';
import StrukturPengurusAdmin from '@/app/admin/(dashboard)/_com/konten-bersama/struktur-pengurus.admin';
import { fotoKegiatanBankSampah, pengurusBankSampah } from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.anak.state';
import colors from '@/con/colors';
import { MAX_FOTO_KEGIATAN_BANK_SAMPAH, MAX_PENGURUS_BANK_SAMPAH } from '@/lib/bank-sampah/bank-sampah.validation';
import { Paper } from '@mantine/core';
import { useEffect } from 'react';

/** Section admin pengurus + dokumentasi kegiatan satu bank sampah (disimpan langsung per aksi). */
export default function BankSampahAnakAdmin({ bankSampahId }: { bankSampahId: string }) {
  useEffect(() => {
    void pengurusBankSampah.load(bankSampahId);
    void fotoKegiatanBankSampah.load(bankSampahId);
  }, [bankSampahId]);

  return (
    <>
      <Paper w={{ base: '100%', md: '70%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder mt="lg">
        <StrukturPengurusAdmin state={pengurusBankSampah} max={MAX_PENGURUS_BANK_SAMPAH} judul="Struktur Pengurus" />
      </Paper>
      <Paper w={{ base: '100%', md: '70%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder mt="lg">
        <GaleriFotoAdmin
          state={fotoKegiatanBankSampah}
          max={MAX_FOTO_KEGIATAN_BANK_SAMPAH}
          deskripsi="Foto kegiatan bank sampah, tampil di tab Dokumentasi pada halaman publik. Foto yang dihapus tidak bisa dipulihkan."
        />
      </Paper>
    </>
  );
}
