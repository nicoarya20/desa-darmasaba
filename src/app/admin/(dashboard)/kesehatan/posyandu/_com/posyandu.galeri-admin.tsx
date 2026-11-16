'use client'
import GaleriFotoAdmin from '@/app/admin/(dashboard)/_com/konten-bersama/galeri-foto.admin';
import { fotoKegiatanPosyandu } from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu.anak.state';
import colors from '@/con/colors';
import { MAX_FOTO_KEGIATAN_POSYANDU } from '@/lib/posyandu/posyandu-konten.validation';
import { Alert, Paper } from '@mantine/core';
import { useEffect } from 'react';

const PAPER = { w: { base: '100%', md: '50%' }, bg: colors['white-1'], p: 'lg', radius: 'md', shadow: 'sm', withBorder: true, mt: 'lg' } as const;

/** Section admin galeri foto lokasi & kader satu posyandu (disimpan langsung per aksi). */
export default function PosyanduGaleriAdmin({ posyanduId }: { posyanduId: string }) {
  useEffect(() => {
    void fotoKegiatanPosyandu.load(posyanduId);
  }, [posyanduId]);

  return (
    <Paper {...PAPER}>
      <GaleriFotoAdmin
        state={fotoKegiatanPosyandu}
        max={MAX_FOTO_KEGIATAN_POSYANDU}
        judul="Galeri Foto Lokasi & Kader"
        deskripsi="Foto lokasi, kader, dan kegiatan posyandu; tampil di halaman detail posyandu. Foto yang dihapus tidak bisa dipulihkan."
      />
    </Paper>
  );
}

/** Info di halaman tambah: galeri butuh id posyandu, jadi diisi setelah data disimpan. */
export function PosyanduGaleriInfo() {
  return (
    <Paper {...PAPER}>
      <Alert color="blue" title="Galeri foto lokasi & kader">
        Simpan posyandu terlebih dahulu, lalu tambahkan foto galeri dari halaman edit.
      </Alert>
    </Paper>
  );
}
