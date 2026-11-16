'use client'
import type { DaftarAnakState } from '@/app/admin/(dashboard)/_state/konten-bersama/daftar-anak.state';
import colors from '@/con/colors';
import type { FotoGaleriItem, PengurusItem } from '@/lib/konten-bersama/konten-bersama.types';
import { Paper } from '@mantine/core';
import { useEffect } from 'react';
import GaleriFotoAdmin from './galeri-foto.admin';
import StrukturPengurusAdmin from './struktur-pengurus.admin';

type Props = {
  /** Id entri induk yang sedang diedit. */
  parentId: string;
  pengurus: { state: DaftarAnakState<PengurusItem>; max: number; judul?: string };
  galeri: { state: DaftarAnakState<FotoGaleriItem>; max: number; deskripsi?: string };
};

/** Section halaman edit (semua domain): struktur pengurus + dokumentasi kegiatan, disimpan langsung per aksi. */
export default function DaftarAnakAdminSection({ parentId, pengurus, galeri }: Props) {
  useEffect(() => {
    void pengurus.state.load(parentId);
    void galeri.state.load(parentId);
  }, [parentId, pengurus.state, galeri.state]);

  return (
    <>
      <Paper w={{ base: '100%', md: '70%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder mt="lg">
        <StrukturPengurusAdmin state={pengurus.state} max={pengurus.max} judul={pengurus.judul} />
      </Paper>
      <Paper w={{ base: '100%', md: '70%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder mt="lg">
        <GaleriFotoAdmin state={galeri.state} max={galeri.max} deskripsi={galeri.deskripsi} />
      </Paper>
    </>
  );
}
