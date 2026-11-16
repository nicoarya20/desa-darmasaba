'use client'
import GaleriFotoAdmin from '@/app/admin/(dashboard)/_com/konten-bersama/galeri-foto.admin';
import StrukturPengurusAdmin from '@/app/admin/(dashboard)/_com/konten-bersama/struktur-pengurus.admin';
import { fotoKegiatanPustu, pengurusPustu } from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/pustu.anak.state';
import colors from '@/con/colors';
import { LABEL_PUSTU_SINGKAT } from '@/lib/pustu/pustu.label';
import { MAX_FOTO_PUSTU, MAX_PENGURUS_PUSTU } from '@/lib/pustu/pustu.validation';
import { Paper } from '@mantine/core';
import { useEffect } from 'react';

/** Section admin struktur organisasi + galeri satu PUSTU (disimpan langsung per aksi). */
export default function PustuAnakAdmin({ pustuId }: { pustuId: string }) {
  useEffect(() => {
    void pengurusPustu.load(pustuId);
    void fotoKegiatanPustu.load(pustuId);
  }, [pustuId]);

  return (
    <>
      <Paper w={{ base: '100%', md: '70%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder mt="lg">
        <StrukturPengurusAdmin state={pengurusPustu} max={MAX_PENGURUS_PUSTU} judul={`Struktur ${LABEL_PUSTU_SINGKAT}`} />
      </Paper>
      <Paper w={{ base: '100%', md: '70%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder mt="lg">
        <GaleriFotoAdmin
          state={fotoKegiatanPustu}
          max={MAX_FOTO_PUSTU}
          judul={`Galeri ${LABEL_PUSTU_SINGKAT}`}
          deskripsi="Foto lokasi, fasilitas pendukung, dan kegiatan; tampil di bagian Galeri halaman publik. Foto yang dihapus tidak bisa dipulihkan."
        />
      </Paper>
    </>
  );
}
