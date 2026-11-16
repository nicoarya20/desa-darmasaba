'use client'
import PustuDetailBody from '@/app/(public)/(pages)/kesehatan/puskesmas/_com/detail/PustuDetailBody';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import colors from '@/con/colors';
import { LABEL_PUSTU_SINGKAT } from '@/lib/pustu/pustu.label';
import { Alert, Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import pustuState from '../../../_state/kesehatan/puskesmas/pustu.state';

/** Halaman admin detail PUSTU: tombol edit/hapus + pratinjau isi seperti di halaman publik. */
function DetailPuskesmas() {
  const id = useParams()?.id as string;
  const router = useRouter();
  const detail = useSnapshot(pustuState.findUnique);
  const [modalHapus, setModalHapus] = useState(false);

  useEffect(() => {
    if (id) void pustuState.findUnique.load(id);
  }, [id]);

  const handleHapus = async () => {
    setModalHapus(false);
    await pustuState.delete.byId(id);
    router.push('/admin/kesehatan/puskesmas');
  };

  const data = pustuState.findUnique.data;
  if (detail.gagal) return <Alert color="red" m="md">Data {LABEL_PUSTU_SINGKAT} tidak ditemukan atau gagal dimuat.</Alert>;
  if (detail.loading || !data || data.id !== id) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group justify="space-between" mb={15}>
        <Button variant="subtle" onClick={() => router.back()} leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}>
          Kembali
        </Button>
        <Group gap="sm">
          <Button color="red" variant="light" radius="md" leftSection={<IconTrash size={18} />} onClick={() => setModalHapus(true)}>
            Hapus
          </Button>
          <Button color="green" variant="light" radius="md" leftSection={<IconEdit size={18} />} onClick={() => router.push(`/admin/kesehatan/puskesmas/${id}/edit`)}>
            Edit
          </Button>
        </Group>
      </Group>
      <Paper withBorder w={{ base: '100%', md: '80%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm">
        <Text c="dimmed" fz="sm" mb="md">Pratinjau tampilan di halaman publik. Bagian yang belum diisi tidak ditampilkan.</Text>
        <div className={kabar.section} style={{ ...KABAR_BRAND_VARS, padding: 0 }}>
          <Stack gap="xl">
            <PustuDetailBody data={data} />
          </Stack>
        </div>
      </Paper>
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={() => void handleHapus()}
        text={`Apakah anda yakin ingin menghapus ${LABEL_PUSTU_SINGKAT} ini beserta struktur dan galerinya?`}
      />
    </Box>
  );
}

export default DetailPuskesmas;
