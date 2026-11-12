'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateBumdes from '@/app/admin/(dashboard)/_state/ekonomi/bumdes/bumdes';
import colors from '@/con/colors';
import { MAX_FOTO_GALERI } from '@/lib/bumdes-foto-profil';
import { Alert, Box, Group, Paper, Skeleton, Text, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BumdesDropzone from './BumdesDropzone';
import GaleriFotoAdminGrid from './GaleriFotoAdminGrid';

/** Section admin "Galeri Foto" di bawah form Profil BUMDes: unggah banyak foto, keterangan, urutan, hapus. */
export default function GaleriFotoBumdesAdmin({ profilTersimpan }: { profilTersimpan: boolean }) {
  const galeri = useProxy(stateBumdes.fotoProfil);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    void stateBumdes.fotoProfil.load();
  }, []);

  const foto = galeri.data ?? [];
  const penuh = foto.length >= MAX_FOTO_GALERI;

  const handleDelete = async () => {
    if (!deleteId) return;
    const ok = await stateBumdes.fotoProfil.remove(deleteId);
    if (ok) setDeleteId(null);
  };

  return (
    <Paper withBorder bg={colors['white-1']} p="lg" radius="md" shadow="sm" mt="lg" w={{ base: '100%', md: '70%' }}>
      <Group justify="space-between" align="baseline" mb={4}>
        <Title order={4}>Galeri Foto</Title>
        <Text fz="xs" c="dimmed">{foto.length}/{MAX_FOTO_GALERI} foto</Text>
      </Group>
      <Text fz="sm" c="dimmed" mb="md">
        Foto kegiatan dan unit usaha BUMDes, tampil sebagai galeri di halaman publik. Foto / Logo di atas tetap dipakai sebagai gambar utama.
      </Text>

      {!profilTersimpan ? (
        <Alert color="yellow" icon={<IconInfoCircle size={18} />} mb="md">
          Isi dan simpan profil BUMDes dulu sebelum menambah galeri foto.
        </Alert>
      ) : (
        <BumdesDropzone
          multiple
          disabled={penuh}
          loading={galeri.uploading}
          title={penuh ? `Galeri sudah berisi ${MAX_FOTO_GALERI} foto` : 'Seret beberapa foto ke sini atau klik untuk memilih'}
          onDrop={(files) => void stateBumdes.fotoProfil.upload(files)}
        />
      )}

      <Box mt="md">
        {!galeri.loaded ? (
          <Skeleton height={160} radius="md" />
        ) : (
          <GaleriFotoAdminGrid
            foto={foto}
            savingId={galeri.savingId}
            moveLocked={galeri.reordering}
            onSaveKeterangan={(id, keterangan) => void stateBumdes.fotoProfil.saveKeterangan(id, keterangan)}
            onMove={(index, direction) => void stateBumdes.fotoProfil.move(index, direction)}
            onDelete={setDeleteId}
          />
        )}
      </Box>

      <ModalKonfirmasiHapus
        opened={deleteId !== null}
        loading={galeri.deleting}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        text="Apakah Anda yakin ingin menghapus foto ini dari galeri?"
      />
    </Paper>
  );
}
