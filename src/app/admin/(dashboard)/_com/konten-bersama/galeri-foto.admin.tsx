'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import type { DaftarAnakState } from '@/app/admin/(dashboard)/_state/konten-bersama/daftar-anak.state';
import type { FotoGaleriItem } from '@/lib/konten-bersama/konten-bersama.types';
import { Box, Group, Skeleton, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import GaleriFotoAdminGrid from './galeri-foto.admin-grid';
import GambarDropzone from './gambar.dropzone';

type Props = {
  state: DaftarAnakState<FotoGaleriItem>;
  /** Batas jumlah foto galeri domain ini. */
  max: number;
  judul?: string;
  deskripsi?: string;
};

/** Section admin galeri foto kegiatan (semua domain): unggah banyak, keterangan, urutan, hapus permanen. */
export default function GaleriFotoAdmin({ state, max, judul = 'Dokumentasi Kegiatan', deskripsi }: Props) {
  const snap = useSnapshot(state);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const foto = snap.data as readonly FotoGaleriItem[];
  const penuh = foto.length >= max;

  const handleDelete = async () => {
    if (!deleteId) return;
    if (await state.hapus(deleteId)) setDeleteId(null);
  };

  return (
    <Box data-testid="galeri-foto-admin">
      <Group justify="space-between" align="baseline" mb={4}>
        <Title order={4}>{judul}</Title>
        <Text fz="xs" c="dimmed">{foto.length}/{max} foto</Text>
      </Group>
      {deskripsi && <Text fz="sm" c="dimmed" mb="md">{deskripsi}</Text>}

      <GambarDropzone
        multiple
        disabled={penuh}
        loading={snap.saving}
        title={penuh ? `Galeri sudah berisi ${max} foto` : 'Seret beberapa foto ke sini atau klik untuk memilih'}
        onDrop={(files) => void state.unggahFoto(files)}
      />

      <Box mt="md">
        {!snap.loaded ? (
          <Skeleton height={160} radius="md" />
        ) : (
          <GaleriFotoAdminGrid
            foto={foto}
            savingId={snap.savingId}
            moveLocked={snap.reordering}
            onSaveKeterangan={(id, keterangan) => void state.ubah(id, { keterangan })}
            onMove={(index, direction) => void state.geser(index, direction)}
            onDelete={setDeleteId}
          />
        )}
      </Box>

      <ModalKonfirmasiHapus
        opened={deleteId !== null}
        loading={snap.deleting}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        text="Foto akan dihapus permanen dan tidak bisa dipulihkan. Lanjutkan?"
      />
    </Box>
  );
}
